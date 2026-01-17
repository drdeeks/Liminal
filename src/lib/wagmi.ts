import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { monadMainnet, monad } from './contracts'

// Re-export for convenience
export { monadMainnet, monad }

export const config = createConfig({
  chains: [base, baseSepolia, monadMainnet],
  connectors: [injected()], // Only injected connector for Farcaster
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [monadMainnet.id]: http(),
  },
  ssr: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}