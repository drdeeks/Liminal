#!/usr/bin/env node
// Contract Event Monitor for Liminal
import { createPublicClient, http, parseAbiItem } from 'viem'
import { baseSepolia } from 'viem/chains'

const CONTRACTS = {
  gmr: '0x754f4Dd925226b223faD1cdC5A2777979c2Fb9A2',
  leaderboard: '0xb558b8a32915b2871A3a4Ca3Ea3fdFfc5912e0B5',
  resetStrikes: '0xF395fb9D88b1798EcA6c0d1C4a57335A12DB1608',
}

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
})

const EVENTS = {
  // Leaderboard
  ScoreUpdated: parseAbiItem('event ScoreUpdated(address indexed user, uint256 newTotalScore)'),
  UpdaterAuthorized: parseAbiItem('event UpdaterAuthorized(address indexed updater)'),
  UpdaterRevoked: parseAbiItem('event UpdaterRevoked(address indexed updater)'),
  
  // ResetStrikes
  StrikesReset: parseAbiItem('event StrikesReset(address indexed user, uint256 ethPaid)'),
  
  // GMR
  Gm: parseAbiItem('event Gm(address indexed user, uint256 timestamp)'),
  
  // Owned (all contracts)
  OwnershipTransferStarted: parseAbiItem('event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)'),
  OwnershipTransferred: parseAbiItem('event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)'),
  
  // Pausable (all contracts)
  Paused: parseAbiItem('event Paused(address account)'),
  Unpaused: parseAbiItem('event Unpaused(address account)'),
}

async function monitorEvents() {
  console.log('🔍 Liminal Contract Monitor Started')
  console.log('Network: Base Sepolia')
  console.log('Contracts:', CONTRACTS)
  console.log('---')

  const unwatch = client.watchEvent({
    onLogs: (logs) => {
      logs.forEach((log) => {
        const timestamp = new Date().toISOString()
        const contract = Object.entries(CONTRACTS).find(([_, addr]) => 
          addr.toLowerCase() === log.address.toLowerCase()
        )?.[0] || 'unknown'

        console.log(`\n[${timestamp}] ${contract.toUpperCase()}`)
        console.log(`Event: ${log.topics[0]}`)
        console.log(`Block: ${log.blockNumber}`)
        console.log(`Tx: ${log.transactionHash}`)
        
        // Decode based on event signature
        try {
          if (log.topics[0] === EVENTS.ScoreUpdated.topics[0]) {
            console.log(`✅ Score Updated - User: ${log.topics[1]}, Score: ${log.data}`)
          } else if (log.topics[0] === EVENTS.StrikesReset.topics[0]) {
            console.log(`💰 Strikes Reset - User: ${log.topics[1]}, ETH Paid: ${log.data}`)
          } else if (log.topics[0] === EVENTS.Gm.topics[0]) {
            console.log(`👋 GM - User: ${log.topics[1]}`)
          } else if (log.topics[0] === EVENTS.OwnershipTransferStarted.topics[0]) {
            console.log(`⚠️  OWNERSHIP TRANSFER INITIATED - From: ${log.topics[1]}, To: ${log.topics[2]}`)
          } else if (log.topics[0] === EVENTS.OwnershipTransferred.topics[0]) {
            console.log(`🔐 OWNERSHIP TRANSFERRED - From: ${log.topics[1]}, To: ${log.topics[2]}`)
          } else if (log.topics[0] === EVENTS.Paused.topics[0]) {
            console.log(`⏸️  CONTRACT PAUSED`)
          } else if (log.topics[0] === EVENTS.Unpaused.topics[0]) {
            console.log(`▶️  CONTRACT UNPAUSED`)
          } else if (log.topics[0] === EVENTS.UpdaterAuthorized.topics[0]) {
            console.log(`✅ Updater Authorized: ${log.topics[1]}`)
          } else if (log.topics[0] === EVENTS.UpdaterRevoked.topics[0]) {
            console.log(`❌ Updater Revoked: ${log.topics[1]}`)
          }
        } catch (e) {
          console.log('Raw log:', log)
        }
      })
    },
    address: Object.values(CONTRACTS),
    events: Object.values(EVENTS),
  })

  console.log('\n✅ Monitoring active. Press Ctrl+C to stop.\n')

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping monitor...')
    unwatch()
    process.exit(0)
  })
}

monitorEvents().catch(console.error)
