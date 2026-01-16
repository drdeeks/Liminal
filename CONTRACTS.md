# Contracts Documentation

Smart contract architecture, security, and technical details for Liminal.

## Architecture

### GMR (Game Marker)
Simple marker contract for game interactions.

**Key Features:**
- Pausable for emergency stops
- Owner-controlled
- 5-block cooldown between calls

**Functions:**
- `gm()` - Mark game interaction (1 per 5 blocks)
- `pause()` / `unpause()` - Emergency controls (owner only)

**Gas Cost:** ~50k gas per call

### Leaderboard
Tracks player scores with authorized updater pattern.

**Key Features:**
- Sorted leaderboard (highest scores first)
- Authorized updaters (backend servers)
- Score accumulation (not replacement)
- 1-block cooldown per player
- Max 1000 score increase per update

**Functions:**
- `updateScore(address user, uint256 scoreToAdd)` - Add to player score (authorized only)
- `getScores(uint256 offset, uint256 limit)` - Paginated leaderboard
- `getScore(address user)` - Individual player score
- `authorizeUpdater(address)` / `revokeUpdater(address)` - Manage updaters (owner only)

**Gas Cost:** 
- First score: ~150k gas
- Update existing: ~80k gas

### ResetStrikes
Paid power-up using Chainlink price feeds for ETH/USD conversion.

**Key Features:**
- Dynamic pricing in ETH based on USD cost
- Chainlink price feed integration
- Configurable USD cost (default $0.05)
- Automatic refunds for overpayment
- Price staleness checks (1 hour)

**Functions:**
- `resetStrikes()` - Purchase reset (payable)
- `setUsdCostInCents(uint256)` - Update cost (owner only)
- `setPriceFeed(address)` - Update oracle (owner only)
- `withdraw()` - Withdraw collected fees (owner only)

**Gas Cost:** ~120k gas per purchase

---

## Security

### Access Control

**Owner Pattern (Two-Step Transfer):**
- All contracts use `Owned.sol` with two-step ownership transfer
- New owner must explicitly accept ownership
- Prevents accidental transfers to wrong addresses

**Authorized Updaters (Leaderboard):**
- Only authorized addresses can update scores
- Owner can add/revoke updaters
- Backend servers should be the only updaters

### Rate Limiting

**GMR:**
- 5-block cooldown between calls per address
- Prevents spam and abuse

**Leaderboard:**
- 1-block cooldown between updates per player
- Max 1000 score increase per update
- Prevents rapid score manipulation

**ResetStrikes:**
- No rate limiting (payment required)
- Price staleness check (1 hour)

### Pausability

All contracts implement `Pausable.sol`:
- Owner can pause/unpause
- Paused state blocks main functions
- Emergency stop mechanism
- View functions still work when paused

### Price Feed Security (ResetStrikes)

**Chainlink Integration:**
- Uses Chainlink AggregatorV3Interface
- Checks for stale prices (1 hour threshold)
- Validates price is positive
- Validates price bounds (0.01 ETH - 100 ETH)

**Price Calculation:**
```solidity
ethRequired = (usdCostInCents * 1e18) / ethPriceInCents
```

**Safety Checks:**
- Reverts if price is stale
- Reverts if price is zero or negative
- Reverts if price is outside bounds
- Automatic refund if overpaid

---

## Gas Optimization

### Storage Layout
- Packed structs where possible
- Minimal storage writes
- Use of mappings over arrays for lookups

### Leaderboard Optimization
- Sorted array maintained on updates
- Binary search for insertions (future enhancement)
- Pagination to avoid large data returns

### Function Modifiers
- Custom errors instead of strings (saves gas)
- View functions for reads (no gas cost)
- Efficient loops with early exits

---

## Testing

### Run Tests

```bash
cd contracts
forge test
```

### Run with Gas Report

```bash
forge test --gas-report
```

### Run Specific Test

```bash
forge test --match-test testUpdateScore
```

### Coverage

```bash
forge coverage
```

### Test Files
- `test/GMR.t.sol` - GMR contract tests
- `test/Leaderboard.t.sol` - Leaderboard tests
- `test/ResetStrikes.t.sol` - ResetStrikes tests
- `test/Owned.t.sol` - Ownership tests

