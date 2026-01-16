# Liminal: A Farcaster Mini App

A fast-paced arcade game testing reflexes in an atmospheric, ever-changing world. Built as a **Farcaster Mini App** with on-chain leaderboards on Base Sepolia.

## Features

- **Farcaster Native** - Play directly from your Farcaster feed
- **Dynamic Difficulty** - Speed and complexity increase as you progress
- **Atmospheric Experience** - Visuals and audio evolve with score milestones
- **Joker Cards** - Swipe opposite direction for special cards
- **On-Chain Leaderboard** - Compete globally on Base Sepolia
- **Reset Strikes Power-up** - Second chance for $0.05 USD in ETH

## Quick Start

### Prerequisites
- Node.js v18+
- npm
- Foundry (for contracts)

### Installation

```bash
# Clone and install
git clone https://github.com/your-username/liminal.git
cd liminal
npm install

# Install contract dependencies
cd contracts && forge install && cd ..

# Copy environment template
cp .env.example .env
# Edit .env with your values
```

### Development

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Environment Variables

Required in `.env`:

```bash
# Network RPCs
BASE_RPC_URL="https://sepolia.base.org"

# Wallet (use keystore for production)
SENDER_ADDRESS="0x..."
FOUNDRY_KEYSTORES_PATH="~/.foundry/keystores"

# Deployed Contracts (Base Sepolia)
VITE_BASE_GMR_ADDRESS="0x754f4Dd925226b223faD1cdC5A2777979c2Fb9A2"
VITE_BASE_LEADERBOARD_ADDRESS="0xb558b8a32915b2871A3a4Ca3Ea3fdFfc5912e0B5"
VITE_BASE_RESET_STRIKES_ADDRESS="0xF395fb9D88b1798EcA6c0d1C4a57335A12DB1608"

# Chainlink Price Feed (ETH/USD Base Sepolia)
BASE_PRICE_FEED="0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"
```

## Deployed Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| GMR | `0x754f4Dd925226b223faD1cdC5A2777979c2Fb9A2` |
| Leaderboard | `0xb558b8a32915b2871A3a4Ca3Ea3fdFfc5912e0B5` |
| ResetStrikes | `0xF395fb9D88b1798EcA6c0d1C4a57335A12DB1608` |

[View on BaseScan](https://sepolia.basescan.org/)

## Farcaster Configuration

Update `public/.well-known/farcaster.json`:
1. Generate account association at [Farcaster Developers](https://farcaster.xyz/~/developers/new)
2. Replace `accountAssociation` in manifest
3. Update image URLs to match your assets

## Project Structure

```
liminal/
├── src/
│   ├── components/     # React components
│   ├── pages/          # App pages
│   ├── lib/            # Contract configs, utilities
│   ├── abis/           # Contract ABIs
│   └── systems/        # Audio, atmosphere managers
├── contracts/          # Solidity contracts
│   ├── src/            # Contract source
│   ├── script/         # Deployment scripts
│   └── test/           # Contract tests
├── scripts/            # Monitoring & ops scripts
└── public/             # Static assets
```

## Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run test             # Run tests

# Monitoring
npm run health:check     # Check contract health
npm run health:watch     # Continuous monitoring
npm run validate:backend # Verify backend auth

# Contract Operations
npm run authorize:backend    # Authorize backend
./scripts/emergency-pause.sh # Emergency pause
./scripts/unpause-all.sh     # Unpause contracts
```

## Documentation

- **[OPERATIONS.md](OPERATIONS.md)** - Deployment, monitoring, and maintenance
- **[CONTRACTS.md](CONTRACTS.md)** - Contract architecture, security, and technical details
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes

## Contributing

Contributions welcome! Submit a pull request or open an issue.

## License

MIT License - see LICENSE file for details
