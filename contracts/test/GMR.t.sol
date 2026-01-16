// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {GMR} from "../src/GMR.sol";

contract GMRTest is Test {
    GMR public gmr;
    address public owner = address(1);
    address public user = address(2);

    event Gm(address indexed user, uint256 timestamp);

    function setUp() public {
        vm.prank(owner);
        gmr = new GMR();
    }

    function test_Gm() public {
        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit Gm(user, block.timestamp);
        gmr.gm();
    }

    function test_GmMultipleUsers() public {
        vm.prank(user);
        gmr.gm();
        
        address user2 = address(3);
        vm.prank(user2);
        gmr.gm();
    }

    function test_RevertRateLimited() public {
        vm.prank(user);
        gmr.gm();
        
        vm.prank(user);
        vm.expectRevert(GMR.RateLimited.selector);
        gmr.gm();
    }

    function test_GmAfterRateLimit() public {
        vm.prank(user);
        gmr.gm();
        
        vm.roll(block.number + 5);
        
        vm.prank(user);
        gmr.gm();
    }

    function test_PauseUnpause() public {
        vm.prank(owner);
        gmr.pause();
        assertTrue(gmr.paused());
        
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("ContractPaused()"));
        gmr.gm();
        
        vm.prank(owner);
        gmr.unpause();
        assertFalse(gmr.paused());
        
        vm.prank(user);
        gmr.gm();
    }

    function test_RevertPauseUnauthorized() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized()"));
        gmr.pause();
    }

    function test_RevertUnpauseUnauthorized() public {
        vm.prank(owner);
        gmr.pause();
        
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized()"));
        gmr.unpause();
    }

    function test_TimestampInEvent() public {
        uint256 expectedTimestamp = block.timestamp;
        
        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit Gm(user, expectedTimestamp);
        gmr.gm();
    }
}
