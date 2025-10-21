import { http, createConfig } from 'wagmi';
import { base, Chain } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const monad = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MONAD', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
} as const satisfies Chain;

export const config = createConfig({
  chains: [base, monad],
  connectors: [
    injected(),
  ],
  transports: {
    [base.id]: http(),
    [monad.id]: http(),
  },
});