---

## Contract Addresses

### Base Sepolia (Testnet)
```
GMR:          0x754f4Dd925226b223faD1cdC5A2777979c2Fb9A2
Leaderboard:  0xb558b8a32915b2871A3a4Ca3Ea3fdFfc5912e0B5
ResetStrikes: 0xF395fb9D88b1798EcA6c0d1C4a57335A12DB1608
Price Feed:   0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1 (ETH/USD)
```

### Monad Testnet (Future)
```
GMR:          TBD
Leaderboard:  TBD
ResetStrikes: TBD
Price Feed:   0x694AA1769357215DE4FAC081bf1f309aDC325306 (ETH/USD)
```

---

## Deployment

### Simple Deployment (Recommended)

```bash
cd contracts
forge script script/DeploySimple.s.sol:DeploySimple \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore> \
  --broadcast \
  --verify
```

### Full Deployment (Legacy)

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_RPC_URL \
  --keystore ~/.foundry/keystores/<keystore> \
  --broadcast \
  --verify
```

### Verify Contracts Manually

```bash
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20 \
  $CONTRACT_ADDRESS \
  src/Leaderboard.sol:Leaderboard \
  --etherscan-api-key $BASESCAN_API_KEY
```

---

## Upgrades & Migration

### Current Version: v2 (Simplified)

**Changes from v1:**
- Removed complex dependencies (OpenZeppelin)
- Custom `Owned.sol` and `Pausable.sol`
- Simplified error handling
- Gas optimizations
- Removed unused features

**Migration Path:**
1. Deploy new v2 contracts
2. Pause v1 contracts
3. Export v1 leaderboard data
4. Import to v2 leaderboard (via authorized updater)
5. Update frontend to use v2 addresses
6. Verify all functionality
7. Deprecate v1 contracts

**No automatic migration** - requires manual data export/import.

---

## Security Considerations

### Known Limitations

1. **Leaderboard Array Growth**
   - Unbounded array can grow large
   - Pagination helps but doesn't solve
   - Consider periodic resets or archiving

2. **Price Feed Dependency**
   - ResetStrikes relies on Chainlink
   - If feed fails, purchases fail
   - Owner can update feed address

3. **Centralized Backend**
   - Leaderboard updates require authorized backend
   - Backend compromise = score manipulation
   - Use secure backend infrastructure

### Best Practices

1. **Keep keystores secure**
   - Never commit to version control
   - Use strong passwords
   - Backup securely

2. **Monitor contracts regularly**
   - Run `npm run health:watch`
   - Check for unauthorized updaters
   - Monitor gas costs

3. **Test before mainnet**
   - Thorough testing on testnet
   - Simulate high load
   - Test emergency procedures

4. **Emergency procedures**
   - Know how to pause contracts
   - Have backup RPC endpoints
   - Document recovery procedures

---

## ABIs

Contract ABIs are exported to `src/abis/` after compilation:
- `GMR.json`
- `Leaderboard.json`
- `ResetStrikes.json`

Frontend imports these for contract interactions.

---

## Chainlink Price Feeds

### Base Sepolia
- **ETH/USD:** `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1`
- **Update Frequency:** ~1 minute
- **Deviation Threshold:** 0.5%

### Monad Testnet
- **ETH/USD:** `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **Update Frequency:** TBD
- **Deviation Threshold:** TBD

[Chainlink Price Feeds Documentation](https://docs.chain.link/data-feeds/price-feeds/addresses)

---

## Future Enhancements

### Planned Features
- [ ] Leaderboard seasons/resets
- [ ] Multiple leaderboard categories
- [ ] Achievement NFTs
- [ ] Mainnet deployment
- [ ] Multi-chain support

### Optimization Opportunities
- [ ] Binary search for leaderboard insertions
- [ ] Merkle tree for leaderboard verification
- [ ] Batch score updates
- [ ] Gas token integration

---

## Support

For contract-related issues:
1. Check contract status: `npm run health:check`
2. Review transaction on BaseScan
3. Check contract events/logs
4. Verify gas settings
5. Test on testnet first

For security issues, contact the team privately before public disclosure.
