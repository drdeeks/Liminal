# Operations Guide

Complete guide for deploying, monitoring, and maintaining Liminal contracts.

## Deployed Contracts (Base Sepolia)

| Contract | Address | Status |
|----------|---------|--------|
| GMR | `0x754f4Dd925226b223faD1cdC5A2777979c2Fb9A2` | ✅ Active |
| Leaderboard | `0xb558b8a32915b2871A3a4Ca3Ea3fdFfc5912e0B5` | ✅ Active |
| ResetStrikes | `0xF395fb9D88b1798EcA6c0d1C4a57335A12DB1608` | ✅ Active |

**Owner:** `0x12F1B38DC35AA65B50E5849d02559078953aE24b`

---

## Deployment

### Prerequisites
- Foundry installed
- Keystore created and funded
- Environment variables configured

### Deploy to Base Sepolia

```bash
cd contracts
forge script script/DeploySimple.s.sol:DeploySimple \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore> \
  --broadcast \
  --verify
```

### Deploy to Monad (Future)

```bash
forge script script/DeploySimple.s.sol:DeploySimple \
  --rpc-url $MONAD_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore> \
  --broadcast
```

### Post-Deployment

1. **Update .env** with deployed addresses
2. **Authorize backend**:
   ```bash
   npm run authorize:backend
   ```
3. **Verify contracts**:
   ```bash
   npm run health:check
   ```

---

## Monitoring

### Quick Health Check

```bash
npm run health:check
```

**Output:**
```
📋 GMR
   Status:  ✅ ACTIVE
   Owner:   0x12F1B38DC35AA65B50E5849d02559078953aE24b

📋 Leaderboard
   Status:  ✅ ACTIVE
   Backend: ✅ AUTHORIZED
   Players: 42

📋 ResetStrikes
   Status:  ✅ ACTIVE
   Cost:    $0.05 USD
```

### Continuous Monitoring

```bash
npm run health:watch
```

Checks every 30 seconds. Press `Ctrl+C` to stop.

### Validate Backend Authorization

```bash
npm run validate:backend
```

---

## Contract Management

### Authorize Backend

```bash
# Using npm script
npm run authorize:backend

# Or manually
cast send $VITE_BASE_LEADERBOARD_ADDRESS \
  "authorizeUpdater(address)" \
  $SENDER_ADDRESS \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore>
```

### Revoke Authorization

```bash
cast send $VITE_BASE_LEADERBOARD_ADDRESS \
  "revokeUpdater(address)" \
  $ADDRESS \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore>
```

### Pause Contracts

```bash
# Emergency pause all
./scripts/emergency-pause.sh

# Pause individual contract
cast send $CONTRACT_ADDRESS "pause()" \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore>
```

### Unpause Contracts

```bash
# Unpause all
./scripts/unpause-all.sh

# Unpause individual contract
cast send $CONTRACT_ADDRESS "unpause()" \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore>
```

### Update Reset Strikes Cost

```bash
# Set to 10 cents ($0.10)
cast send $VITE_BASE_RESET_STRIKES_ADDRESS \
  "setUsdCostInCents(uint256)" \
  10 \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore>
```

### Transfer Ownership

```bash
# Initiate transfer
cast send $CONTRACT_ADDRESS \
  "transferOwnership(address)" \
  $NEW_OWNER \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore>

# New owner accepts
cast send $CONTRACT_ADDRESS \
  "acceptOwnership()" \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<new-owner-keystore>
```

---

## Querying Contracts

### Leaderboard

```bash
# Get top 10 scores
cast call $VITE_BASE_LEADERBOARD_ADDRESS \
  "getScores(uint256,uint256)" \
  0 10 \
  --rpc-url $BASE_RPC_URL

# Get player score
cast call $VITE_BASE_LEADERBOARD_ADDRESS \
  "getScore(address)(uint256)" \
  $PLAYER_ADDRESS \
  --rpc-url $BASE_RPC_URL

# Check authorization
cast call $VITE_BASE_LEADERBOARD_ADDRESS \
  "authorizedUpdaters(address)(bool)" \
  $ADDRESS \
  --rpc-url $BASE_RPC_URL
```

### Contract Status

```bash
# Check if paused
cast call $CONTRACT_ADDRESS "paused()(bool)" --rpc-url $BASE_RPC_URL

# Get owner
cast call $CONTRACT_ADDRESS "owner()(address)" --rpc-url $BASE_RPC_URL

# Get balance
cast balance $CONTRACT_ADDRESS --rpc-url $BASE_RPC_URL
```

---

## Emergency Procedures

### If Contracts Are Compromised

1. **Pause immediately**:
   ```bash
   ./scripts/emergency-pause.sh
   ```

2. **Investigate**:
   - Check BaseScan for suspicious transactions
   - Review authorization list
   - Check contract balances

3. **Revoke unauthorized access**:
   ```bash
   cast send $VITE_BASE_LEADERBOARD_ADDRESS \
     "revokeUpdater(address)" \
     $SUSPICIOUS_ADDRESS \
     --rpc-url $BASE_RPC_URL \
     --keystore ~/.foundry/keystores/<keystore>
   ```

4. **Fix and resume**:
   ```bash
   ./scripts/unpause-all.sh
   npm run health:check
   ```

---

## Maintenance

### Daily
- Run `npm run health:check`
- Monitor transaction volume
- Check contract balances

### Weekly
- Review leaderboard data
- Analyze gas costs
- Check for unauthorized access attempts

### Monthly
- Security review
- Performance analysis
- Cost optimization
- Backup verification

---

## Pre-Production Checklist

### Security
- [ ] Backend authorized on Leaderboard
- [ ] All contracts unpaused
- [ ] Owner addresses verified
- [ ] No unauthorized updaters
- [ ] Keystores secure and backed up

### Functionality
- [ ] Test GMR contract
- [ ] Test leaderboard updates
- [ ] Test reset strikes payment
- [ ] Verify price feed working
- [ ] Test with multiple users

### Monitoring
- [ ] Health check passing
- [ ] Continuous monitoring setup
- [ ] Alerts configured
- [ ] Gas usage tracked

### Frontend
- [ ] Wallet connection works
- [ ] Contract interactions verified
- [ ] Error handling tested
- [ ] Mobile tested
- [ ] Farcaster client tested

---

## Useful Links

- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses)
- [Foundry Book](https://book.getfoundry.sh/)

---

## Quick Reference

```bash
# Monitoring
npm run health:check           # One-time check
npm run health:watch           # Continuous (30s)
npm run validate:backend       # Check auth

# Management
npm run authorize:backend      # Authorize backend
./scripts/emergency-pause.sh   # Pause all
./scripts/unpause-all.sh       # Unpause all

# Query
cast call $CONTRACT "paused()(bool)" --rpc-url $BASE_RPC_URL
cast call $CONTRACT "owner()(address)" --rpc-url $BASE_RPC_URL
cast balance $CONTRACT --rpc-url $BASE_RPC_URL
```
