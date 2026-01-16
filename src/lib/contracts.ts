// src/lib/contracts.ts
import { base } from 'viem/chains'

// Custom Monad chain config
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_MONAD_RPC_URL || 'https://testnet.monad.xyz'] },
    public: { http: [import.meta.env.VITE_MONAD_RPC_URL || 'https://testnet.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.testnet.monad.xyz' },
  },
  testnet: true,
} as const

// Export alias for backward compatibility
export const monad = monadTestnet

// Contract addresses - UPDATE WITH YOUR ACTUAL ADDRESSES
const MONAD_LEADERBOARD_ADDRESS = (import.meta.env.VITE_MONAD_LEADERBOARD_ADDRESS || '0xE8Fe08837EC1Cc21b03EA57776400518c240c500') as `0x${string}`
const BASE_LEADERBOARD_ADDRESS = (import.meta.env.VITE_BASE_LEADERBOARD_ADDRESS || '') as `0x${string}`
const MONAD_GMR_ADDRESS = (import.meta.env.VITE_MONAD_GMR_ADDRESS || '0x227432663102E95AE51A13118A5de5a664039bEc') as `0x${string}`
const BASE_GMR_ADDRESS = (import.meta.env.VITE_BASE_GMR_ADDRESS || '') as `0x${string}`
const MONAD_RESET_STRIKES_ADDRESS = (import.meta.env.VITE_MONAD_RESET_STRIKES_ADDRESS || '0x7B23d318c6b74A50381c9Be4343595D061121F33') as `0x${string}`
const BASE_RESET_STRIKES_ADDRESS = (import.meta.env.VITE_BASE_RESET_STRIKES_ADDRESS || '') as `0x${string}`

// Minimal ABIs - Only include functions you actually use
const GMR_MINIMAL_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const leaderboardAbi = [
  {
    name: 'submitScore',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'score', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getTopScores',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'count', type: 'uint256' }],
    outputs: [{ name: '', type: 'tuple[]' }],
  },
  {
    name: 'getPlayerCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getLeaderboard',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'offset', type: 'uint256' }, { name: 'limit', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }, { name: '', type: 'uint256[]' }],
  },
] as const

const RESET_STRIKES_MINIMAL_ABI = [
  {
    name: 'resetStrikes',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'getResetCost',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const AGGREGATOR_V3_INTERFACE_ABI = [
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "description",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint80",
        "name": "_roundId",
        "type": "uint80"
      }
    ],
    "name": "getRoundData",
    "outputs": [
      {
        "internalType": "uint80",
        "name": "roundId",
        "type": "uint80"
      },
      {
        "internalType": "int256",
        "name": "answer",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "startedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "updatedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint80",
        "name": "answeredInRound",
        "type": "uint80"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      {
        "internalType": "uint80",
        "name": "roundId",
        "type": "uint80"
      },
      {
        "internalType": "int256",
        "name": "answer",
        "type": "int256"
      },
       {
        "internalType": "uint256",
        "name": "startedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "updatedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint80",
        "name": "answeredInRound",
        "type": "uint80"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "version",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Export ABIs
export const gmrAbi = GMR_MINIMAL_ABI
export const resetStrikesAbi = RESET_STRIKES_MINIMAL_ABI

// Export address mappings
export const leaderboardAddress = {
  [monadTestnet.id]: MONAD_LEADERBOARD_ADDRESS,
  [base.id]: BASE_LEADERBOARD_ADDRESS,
} as const

export const gmrAddress = {
  [monadTestnet.id]: MONAD_GMR_ADDRESS,
  [base.id]: BASE_GMR_ADDRESS,
} as const

export const resetStrikesAddress = {
  [monadTestnet.id]: MONAD_RESET_STRIKES_ADDRESS,
  [base.id]: BASE_RESET_STRIKES_ADDRESS,
} as const

// Grouped contracts export
export const contracts = {
  monad: {
    gmr: {
      address: MONAD_GMR_ADDRESS,
      abi: GMR_MINIMAL_ABI,
    },
    leaderboard: {
      address: MONAD_LEADERBOARD_ADDRESS,
      abi: leaderboardAbi,
    },
    resetStrikes: {
      address: MONAD_RESET_STRIKES_ADDRESS,
      abi: RESET_STRIKES_MINIMAL_ABI,
    },
    aggregatorV3: {
      address: '0x0c76859E85727683Eeba0C70Bc2e0F5781337818', // Monad ETH/USD Price Feed
      abi: AGGREGATOR_V3_INTERFACE_ABI,
    },
  },
  base: {
    gmr: {
      address: BASE_GMR_ADDRESS,
      abi: GMR_MINIMAL_ABI,
    },
    leaderboard: {
      address: BASE_LEADERBOARD_ADDRESS,
      abi: leaderboardAbi,
    },
    resetStrikes: {
      address: BASE_RESET_STRIKES_ADDRESS,
      abi: RESET_STRIKES_MINIMAL_ABI,
    },
    aggregatorV3: {
      address: '0x4aDC67696bA383F43DD60A9eA083f33224687279', // Base ETH/USD Price Feed
      abi: AGGREGATOR_V3_INTERFACE_ABI,
    },
  },
} as const