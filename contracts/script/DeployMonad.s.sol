// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {GMR} from "../src/GMR.sol";
import {Leaderboard} from "../src/Leaderboard.sol";
import {ResetStrikes} from "../src/ResetStrikes.sol";
import {console} from "forge-std/console.sol";

contract DeployMonad is Script {
    GMR public gmr;
    Leaderboard public leaderboard;
    ResetStrikes public resetStrikes;

    function run() public {
        address owner = vm.envAddress("OWNER");
        require(owner != address(0), "OWNER environment variable not set");

        uint256 resetStrikesCost = vm.envUint("RESET_STRIKES_COST");
        if (resetStrikesCost == 0) {
            resetStrikesCost = 0.01 ether; // Default cost if not set
        }

        vm.startBroadcast();

        console.log("Deploying GMR contract...");
        gmr = new GMR();
        console.log("GMR deployed to:", address(gmr));

        console.log("Deploying Leaderboard contract...");
        leaderboard = new Leaderboard();
        console.log("Leaderboard deployed to:", address(leaderboard));

        console.log("Deploying ResetStrikes contract...");
        resetStrikes = new ResetStrikes(resetStrikesCost);
        console.log("ResetStrikes deployed to:", address(resetStrikes));

        // Transfer ownership of all contracts to the owner address
        console.log("Transferring ownership to:", owner);
        gmr.transferOwnership(owner);
        leaderboard.transferOwnership(owner);
        resetStrikes.transferOwnership(owner);
        console.log("Ownership transferred.");

        vm.stopBroadcast();
    }
}
