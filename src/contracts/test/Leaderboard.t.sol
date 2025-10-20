// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { Leaderboard } from "../src/Leaderboard.sol";

contract LeaderboardTest is Test {
    Leaderboard leaderboard;

    function setUp() public {
        leaderboard = new Leaderboard(address(this));
    }

    function testSubmitScore() public {
        vm.prank(address(1));
        leaderboard.submitScore(100, 1);
        (address[] memory addrs, uint256[] memory scores) = leaderboard.getLeaderboard(0, 1);
        assertEq(addrs[0], address(1));
        assertEq(scores[0], 100);
    }

    function testSubmitScore_ReplayAttack() public {
        vm.prank(address(1));
        leaderboard.submitScore(100, 1);
        vm.prank(address(1));
        vm.expectRevert(Leaderboard.GameAlreadySubmitted.selector);
        leaderboard.submitScore(100, 1);
    }

    function testGetLeaderboard_Pagination() public {
        for (uint256 i = 0; i < 25; i++) {
            // The test case will not exceed the bounds of uint160, so this cast is safe.
            // forge-lint: disable-next-line(unsafe-typecast)
            vm.prank(address(uint160(i + 1)));
            leaderboard.submitScore(i + 1, i + 1);
        }

        (address[] memory addrs, uint256[] memory scores) = leaderboard.getLeaderboard(1, 10);
        assertEq(addrs.length, 10);
        assertEq(scores.length, 10);
        assertEq(addrs[0], address(15));
        assertEq(scores[0], 15);
    }
}
