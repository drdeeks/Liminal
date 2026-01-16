// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Leaderboard} from "../src/Leaderboard.sol";

contract LeaderboardTest is Test {
    Leaderboard public leaderboard;
    address public owner = address(1);
    address public backend = address(2);
    address public user1 = address(3);
    address public user2 = address(4);

    event ScoreUpdated(address indexed user, uint256 newTotalScore);
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);

    function setUp() public {
        vm.prank(owner);
        leaderboard = new Leaderboard();
        
        vm.prank(owner);
        leaderboard.authorizeUpdater(backend);
    }

    function test_AuthorizeUpdater() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit UpdaterAuthorized(user1);
        leaderboard.authorizeUpdater(user1);
        assertTrue(leaderboard.authorizedUpdaters(user1));
    }

    function test_RevokeUpdater() public {
        vm.prank(owner);
        leaderboard.authorizeUpdater(user1);
        
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit UpdaterRevoked(user1);
        leaderboard.revokeUpdater(user1);
        assertFalse(leaderboard.authorizedUpdaters(user1));
    }

    function test_UpdateScore() public {
        vm.prank(backend);
        vm.expectEmit(true, false, false, true);
        emit ScoreUpdated(user1, 100);
        leaderboard.updateScore(user1, 100);
        
        assertEq(leaderboard.getScore(user1), 100);
        assertTrue(leaderboard.hasScore(user1));
    }

    function test_UpdateScoreMultipleTimes() public {
        vm.prank(backend);
        leaderboard.updateScore(user1, 100);
        
        vm.roll(block.number + 2);
        vm.prank(backend);
        leaderboard.updateScore(user1, 50);
        
        assertEq(leaderboard.getScore(user1), 150);
    }

    function test_RevertUnauthorizedUpdate() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized()"));
        leaderboard.updateScore(user1, 100);
    }

    function test_RevertInvalidScoreZero() public {
        vm.prank(backend);
        vm.expectRevert(Leaderboard.InvalidScore.selector);
        leaderboard.updateScore(user1, 0);
    }

    function test_RevertInvalidScoreTooHigh() public {
        vm.prank(backend);
        vm.expectRevert(Leaderboard.InvalidScore.selector);
        leaderboard.updateScore(user1, 1001);
    }

    function test_RevertRateLimited() public {
        vm.prank(backend);
        leaderboard.updateScore(user1, 100);
        
        vm.prank(backend);
        vm.expectRevert(Leaderboard.RateLimited.selector);
        leaderboard.updateScore(user1, 50);
    }

    function test_GetScoresPagination() public {
        // Add multiple scores
        for (uint160 i = 0; i < 10; i++) {
            vm.prank(backend);
            leaderboard.updateScore(address(i + 100), 100 * (i + 1));
            vm.roll(block.number + 2);
        }
        
        (Leaderboard.Entry[] memory page1, uint256 total) = leaderboard.getScores(0, 5);
        assertEq(page1.length, 5);
        assertEq(total, 10);
        
        (Leaderboard.Entry[] memory page2,) = leaderboard.getScores(5, 5);
        assertEq(page2.length, 5);
    }

    function test_GetScoresPaginationOutOfBounds() public {
        vm.prank(backend);
        leaderboard.updateScore(user1, 100);
        
        (Leaderboard.Entry[] memory scores, uint256 total) = leaderboard.getScores(10, 5);
        assertEq(scores.length, 0);
        assertEq(total, 1);
    }

    function test_PauseUnpause() public {
        vm.prank(owner);
        leaderboard.pause();
        assertTrue(leaderboard.paused());
        
        vm.prank(backend);
        vm.expectRevert(abi.encodeWithSignature("ContractPaused()"));
        leaderboard.updateScore(user1, 100);
        
        vm.prank(owner);
        leaderboard.unpause();
        assertFalse(leaderboard.paused());
        
        vm.prank(backend);
        leaderboard.updateScore(user1, 100);
        assertEq(leaderboard.getScore(user1), 100);
    }

    function testFuzz_UpdateScore(uint256 score) public {
        score = bound(score, 1, 1000);
        
        vm.prank(backend);
        leaderboard.updateScore(user1, score);
        assertEq(leaderboard.getScore(user1), score);
    }
}
