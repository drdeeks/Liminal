# 🚀 One-Command Deployment Guide

**Deploy with a single command. Everything is automated.**

---

## ⚡ Quick Deploy

```bash
forge script script/Deploy.s.sol --sig "run(string)" "base"
```

or

```bash
forge script script/Deploy.s.sol --sig "run(string)" "monad"
```

**That's it.** The script handles everything else.

---

## 🔧 One-Time Setup (5 minutes)

### Step 1: Add Your API Keys to the Script

Open `script/Deploy.s.sol` and replace the placeholder API keys:

```solidity
// LINE 15-16: ADD YOUR KEYS HERE
string constant BASESCAN_API_KEY = "ABCD1234YOUR_REAL_KEY_HERE";
string constant MONAD_API_KEY = "EFGH5678YOUR_REAL_KEY_HERE";
```

**Get API Keys:**
- **Basescan**: https://basescan.org/myapikey (free signup)
- **Monad**: https://docs.monad.xyz (when available)

### Step 2: Create Encrypted Keystore

```bash
cast wallet import deployer --interactive
```

Enter your private key when prompted, then create a password.

Your keystore is saved at `~/.foundry/keystores/deployer`

### Step 3: Fund Your Wallet

```bash
# Check your deployer address
cast wallet address --account deployer

# Fund it with ETH/MON for gas
```

**Done!** You never need to do setup again.

---

## 🎯 Deployment Commands

### Base Mainnet
```bash
forge script script/Deploy.s.sol --sig "run(string)" "base" --account deployer --broadcast
```

### Base Sepolia Testnet
```bash
forge script script/Deploy.s.sol --sig "run(string)" "base-sepolia" --account deployer --broadcast
```

### Monad Mainnet
```bash
forge script script/Deploy.s.sol --sig "run(string)" "monad" --account deployer --broadcast
```

### Monad Testnet
```bash
forge script script/Deploy.s.sol --sig "run(string)" "monad-testnet" --account deployer --broadcast
```

---

## ✨ What Happens Automatically

When you run the command:

1. ✅ **Connects to hardcoded RPC** for your chain
2. ✅ **Prompts for keystore password** (secure entry)
3. ✅ **Deploys all 3 contracts** (GMR, Leaderboard, ResetStrikes)
4. ✅ **Verifies all contracts** on block explorer
5. ✅ **Saves deployment log** with all addresses
6. ✅ **Confirms verification success** for each contract
7. ✅ **Prints summary** with explorer links

**You don't specify:**
- ❌ RPC URLs (hardcoded)
- ❌ Price feed addresses (hardcoded)
- ❌ Verification flags (automatic)
- ❌ API keys (in script)
- ❌ Chain IDs (in script)

---

## 📋 Output Example

```
╔════════════════════════════════════════════════════════╗
║              GMR DEPLOYMENT SCRIPT                     ║
╚════════════════════════════════════════════════════════╝

Network: Base Mainnet
Chain ID: 8453
RPC: https://mainnet.base.org
Explorer: https://basescan.org

[DEPLOYING CONTRACTS]
Deployer: 0xYourAddress
Balance: 0.1 ETH

[1/3] Deploying GMR...
      ✓ GMR: 0x123...
[2/3] Deploying Leaderboard...
      ✓ Leaderboard: 0x456...
[3/3] Deploying ResetStrikes...
      ✓ ResetStrikes: 0x789...

✓ All contracts deployed!

[VERIFYING CONTRACTS]
Explorer API: https://api.basescan.org/api

[1/3] Verifying GMR...
      ✓ Verified: 0x123...
[2/3] Verifying Leaderboard...
      ✓ Verified: 0x456...
[3/3] Verifying ResetStrikes...
      ✓ Verified: 0x789...

✓ All contracts verified!

[LOG SAVED]
File: deployments/base-1234567890.json

╔════════════════════════════════════════════════════════╗
║              DEPLOYMENT SUCCESSFUL                     ║
╚════════════════════════════════════════════════════════╝

Network: Base Mainnet

GMR:           0x123...
Leaderboard:   0x456...
ResetStrikes:  0x789...

All contracts deployed and verified!
View on https://basescan.org
```

---

## 📁 Deployment Logs

Every deployment creates a timestamped JSON log in `deployments/`:

```json
{
  "deployment": {
    "network": "Base Mainnet",
    "chainId": 8453,
    "timestamp": "1234567890",
    "deployer": "0xYourAddress"
  },
  "contracts": {
    "GMR": {
      "address": "0x123...",
      "verified": true,
      "explorer": "https://basescan.org/address/0x123..."
    },
    "Leaderboard": {
      "address": "0x456...",
      "verified": true,
      "explorer": "https://basescan.org/address/0x456..."
    },
    "ResetStrikes": {
      "address": "0x789...",
      "verified": true,
      "explorer": "https://basescan.org/address/0x789..."
    }
  },
  "configuration": {
    "priceFeed": "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    "usdCostCents": 5
  }
}
```

---

## 🔍 Verify Deployment

Check your contracts on the explorer:

```bash
# View latest deployment log
cat deployments/*.json | tail -n 50
```

Or visit the explorer URLs shown in the output.

---

## ⚠️ Troubleshooting

### "Insufficient balance"
Fund your deployer wallet:
```bash
cast balance $(cast wallet address --account deployer) --rpc-url https://mainnet.base.org
```

### "Keystore not found"
Create it:
```bash
cast wallet import deployer --interactive
```

### "Verification failed"
Check your API key in the script (line 15-16).

### "Invalid chain"
Use: `base`, `base-sepolia`, `monad`, or `monad-testnet`

---

## 🔐 Security Notes

- ✅ API keys are in the script (commit to private repo only)
- ✅ Private key is encrypted in keystore (never in code)
- ✅ Password prompted at runtime (never saved)
- ⚠️ **Never commit your keystore or `.env` files**
- ⚠️ **Keep your filled-in script private**

---

## 🎓 Advanced: Custom Keystore Name

If your keystore isn't named "deployer", edit line 14:

```solidity
string constant KEYSTORE_NAME = "my-custom-name";
```

Then use:
```bash
forge script script/Deploy.s.sol --sig "run(string)" "base" --account my-custom-name --broadcast
```

---

## ✅ Pre-Deployment Checklist

- [ ] API keys added to script (line 15-16)
- [ ] Keystore created (`cast wallet import deployer`)
- [ ] Wallet funded with gas
- [ ] Tested on testnet first
- [ ] Ready to deploy

---

## 📞 Support

- **Foundry Docs**: https://book.getfoundry.sh
- **Base Docs**: https://docs.base.org
- **Monad Docs**: https://docs.monad.xyz

---

**That's it. One command. Everything automated.**