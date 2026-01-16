#!/usr/bin/env node
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { readFileSync } from 'fs';

// Load .env file manually
const envFile = readFileSync('.env', 'utf-8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
});

const GMR_ABI = [
  { name: 'paused', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'bool' }] },
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
];

const LEADERBOARD_ABI = [
  { name: 'paused', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'bool' }] },
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
  { name: 'authorizedUpdaters', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'getScores', type: 'function', stateMutability: 'view', inputs: [{ name: 'offset', type: 'uint256' }, { name: 'limit', type: 'uint256' }], outputs: [{ name: '', type: 'tuple[]', components: [{ name: 'user', type: 'address' }, { name: 'score', type: 'uint256' }] }, { name: 'total', type: 'uint256' }] },
];

const RESET_STRIKES_ABI = [
  { name: 'paused', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'bool' }] },
  { name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
  { name: 'usdCostInCents', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'priceFeed', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
];

const GMR_ADDRESS = process.env.VITE_BASE_GMR_ADDRESS;
const LEADERBOARD_ADDRESS = process.env.VITE_BASE_LEADERBOARD_ADDRESS;
const RESET_STRIKES_ADDRESS = process.env.VITE_BASE_RESET_STRIKES_ADDRESS;
const BACKEND_ADDRESS = process.env.SENDER_ADDRESS;

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_RPC_URL || 'https://sepolia.base.org'),
});

async function checkContract(name, address, abi, extraChecks = null) {
  console.log(`\n📋 ${name}`);
  console.log(`   Address: ${address}`);
  
  try {
    const [owner, paused] = await Promise.all([
      client.readContract({ address, abi, functionName: 'owner' }),
      client.readContract({ address, abi, functionName: 'paused' }),
    ]);

    console.log(`   Owner:   ${owner}`);
    console.log(`   Status:  ${paused ? '⏸️  PAUSED' : '✅ ACTIVE'}`);

    if (extraChecks) {
      await extraChecks(address, abi);
    }

    // Check balance
    const balance = await client.getBalance({ address });
    console.log(`   Balance: ${formatEther(balance)} ETH`);

    return { success: true, paused, owner };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkLeaderboard(address, abi) {
  const isAuthorized = await client.readContract({
    address,
    abi,
    functionName: 'authorizedUpdaters',
    args: [BACKEND_ADDRESS],
  });
  console.log(`   Backend: ${isAuthorized ? '✅ AUTHORIZED' : '❌ NOT AUTHORIZED'}`);

  const [scores, total] = await client.readContract({
    address,
    abi,
    functionName: 'getScores',
    args: [0n, 5n],
  });
  console.log(`   Players: ${total.toString()}`);
  if (scores.length > 0) {
    console.log(`   Top Score: ${scores[0].score.toString()}`);
  }
}

async function checkResetStrikes(address, abi) {
  const [costCents, priceFeed] = await Promise.all([
    client.readContract({ address, abi, functionName: 'usdCostInCents' }),
    client.readContract({ address, abi, functionName: 'priceFeed' }),
  ]);
  console.log(`   Cost:    $${(Number(costCents) / 100).toFixed(2)} USD`);
  console.log(`   Feed:    ${priceFeed}`);
}

async function monitor() {
  console.log('🔍 Contract Health Check - Base Sepolia');
  console.log('═'.repeat(60));

  if (!GMR_ADDRESS || !LEADERBOARD_ADDRESS || !RESET_STRIKES_ADDRESS) {
    console.error('\n❌ Missing contract addresses in .env');
    process.exit(1);
  }

  const results = await Promise.all([
    checkContract('GMR', GMR_ADDRESS, GMR_ABI),
    checkContract('Leaderboard', LEADERBOARD_ADDRESS, LEADERBOARD_ABI, checkLeaderboard),
    checkContract('ResetStrikes', RESET_STRIKES_ADDRESS, RESET_STRIKES_ABI, checkResetStrikes),
  ]);

  console.log('\n' + '═'.repeat(60));
  const allSuccess = results.every(r => r.success);
  const anyPaused = results.some(r => r.paused);

  if (allSuccess && !anyPaused) {
    console.log('✅ All contracts operational');
  } else if (allSuccess && anyPaused) {
    console.log('⚠️  Some contracts are paused');
  } else {
    console.log('❌ Some contracts have errors');
  }

  console.log(`\n🕐 ${new Date().toISOString()}`);
  return allSuccess;
}

// Run once or continuously
const continuous = process.argv.includes('--watch');

if (continuous) {
  console.log('👀 Watching contracts (every 30s)...\n');
  monitor();
  setInterval(monitor, 30000);
} else {
  monitor().then(success => process.exit(success ? 0 : 1));
}
