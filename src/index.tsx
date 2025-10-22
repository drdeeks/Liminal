import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './index.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { config } from './lib/wagmi';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthKitProvider>
          <App />
        </AuthKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
