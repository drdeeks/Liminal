#!/bin/bash
set -e

# Unpause All Contracts Script

source .env

GMR="${VITE_BASE_GMR_ADDRESS}"
LEADERBOARD="${VITE_BASE_LEADERBOARD_ADDRESS}"
RESET_STRIKES="${VITE_BASE_RESET_STRIKES_ADDRESS}"
RPC_URL="${BASE_RPC_URL:-https://sepolia.base.org}"

echo "▶️  UNPAUSE - All Contracts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

KEYSTORE_PATH="${FOUNDRY_KEYSTORES_PATH/#\~/$HOME}"
KEYSTORE_FILE=$(ls "$KEYSTORE_PATH" 2>/dev/null | head -n 1)

if [ -z "$KEYSTORE_FILE" ]; then
  echo "❌ No keystore found"
  exit 1
fi

KEYSTORE_FULL_PATH="$KEYSTORE_PATH/$KEYSTORE_FILE"
echo "Using: $KEYSTORE_FULL_PATH"
echo ""

# Unpause GMR
echo "▶️  Unpausing GMR..."
cast send "$GMR" "unpause()" \
  --rpc-url "$RPC_URL" \
  --keystore "$KEYSTORE_FULL_PATH" || echo "⚠️  GMR unpause failed"

# Unpause Leaderboard
echo "▶️  Unpausing Leaderboard..."
cast send "$LEADERBOARD" "unpause()" \
  --rpc-url "$RPC_URL" \
  --keystore "$KEYSTORE_FULL_PATH" || echo "⚠️  Leaderboard unpause failed"

# Unpause ResetStrikes
echo "▶️  Unpausing ResetStrikes..."
cast send "$RESET_STRIKES" "unpause()" \
  --rpc-url "$RPC_URL" \
  --keystore "$KEYSTORE_FULL_PATH" || echo "⚠️  ResetStrikes unpause failed"

echo ""
echo "✅ All contracts unpaused!"
echo ""
echo "Verifying status..."
npm run health:check
