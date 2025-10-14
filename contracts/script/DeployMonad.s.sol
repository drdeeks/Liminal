// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "forge-std/StdCheats.sol";
import "../src/Counter.sol";
import "../src/Leaderboard.sol";
import "../src/ResetStrikes.sol";

contract DeployMonad is Script {
    function run() external {
        vm.startBroadcast();

        Counter counter = new Counter();
        console.log("Counter deployed to:", address(counter));

        Leaderboard leaderboard = new Leaderboard();
        console.log("Leaderboard deployed to:", address(leaderboard));

        ResetStrikes resetStrikes = new ResetStrikes(0.0001 ether);
        console.log("ResetStrikes deployed to:", address(resetStrikes));

        vm.stopBroadcast();

        // The verification will be done via command line after the script runs
        console.log("Contracts deployed successfully. Please verify them manually.");
        console.log("Counter address:", vm.toString(address(counter)));
        console.log("Leaderboard address:", vm.toString(address(leaderboard)));
        console.log("ResetStrikes address:", vm.toString(address(resetStrikes)));


        string memory addresses = string(abi.encodePacked(
            '{"counter": "',
            vm.toString(address(counter)),
            '", "leaderboard": "',
            vm.toString(address(leaderboard)),
            '", "resetStrikes": "',
            vm.toString(address(resetStrikes)),
            '"}'
        ));

        string memory path = "./monad-deployed-addresses.json";
        vm.writeFile(path, addresses);
    }
}