// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ResetStrikes.sol";

contract ResetStrikesTest is Test {
    ResetStrikes resetStrikes;

    function setUp() public {
        resetStrikes = new ResetStrikes(0.0001 ether);
    }

    function testResetStrikes() public {
        vm.deal(address(1), 1 ether);
        vm.prank(address(1));
        (bool success, ) = address(resetStrikes).call{value: 0.0001 ether}(abi.encodeWithSignature("resetStrikes()"));
        assertTrue(success);
    }

    function testResetStrikes_IncorrectPayment() public {
        vm.deal(address(1), 1 ether);
        vm.prank(address(1));
        vm.expectRevert(abi.encodeWithSelector(ResetStrikes.IncorrectPaymentAmount.selector, 0.0002 ether, 0.0001 ether));
        resetStrikes.resetStrikes{value: 0.0002 ether}();
    }

    function testUpdatePrice() public {
        vm.prank(address(this));
        resetStrikes.updatePrice(0.0002 ether);
        assertEq(resetStrikes.price(), 0.0002 ether);
    }

    function testUpdatePrice_NotOwner() public {
        vm.prank(address(1));
        vm.expectRevert();
        resetStrikes.updatePrice(0.0002 ether);
    }
}