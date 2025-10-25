import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { monadTestnet, monad } from './contracts'

// Re-export for convenience
export { monadTestnet, monad }

export const config = createConfig({
  chains: [base, monadTestnet],
  connectors: [injected()], // Only injected connector for Farcaster
  transports: {
    [base.id]: http(),
    [monadTestnet.id]: http(),
  },
  ssr: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}