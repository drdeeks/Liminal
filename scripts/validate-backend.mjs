#!/usr/bin/env node
import { createPublicClient, http } from 'viem';
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

const LEADERBOARD_ABI = [
  {
    name: 'authorizedUpdaters',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
];

const LEADERBOARD_ADDRESS = process.env.VITE_BASE_LEADERBOARD_ADDRESS;
const BACKEND_ADDRESS = process.env.SENDER_ADDRESS;

if (!LEADERBOARD_ADDRESS) {
  console.error('❌ VITE_BASE_LEADERBOARD_ADDRESS not set in .env');
  process.exit(1);
}

if (!BACKEND_ADDRESS) {
  console.error('❌ SENDER_ADDRESS not set in .env');
  process.exit(1);
}

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_RPC_URL || 'https://sepolia.base.org'),
});

async function validateBackend() {
  console.log('🔍 Validating Backend Authorization...\n');
  console.log(`Leaderboard: ${LEADERBOARD_ADDRESS}`);
  console.log(`Backend:     ${BACKEND_ADDRESS}\n`);

  try {
    // Check owner
    const owner = await client.readContract({
      address: LEADERBOARD_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: 'owner',
    });
    console.log(`✅ Contract Owner: ${owner}`);

    // Check if backend is authorized
    const isAuthorized = await client.readContract({
      address: LEADERBOARD_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: 'authorizedUpdaters',
      args: [BACKEND_ADDRESS],
    });

    if (isAuthorized) {
      console.log(`✅ Backend ${BACKEND_ADDRESS} is AUTHORIZED`);
      console.log('\n✨ Backend validation successful!');
      return true;
    } else {
      console.log(`❌ Backend ${BACKEND_ADDRESS} is NOT AUTHORIZED`);
      console.log('\n⚠️  To authorize the backend, run:');
      console.log(`   cast send ${LEADERBOARD_ADDRESS} "authorizeUpdater(address)" ${BACKEND_ADDRESS} --rpc-url $BASE_RPC_URL --keystore <path>`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error validating backend:', error.message);
    return false;
  }
}

validateBackend().then(success => {
  process.exit(success ? 0 : 1);
});
