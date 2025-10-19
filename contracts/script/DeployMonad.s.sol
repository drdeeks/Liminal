// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Leaderboard} from "../src/Leaderboard.sol";
import {ResetStrikes} from "../src/ResetStrikes.sol";

contract DeployMonad is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("OWNER");

        if (deployerPrivateKey == 0) {
            revert("PRIVATE_KEY not set");
        }
        if (owner == address(0)) {
            revert("OWNER address not set");
        }

        vm.startBroadcast(deployerPrivateKey);

        Leaderboard leaderboard = new Leaderboard(owner);
        console.log("Leaderboard deployed to:", address(leaderboard));

        ResetStrikes resetStrikes = new ResetStrikes(owner, 0.0001 ether);
        console.log("ResetStrikes deployed to:", address(resetStrikes));

        vm.stopBroadcast();

        string memory addresses = string(
            abi.encodePacked(
                '{"leaderboard":"',
                vm.toString(address(leaderboard)),
                '","resetStrikes":"',
                vm.toString(address(resetStrikes)),
                '"}'
            )
        );

        string memory path = "./monad-deployed-addresses.json";
        vm.writeFile(path, addresses);
    }
}