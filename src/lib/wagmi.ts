import { http, createConfig } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Define the Monad chain manually
export const monad = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MONAD',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
  testnet: true,
};

console.log('WAGMI Config Loaded:', { base, mainnet, monad });

export const config = createConfig({
  chains: [mainnet, base, monad],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [monad.id]: http(),
  },
});
