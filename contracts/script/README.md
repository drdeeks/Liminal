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
