# Smart Contracts

This directory contains the smart contracts for the Liminal Farcaster mini app game.

## Contracts

- **GMR**: Main game token contract
- **Leaderboard**: Player leaderboard tracking
- **ResetStrikes**: Strike reset mechanism with Chainlink price feed integration

## Setup

### 1. Install Foundry

Install [Foundry](https://getfoundry.sh/):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Install Dependencies

```bash
forge install
```

### 3. Configure Environment Variables

Create a `.env` file in the contracts directory:

```bash
# RPC URLs for your networks
MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
BASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"

# Keystore Config
FOUNDRY_KEYSTORES_PATH="C:\Dev\Projects\Liminal-G\Liminal-gamma\contracts\keystore"
KEYSTORE_PASSWORD="your_secure_password"

# Wallet address
SENDER_ADDRESS="0xYourWalletAddress"

# API Keys for contract verification
ETHERSCAN_API_KEY="your_etherscan_api_key"
BASESCAN_API_KEY="your_basescan_api_key"

# Chainlink Price Feed Addresses
MONAD_PRICE_FEED="0x0c76859E85727683Eeba0C70Bc2e0F5781337818"
BASE_MAINNET_PRICE_FEED="0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
BASE_SEPOLIA_PRICE_FEED="0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"

# Chain IDs
MONAD_MAINNET_CHAIN_ID="143"
MONAD_TESTNET_CHAIN_ID="10143"
BASE_MAINNET_CHAIN_ID="8453"
BASE_SEPOLIA_CHAIN_ID="84532"
```

**Important**: Add `.env` to your `.gitignore` to keep credentials private!

### 4. Create or Import Keystore

Create an encrypted keystore using Foundry (recommended for production):

```bash
cast wallet import deployer --interactive
```

This will:
- Prompt you for your private key
- Ask you to set a password
- Save the encrypted keystore to `~/.foundry/keystores/deployer`

**Or** specify a custom directory:
```bash
cast wallet import deployer --keystore-dir ./contracts/keystore --interactive
```

**Or** import from an existing keystore file:
```bash
# Place your keystore JSON file in the specified directory
# Update FOUNDRY_KEYSTORES_PATH in .env to point to that directory
```

## Compiling

Compile all contracts:
```bash
forge build
```

Clean and rebuild:
```bash
forge clean && forge build
```

## Testing

Run all tests:
```bash
forge test
```

Run with verbosity:
```bash
forge test -vvvv
```

Run specific test:
```bash
forge test --match-contract GMRTest
```

## Deploying

The deployment script (`contracts/script/Deploy.s.sol`) automatically:
- Detects the network from chain ID
- Selects the correct Chainlink price feed
- Deploys all three contracts (GMR, Leaderboard, ResetStrikes)
- Logs all deployment addresses

### Deployment Commands

#### Base Mainnet
```bash
forge script contracts/script/Deploy.s.sol \
  --profile base \
  --account deployer \
  --password "$KEYSTORE_PASSWORD" \
  --broadcast \
  --verify \
  -vvvv
```

#### Base Sepolia (Testnet)
```bash
forge script contracts/script/Deploy.s.sol \
  --profile basetest \
  --account deployer \
  --password "$KEYSTORE_PASSWORD" \
  --broadcast \
  --verify \
  -vvvv
```

#### Monad Testnet
```bash
forge script contracts/script/Deploy.s.sol \
  --profile monadtest \
  --account deployer \
  --password "$KEYSTORE_PASSWORD" \
  --broadcast \
  --legacy \
  -vvvv
```

#### Monad Mainnet (When Active)
```bash
forge script contracts/script/Deploy.s.sol \
  --profile monad \
  --account deployer \
  --password "$KEYSTORE_PASSWORD" \
  --broadcast \
  --verify \
  --legacy \
  -vvvv
```

### PowerShell Commands

For Windows PowerShell, use `$env:` prefix:

```powershell
forge script contracts/script/Deploy.s.sol `
  --profile base `
  --account deployer `
  --password $env:KEYSTORE_PASSWORD `
  --broadcast `
  --verify `
  -vvvv
```

### Dry Run (Simulation)

Test deployment without broadcasting transactions (remove `--broadcast`):

```bash
forge script contracts/script/Deploy.s.sol \
  --profile monadtest \
  --account deployer \
  --password "$KEYSTORE_PASSWORD" \
  -vvvv
```

### Command Flags Explained

- `--profile`: Network configuration from `foundry.toml` (base, basetest, monadtest)
- `--account`: Keystore name (filename without .json extension)
- `--password`: Password to decrypt keystore (from `.env`)
- `--broadcast`: Send transactions to network (omit for dry run)
- `--verify`: Verify contracts on block explorer
- `--legacy`: Use legacy transaction type (required for Monad)
- `-vvvv`: Maximum verbosity for debugging

## Post-Deployment

After deploying, the script will output all contract addresses:

```
=== Base Mainnet Deployment Summary ===
Chain ID: 8453
GMR: 0x...
Leaderboard: 0x...
ResetStrikes: 0x...
Price Feed Used: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70
```

### Update Frontend Configuration

1. Open `src/lib/contracts.ts` in your frontend application
2. Update the contract addresses:
   ```typescript
   export const GMR_ADDRESS = '0xYourDeployedGMRAddress';
   export const LEADERBOARD_ADDRESS = '0xYourDeployedLeaderboardAddress';
   export const RESET_STRIKES_ADDRESS = '0xYourDeployedResetStrikesAddress';
   ```
3. Update the chain ID if needed

### Verify Contracts Manually

If automatic verification fails, verify manually:

```bash
forge verify-contract \
  --chain-id 8453 \
  --etherscan-api-key $BASESCAN_API_KEY \
  0xYourContractAddress \
  contracts/src/GMR.sol:GMR
```

## Security Best Practices

1. **Never commit private keys or `.env` files** - Always add to `.gitignore`
2. **Use encrypted keystores** - Store keystores securely, never share passwords
3. **Test on testnets first** - Always deploy to Base Sepolia or Monad Testnet before mainnet
4. **Verify all contracts** - Ensure source code is verified on block explorers
5. **Use hardware wallets for production** - Consider using Ledger/Trezor for mainnet deployments
6. **Audit deployment scripts** - Review `Deploy.s.sol` before running on mainnet
7. **Keep dependencies updated** - Regularly run `forge update` to update libraries

## Troubleshooting

### "Keystore file does not exist"
- Ensure `FOUNDRY_KEYSTORES_PATH` points to the directory (not the file)
- Or use `--keystore` flag with full path to keystore file

### "Invalid password"
- Check `KEYSTORE_PASSWORD` in `.env` matches keystore password
- Ensure `.env` is being loaded (check `load_dotenv = true` in `foundry.toml`)

### "Unsupported chain" error
- Verify `chain_id` in profile matches the RPC endpoint
- Check that `Deploy.s.sol` includes the chain ID in validation

### Verification fails
- Ensure correct API key is set in `.env`
- Check that Etherscan/Basescan URL is correct in `foundry.toml`
- Try manual verification with `forge verify-contract`

### Out of gas errors
- Increase gas limit in transaction or adjust `optimizer_runs` in `foundry.toml`
- For Monad, ensure `--legacy` flag is used

## Project Structure

```
contracts/
├── script/
│   └── Deploy.s.sol          # Main deployment script
├── src/
│   ├── GMR.sol               # Game token contract
│   ├── Leaderboard.sol       # Leaderboard contract
│   └── ResetStrikes.sol      # Strike reset contract
├── test/
│   └── ...                   # Test files
├── lib/                      # Dependencies (OpenZeppelin, etc.)
├── keystore/                 # Encrypted keystores (gitignored)
├── foundry.toml              # Foundry configuration
└── .env                      # Environment variables (gitignored)
```

## Useful Commands

```bash
# List available keystores
cast wallet list

# Check keystore address
cast wallet address --account deployer

# Get current gas price
cast gas-price --rpc-url $BASE_RPC_URL

# Check balance
cast balance 0xYourAddress --rpc-url $BASE_RPC_URL

# Call contract (read-only)
cast call 0xContractAddress "functionName()" --rpc-url $BASE_RPC_URL

# Send transaction
cast send 0xContractAddress "functionName()" --rpc-url $BASE_RPC_URL --account deployer

# View foundry config
forge config --basic
```

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
- [Base Documentation](https://docs.base.org/)
- [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
