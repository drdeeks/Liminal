// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GMR.sol";
import "../src/Leaderboard.sol";
import "../src/ResetStrikes.sol";

contract DeploySimple is Script {
    function run() external {
        address priceFeed = vm.envAddress("PRICE_FEED");
        uint256 costCents = vm.envOr("RESET_STRIKES_COST_CENTS", uint256(5));
        
        console.log("Deploying with:");
        console.log("  Price Feed:", priceFeed);
        console.log("  Cost (cents):", costCents);
        console.log("  Deployer:", msg.sender);
        
        vm.startBroadcast();
        
        GMR gmr = new GMR();
        console.log("GMR deployed:", address(gmr));
        
        Leaderboard leaderboard = new Leaderboard();
        console.log("Leaderboard deployed:", address(leaderboard));
        
        ResetStrikes resetStrikes = new ResetStrikes(priceFeed, costCents);
        console.log("ResetStrikes deployed:", address(resetStrikes));
        
        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("GMR:", address(gmr));
        console.log("Leaderboard:", address(leaderboard));
        console.log("ResetStrikes:", address(resetStrikes));
    }
}
