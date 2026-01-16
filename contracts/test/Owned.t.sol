// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Owned} from "../src/Owned.sol";

contract OwnedImplementation is Owned {
    constructor(address _owner) Owned(_owner) {}
}

contract OwnedTest is Test {
    OwnedImplementation public owned;
    address public owner = address(1);
    address public newOwner = address(2);
    address public unauthorized = address(3);

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function setUp() public {
        vm.prank(owner);
        owned = new OwnedImplementation(owner);
    }

    function test_InitialOwner() public {
        assertEq(owned.owner(), owner);
    }

    function test_TransferOwnershipInitiate() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferStarted(owner, newOwner);
        owned.transferOwnership(newOwner);
        
        assertEq(owned.pendingOwner(), newOwner);
        assertEq(owned.owner(), owner); // Still old owner
    }

    function test_AcceptOwnership() public {
        vm.prank(owner);
        owned.transferOwnership(newOwner);
        
        vm.prank(newOwner);
        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(owner, newOwner);
        owned.acceptOwnership();
        
        assertEq(owned.owner(), newOwner);
        assertEq(owned.pendingOwner(), address(0));
    }

    function test_RevertAcceptOwnershipUnauthorized() public {
        vm.prank(owner);
        owned.transferOwnership(newOwner);
        
        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized()"));
        owned.acceptOwnership();
    }

    function test_RevertTransferOwnershipUnauthorized() public {
        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized()"));
        owned.transferOwnership(newOwner);
    }

    function test_RevertTransferOwnershipZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("InvalidOwner()"));
        owned.transferOwnership(address(0));
    }

    function test_RenounceOwnership() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(owner, address(0));
        owned.renounceOwnership();
        
        assertEq(owned.owner(), address(0));
        assertEq(owned.pendingOwner(), address(0));
    }

    function test_RevertRenounceOwnershipUnauthorized() public {
        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized()"));
        owned.renounceOwnership();
    }

    function test_CancelPendingTransfer() public {
        vm.prank(owner);
        owned.transferOwnership(newOwner);
        
        // Owner can initiate new transfer, canceling previous
        vm.prank(owner);
        owned.transferOwnership(unauthorized);
        
        assertEq(owned.pendingOwner(), unauthorized);
        
        // Old pending owner cannot accept
        vm.prank(newOwner);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized()"));
        owned.acceptOwnership();
    }

    function test_RevertConstructorZeroAddress() public {
        vm.expectRevert(abi.encodeWithSignature("InvalidOwner()"));
        new OwnedImplementation(address(0));
    }

    function test_TwoStepTransferComplete() public {
        // Step 1: Initiate
        vm.prank(owner);
        owned.transferOwnership(newOwner);
        
        // Verify intermediate state
        assertEq(owned.owner(), owner);
        assertEq(owned.pendingOwner(), newOwner);
        
        // Step 2: Accept
        vm.prank(newOwner);
        owned.acceptOwnership();
        
        // Verify final state
        assertEq(owned.owner(), newOwner);
        assertEq(owned.pendingOwner(), address(0));
        
        // New owner can now perform owner actions
        vm.prank(newOwner);
        owned.transferOwnership(owner);
        assertEq(owned.pendingOwner(), owner);
    }
}
