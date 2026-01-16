#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Liminal Contract Deployment         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Check for network argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: Network not specified${NC}"
    echo "Usage: ./deploy.sh [base-sepolia|monad-testnet]"
    exit 1
fi

NETWORK=$1
KEYSTORE="liminal-deployer"

# Network configurations
case $NETWORK in
    "base-sepolia")
        RPC_URL="https://sepolia.base.org"
        CHAIN_ID="84532"
        PRICE_FEED="0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"
        EXPLORER="https://sepolia.basescan.org"
        ;;
    "monad-testnet")
        RPC_URL="https://testnet-rpc.monad.xyz"
        CHAIN_ID="10143"
        PRICE_FEED="0x0c76859E85727683Eeba0C70Bc2e0F5781337818"
        EXPLORER="https://testnet-explorer.monad.xyz"
        ;;
    *)
        echo -e "${RED}Error: Unknown network '$NETWORK'${NC}"
        echo "Supported networks: base-sepolia, monad-testnet"
        exit 1
        ;;
esac

echo -e "${BLUE}Network:${NC} $NETWORK"
echo -e "${BLUE}Chain ID:${NC} $CHAIN_ID"
echo -e "${BLUE}RPC URL:${NC} $RPC_URL"
echo ""

# Get deployer address
DEPLOYER=$(cast wallet address --keystore ~/.foundry/keystores/$KEYSTORE)
echo -e "${BLUE}Deployer:${NC} $DEPLOYER"

# Check balance
BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC_URL)
BALANCE_ETH=$(cast to-unit $BALANCE ether)
echo -e "${BLUE}Balance:${NC} $BALANCE_ETH ETH"
echo ""

if (( $(echo "$BALANCE_ETH < 0.001" | bc -l) )); then
    echo -e "${RED}Error: Insufficient balance. Need at least 0.001 ETH${NC}"
    exit 1
fi

echo -e "${YELLOW}Ready to deploy. You will be prompted for your keystore password.${NC}"
echo ""

# Deploy contracts
cd contracts
forge script script/Deploy.s.sol:Deploy \
    --rpc-url $RPC_URL \
    --account $KEYSTORE \
    --sender $DEPLOYER \
    --broadcast \
    --chain-id $CHAIN_ID \
    -vvv

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "${BLUE}View on explorer:${NC} $EXPLORER"
