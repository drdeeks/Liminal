#!/bin/bash
set -e

# Emergency Pause Script
# Pauses all contracts immediately in case of security issues

source .env

GMR="${VITE_BASE_GMR_ADDRESS}"
LEADERBOARD="${VITE_BASE_LEADERBOARD_ADDRESS}"
RESET_STRIKES="${VITE_BASE_RESET_STRIKES_ADDRESS}"
RPC_URL="${BASE_RPC_URL:-https://sepolia.base.org}"

echo "🚨 EMERGENCY PAUSE - All Contracts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  WARNING: This will pause all contracts immediately!"
echo ""
read -p "Are you sure? (type 'YES' to confirm): " confirm

if [ "$confirm" != "YES" ]; then
  echo "❌ Cancelled"
  exit 1
fi

echo ""
echo "Finding keystore..."
KEYSTORE_PATH="${FOUNDRY_KEYSTORES_PATH/#\~/$HOME}"
KEYSTORE_FILE=$(ls "$KEYSTORE_PATH" 2>/dev/null | head -n 1)

if [ -z "$KEYSTORE_FILE" ]; then
  echo "❌ No keystore found"
  exit 1
fi

KEYSTORE_FULL_PATH="$KEYSTORE_PATH/$KEYSTORE_FILE"
echo "Using: $KEYSTORE_FULL_PATH"
echo ""

# Pause GMR
echo "⏸️  Pausing GMR..."
cast send "$GMR" "pause()" \
  --rpc-url "$RPC_URL" \
  --keystore "$KEYSTORE_FULL_PATH" || echo "⚠️  GMR pause failed"

# Pause Leaderboard
echo "⏸️  Pausing Leaderboard..."
cast send "$LEADERBOARD" "pause()" \
  --rpc-url "$RPC_URL" \
  --keystore "$KEYSTORE_FULL_PATH" || echo "⚠️  Leaderboard pause failed"

# Pause ResetStrikes
echo "⏸️  Pausing ResetStrikes..."
cast send "$RESET_STRIKES" "pause()" \
  --rpc-url "$RPC_URL" \
  --keystore "$KEYSTORE_FULL_PATH" || echo "⚠️  ResetStrikes pause failed"

echo ""
echo "✅ Emergency pause complete!"
echo ""
echo "To verify, run: npm run health:check"
echo "To unpause, run: ./scripts/unpause-all.sh"
