// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Leaderboard.sol";
import "../src/ResetStrikes.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        if (deployerPrivateKey == 0) {
            revert("No private key found");
        }

        vm.startBroadcast(deployerPrivateKey);

        Leaderboard leaderboard = new Leaderboard();
        console.log("Leaderboard deployed to:", address(leaderboard));

        ResetStrikes resetStrikes = new ResetStrikes(0.0001 ether);
        console.log("ResetStrikes deployed to:", address(resetStrikes));

        vm.stopBroadcast();

        string memory addresses = string(abi.encodePacked(
            '{"leaderboard": "',
            vm.toString(address(leaderboard)),
            '", "resetStrikes": "',
            vm.toString(address(resetStrikes)),
            '"}'
        ));

        string memory path = "./deployed-addresses.json";
        vm.writeFile(path, addresses);

    }
}