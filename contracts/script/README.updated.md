# Universal Deployment and Verification Script

This guide covers deploying and verifying the contracts for the Liminal project.

## 1. Wallet Setup

Before deploying, you need a keystore file. You can create one by importing a private key.

**IMPORTANT:** You will be prompted to enter your private key and a password. This is done interactively and will not be saved in your shell history.

```bash
# This will create a keystore file in C:\Dev\Projects\Liminal\keystores\
cast wallet import --interactive deployer
```

## 2. Funding Your Wallet

Ensure the address you just imported is funded with testnet ETH.
-   **Address:** The command above will show you the public address.
-   **Faucet:** Use a Monad testnet faucet to get funds.

## 3. Deployment

The following command deploys all contracts to the Monad testnet. You will be prompted for the password you created in the wallet setup step.

```bash
# Run from the project root directory
forge script contracts/script/Deploy.s.sol:Deploy --rpc-url https://testnet-rpc.monad.xyz --sender <YOUR_SENDER_ADDRESS> --keystore C:\Dev\Projects\Liminal\keystores\deployer --broadcast -vvvv
```
*Replace `<YOUR_SENDER_ADDRESS>` with the public address from the wallet setup.*

## 4. Verification

After a successful deployment, verify each contract on the Monad block explorer.

**Note:** The Monad testnet explorer currently does not require an API key for verification.

### Verify GMR
```bash
forge verify-contract <GMR_ADDRESS> contracts/src/GMR.sol:GMR --chain-id 10143
```

### Verify Leaderboard
```bash
forge verify-contract <LEADERBOARD_ADDRESS> contracts/src/Leaderboard.sol:Leaderboard --chain-id 10143
```

### Verify ResetStrikes
```bash
forge verify-contract <RESETSTRIKES_ADDRESS> contracts/src/ResetStrikes.sol:ResetStrikes --chain-id 10143
```
*Replace `<..._ADDRESS>` with the contract addresses from the deployment output.*

---

## Original README Content

The original README provided an alternative deployment method using Foundry profiles. This method is preserved below for reference.

---

# Universal Deployment Script

Use the same `Deploy.s.sol` script for all chains! The script automatically detects which chain you're deploying to based on the profile.

## Setup

1. **Place `Deploy.s.sol` in `script/` directory**
2. **Use the `foundry.toml` with profiles configured**
3. **Set your keystore path**:
```powershell
$env:KEYSTORE_PATH = "C:\Dev\Projects\Liminal-G\Liminal-gamma\contracts\keystore\deployer.json"
```

## Deploy Commands

### Deploy to Monad Testnet
```powershell
forge script script/Deploy.s.sol --profile monad --keystore $env:KEYSTORE_PATH
```

### Deploy to Base Mainnet
```powershell
# Set API key for verification
$env:BASESCAN_API_KEY = "your_api_key_here"

# Deploy
forge script script/Deploy.s.sol --profile base --keystore $env:KEYSTORE_PATH
```

### Deploy to Base Sepolia
```powershell
forge script script/Deploy.s.sol --profile base-sepolia --keystore $env:KEYSTORE_PATH
```

---

## How It Works

The universal script:
1. ✅ Detects the chain from `block.chainid` (set by the `--profile`)
2. ✅ Validates you're on a supported chain
3. ✅ Automatically selects the correct price feed
4. ✅ Deploys all three contracts
5. ✅ Shows which network you deployed to

**One script, multiple chains!**

---

## Create PowerShell Aliases (Optional)

Add to your PowerShell profile for super simple commands:

```powershell
# Add to $PROFILE
$env:KEYSTORE_PATH = "C:\Dev\Projects\Liminal-G\Liminal-gamma\contracts\keystore\deployer.json"

function Deploy-Monad {
    forge script script/Deploy.s.sol --profile monad --keystore $env:KEYSTORE_PATH @args
}

function Deploy-Base {
    forge script script/Deploy.s.sol --profile base --keystore $env:KEYSTORE_PATH @args
}

function Deploy-BaseSepolia {
    forge script script/Deploy.s.sol --profile base-sepolia --keystore $env:KEYSTORE_PATH @args
}

Set-Alias -Name deploy-monad -Value Deploy-Monad
Set-Alias -Name deploy-base -Value Deploy-Base
Set-Alias -Name deploy-base-sepolia -Value Deploy-BaseSepolia
```

Then simply run:
```powershell
deploy-monad
deploy-base
deploy-base-sepolia
```

---

## Dry Run (Simulation)

Test without deploying:
```powershell
# Monad
forge script script/Deploy.s.sol --profile monad --keystore $env:KEYSTORE_PATH --no-broadcast

# Base
forge script script/Deploy.s.sol --profile base --keystore $env:KEYSTORE_PATH --no-broadcast
```

---

## Summary

**One universal script:**
```
script/Deploy.s.sol
```

**Three simple commands:**
```powershell
forge script script/Deploy.s.sol --profile monad --keystore $env:KEYSTORE_PATH
forge script script/Deploy.s.sol --profile base --keystore $env:KEYSTORE_PATH
forge script script/Deploy.s.sol --profile base-sepolia --keystore $env:KEYSTORE_PATH
```

The `--profile` flag determines which chain to deploy to! 🚀

```