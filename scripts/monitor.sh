#!/bin/bash
# Simple contract monitoring script using cast

LEADERBOARD="0xb558b8a32915b2871A3a4Ca3Ea3fdFfc5912e0B5"
RESET_STRIKES="0xF395fb9D88b1798EcA6c0d1C4a57335A12DB1608"
GMR="0x754f4Dd925226b223faD1cdC5A2777979c2Fb9A2"
RPC="https://sepolia.base.org"

echo "🔍 Liminal Contract Monitor"
echo "Network: Base Sepolia"
echo "---"

while true; do
    clear
    echo "🔍 Liminal Contract Monitor - $(date)"
    echo "================================================"
    
    # Get latest block
    BLOCK=$(cast block-number --rpc-url $RPC 2>/dev/null)
    echo "📦 Latest Block: $BLOCK"
    echo ""
    
    # Leaderboard Stats
    echo "📊 LEADERBOARD ($LEADERBOARD)"
    PAUSED=$(cast call $LEADERBOARD "paused()(bool)" --rpc-url $RPC 2>/dev/null)
    echo "   Status: $([ "$PAUSED" = "false" ] && echo "✅ Active" || echo "⏸️  Paused")"
    
    OWNER=$(cast call $LEADERBOARD "owner()(address)" --rpc-url $RPC 2>/dev/null)
    echo "   Owner: $OWNER"
    
    # Get recent ScoreUpdated events
    echo "   Recent Scores (last 100 blocks):"
    FROM_BLOCK=$((BLOCK - 100))
    cast logs --from-block $FROM_BLOCK \
        --address $LEADERBOARD \
        "ScoreUpdated(address indexed user, uint256 newTotalScore)" \
        --rpc-url $RPC 2>/dev/null | head -5
    echo ""
    
    # ResetStrikes Stats
    echo "💰 RESET STRIKES ($RESET_STRIKES)"
    PAUSED=$(cast call $RESET_STRIKES "paused()(bool)" --rpc-url $RPC 2>/dev/null)
    echo "   Status: $([ "$PAUSED" = "false" ] && echo "✅ Active" || echo "⏸️  Paused")"
    
    COST=$(cast call $RESET_STRIKES "usdCostInCents()(uint256)" --rpc-url $RPC 2>/dev/null)
    echo "   Cost: $COST cents"
    
    BALANCE=$(cast balance $RESET_STRIKES --rpc-url $RPC 2>/dev/null)
    BALANCE_ETH=$(cast to-unit $BALANCE ether 2>/dev/null)
    echo "   Balance: $BALANCE_ETH ETH"
    echo ""
    
    # GMR Stats
    echo "👋 GMR ($GMR)"
    PAUSED=$(cast call $GMR "paused()(bool)" --rpc-url $RPC 2>/dev/null)
    echo "   Status: $([ "$PAUSED" = "false" ] && echo "✅ Active" || echo "⏸️  Paused")"
    echo ""
    
    echo "================================================"
    echo "Refreshing in 30 seconds... (Ctrl+C to stop)"
    sleep 30
done
