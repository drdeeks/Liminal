#!/bin/bash
set -e

# Load environment variables
source .env

LEADERBOARD_ADDRESS="${VITE_BASE_LEADERBOARD_ADDRESS}"
BACKEND_ADDRESS="${SENDER_ADDRESS}"
RPC_URL="${BASE_RPC_URL:-https://sepolia.base.org}"

if [ -z "$LEADERBOARD_ADDRESS" ]; then
  echo "❌ VITE_BASE_LEADERBOARD_ADDRESS not set"
  exit 1
fi

if [ -z "$BACKEND_ADDRESS" ]; then
  echo "❌ SENDER_ADDRESS not set"
  exit 1
fi

echo "🔐 Authorizing Backend on Leaderboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Leaderboard: $LEADERBOARD_ADDRESS"
echo "Backend:     $BACKEND_ADDRESS"
echo ""

# Check if already authorized
echo "Checking current authorization status..."
IS_AUTHORIZED=$(cast call "$LEADERBOARD_ADDRESS" "authorizedUpdaters(address)(bool)" "$BACKEND_ADDRESS" --rpc-url "$RPC_URL")

if [ "$IS_AUTHORIZED" = "true" ]; then
  echo "✅ Backend is already authorized!"
  exit 0
fi

echo "❌ Backend is not authorized. Authorizing now..."
echo ""

# Find keystore
KEYSTORE_PATH="${FOUNDRY_KEYSTORES_PATH/#\~/$HOME}"
KEYSTORE_FILE=$(ls "$KEYSTORE_PATH" 2>/dev/null | head -n 1)

if [ -z "$KEYSTORE_FILE" ]; then
  echo "❌ No keystore found in $KEYSTORE_PATH"
  echo "   Please specify keystore path manually:"
  echo "   cast send $LEADERBOARD_ADDRESS \"authorizeUpdater(address)\" $BACKEND_ADDRESS --rpc-url $RPC_URL --keystore <path>"
  exit 1
fi

KEYSTORE_FULL_PATH="$KEYSTORE_PATH/$KEYSTORE_FILE"
echo "Using keystore: $KEYSTORE_FULL_PATH"
echo ""

# Authorize backend
cast send "$LEADERBOARD_ADDRESS" \
  "authorizeUpdater(address)" \
  "$BACKEND_ADDRESS" \
  --rpc-url "$RPC_URL" \
  --keystore "$KEYSTORE_FULL_PATH"

echo ""
echo "✅ Backend authorization complete!"
echo ""
echo "Verifying..."
IS_AUTHORIZED=$(cast call "$LEADERBOARD_ADDRESS" "authorizedUpdaters(address)(bool)" "$BACKEND_ADDRESS" --rpc-url "$RPC_URL")

if [ "$IS_AUTHORIZED" = "true" ]; then
  echo "✅ Verification successful - Backend is now authorized!"
else
  echo "❌ Verification failed - Backend is still not authorized"
  exit 1
fi
