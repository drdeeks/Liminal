// src/lib/contracts.ts
import { base, baseSepolia } from 'viem/chains'

// Monad Mainnet chain config
export const monadMainnet = {
  id: 34443,
  name: 'Monad',
  network: 'monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' },
  },
  testnet: false,
} as const

export const monad = monadMainnet

// Contract addresses - Base Mainnet (DEFAULT)
const BASE_GMR = (import.meta.env.VITE_BASE_GMR_ADDRESS || '') as `0x${string}`
const BASE_LEADERBOARD = (import.meta.env.VITE_BASE_LEADERBOARD_ADDRESS || '') as `0x${string}`
const BASE_RESET_STRIKES = (import.meta.env.VITE_BASE_RESET_STRIKES_ADDRESS || '') as `0x${string}`

// Contract addresses - Base Sepolia (FALLBACK)
const BASE_SEPOLIA_GMR = '0x754f4Dd925226b223faD1cdC5A2777979c2Fb9A2' as `0x${string}`
const BASE_SEPOLIA_LEADERBOARD = '0xb558b8a32915b2871A3a4Ca3Ea3fdFfc5912e0B5' as `0x${string}`
const BASE_SEPOLIA_RESET_STRIKES = '0xF395fb9D88b1798EcA6c0d1C4a57335A12DB1608' as `0x${string}`

// Monad Mainnet
const MONAD_GMR = (import.meta.env.VITE_MONAD_GMR_ADDRESS || '') as `0x${string}`
const MONAD_LEADERBOARD = (import.meta.env.VITE_MONAD_LEADERBOARD_ADDRESS || '') as `0x${string}`
const MONAD_RESET_STRIKES = (import.meta.env.VITE_MONAD_RESET_STRIKES_ADDRESS || '') as `0x${string}`

// Updated ABIs for new contracts
const GMR_ABI = [
  {
    name: 'gm',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const leaderboardAbi = [
  {
    name: 'updateScore',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: '_scoreToAdd', type: 'uint256' }
    ],
    outputs: [],
  },
  {
    name: 'getScores',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' }
    ],
    outputs: [
      { 
        name: '', 
        type: 'tuple[]',
        components: [
          { name: 'user', type: 'address' },
          { name: 'score', type: 'uint256' }
        ]
      },
      { name: 'total', type: 'uint256' }
    ],
  },
  {
    name: 'getScore',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'authorizedUpdaters',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
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
    inputs: [
      { name: 'page', type: 'uint256' },
      { name: 'pageSize', type: 'uint256' }
    ],
    outputs: [
      { 
        name: '', 
        type: 'tuple[]',
        components: [
          { name: 'user', type: 'address' },
          { name: 'score', type: 'uint256' }
        ]
      }
    ],
  },
] as const

const RESET_STRIKES_ABI = [
  {
    name: 'resetStrikes',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'usdCostInCents',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const gmrAbi = GMR_ABI
export const resetStrikesAbi = RESET_STRIKES_ABI

export const leaderboardAddress = {
  [monadMainnet.id]: MONAD_LEADERBOARD,
  [base.id]: BASE_LEADERBOARD,
  [baseSepolia.id]: BASE_SEPOLIA_LEADERBOARD,
} as const

export const gmrAddress = {
  [monadMainnet.id]: MONAD_GMR,
  [base.id]: BASE_GMR,
  [baseSepolia.id]: BASE_SEPOLIA_GMR,
} as const

export const resetStrikesAddress = {
  [monadMainnet.id]: MONAD_RESET_STRIKES,
  [base.id]: BASE_RESET_STRIKES,
  [baseSepolia.id]: BASE_SEPOLIA_RESET_STRIKES,
} as const

export const contracts = {
  monad: {
    gmr: { address: MONAD_GMR, abi: GMR_ABI },
    leaderboard: { address: MONAD_LEADERBOARD, abi: leaderboardAbi },
    resetStrikes: { address: MONAD_RESET_STRIKES, abi: RESET_STRIKES_ABI },
  },
  base: {
    gmr: { address: BASE_GMR, abi: GMR_ABI },
    leaderboard: { address: BASE_LEADERBOARD, abi: leaderboardAbi },
    resetStrikes: { address: BASE_RESET_STRIKES, abi: RESET_STRIKES_ABI },
    aggregatorV3: { 
      address: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70' as `0x${string}`, 
      abi: [
        {
          name: 'latestRoundData',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [
            { name: 'roundId', type: 'uint80' },
            { name: 'answer', type: 'int256' },
            { name: 'startedAt', type: 'uint256' },
            { name: 'updatedAt', type: 'uint256' },
            { name: 'answeredInRound', type: 'uint80' }
          ],
        }
      ] as const
    },
  },
  baseSepolia: {
    gmr: { address: BASE_SEPOLIA_GMR, abi: GMR_ABI },
    leaderboard: { address: BASE_SEPOLIA_LEADERBOARD, abi: leaderboardAbi },
    resetStrikes: { address: BASE_SEPOLIA_RESET_STRIKES, abi: RESET_STRIKES_ABI },
    aggregatorV3: { 
      address: '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1' as `0x${string}`, 
      abi: [
        {
          name: 'latestRoundData',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [
            { name: 'roundId', type: 'uint80' },
            { name: 'answer', type: 'int256' },
            { name: 'startedAt', type: 'uint256' },
            { name: 'updatedAt', type: 'uint256' },
            { name: 'answeredInRound', type: 'uint80' }
          ],
        }
      ] as const
    },
  },
} as const