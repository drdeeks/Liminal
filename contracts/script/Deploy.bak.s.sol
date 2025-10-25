// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GMR.sol";
import "../src/Leaderboard.sol";
import "../src/ResetStrikes.sol";

contract Deploy is Script {
    // Chain IDs
    uint256 constant MONAD_TESTNET_CHAIN_ID = 10143;
    uint256 constant BASE_MAINNET_CHAIN_ID = 8453;
    uint256 constant BASE_SEPOLIA_CHAIN_ID = 84532;
    
    // Chainlink ETH/USD Price Feeds
    address constant BASE_MAINNET_PRICE_FEED = 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70;
    address constant BASE_SEPOLIA_PRICE_FEED = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;
    address constant MONAD_PRICE_FEED = 0x0c76859E85727683Eeba0C70Bc2e0F5781337818;
    
    function run() external {
        // Validate chain
        require(
            block.chainid == MONAD_TESTNET_CHAIN_ID || 
            block.chainid == BASE_MAINNET_CHAIN_ID || 
            block.chainid == BASE_SEPOLIA_CHAIN_ID,
            "Unsupported chain. Must be Monad (10143), Base (8453), or Base Sepolia (84532)"
        );
        
        vm.startBroadcast();

        string memory network = getNetworkName();
        console.log("Deploying to", network);
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", msg.sender);

        // Deploy GMR contract
        GMR gmr = new GMR();
        console.log("GMR deployed to:", address(gmr));

        // Deploy Leaderboard contract
        Leaderboard leaderboard = new Leaderboard();
        console.log("Leaderboard deployed to:", address(leaderboard));

        // Deploy ResetStrikes contract with appropriate price feed
        address priceFeedAddress = getPriceFeed();
        uint256 usdCostInCents = 5; // 0.05 USD
        
        ResetStrikes resetStrikes = new ResetStrikes(priceFeedAddress, usdCostInCents);
        console.log("ResetStrikes deployed to:", address(resetStrikes));

        vm.stopBroadcast();

        // Log all addresses for easy reference
        console.log("\n===", network, "Deployment Summary ===");
        console.log("Chain ID:", block.chainid);
        console.log("GMR:", address(gmr));
        console.log("Leaderboard:", address(leaderboard));
        console.log("ResetStrikes:", address(resetStrikes));
        console.log("Price Feed Used:", priceFeedAddress);
    }
    
    function getNetworkName() internal view returns (string memory) {
        if (block.chainid == MONAD_TESTNET_CHAIN_ID) return "Monad Testnet";
        if (block.chainid == BASE_MAINNET_CHAIN_ID) return "Base Mainnet";
        if (block.chainid == BASE_SEPOLIA_CHAIN_ID) return "Base Sepolia";
        return "Unknown";
    }
    
    function getPriceFeed() internal view returns (address) {
        if (block.chainid == MONAD_TESTNET_CHAIN_ID) return MONAD_PRICE_FEED;
        if (block.chainid == BASE_MAINNET_CHAIN_ID) return BASE_MAINNET_PRICE_FEED;
        if (block.chainid == BASE_SEPOLIA_CHAIN_ID) return BASE_SEPOLIA_PRICE_FEED;
        revert("Unsupported chain");
    }
}
