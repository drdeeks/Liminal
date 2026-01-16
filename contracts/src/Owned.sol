// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Errors} from "./Errors.sol";

/// @notice Simple single owner authorization mixin with two-step transfer.
/// @author Modified from Solmate (https://github.com/transmissions11/solmate/blob/main/src/auth/Owned.sol)
abstract contract Owned {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /*//////////////////////////////////////////////////////////////
                            OWNERSHIP STORAGE
    //////////////////////////////////////////////////////////////*/

    address public owner;
    address public pendingOwner;

    modifier onlyOwner() virtual {
        if (msg.sender != owner) revert Errors.Unauthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _owner) {
        if (_owner == address(0)) revert Errors.InvalidOwner();
        owner = _owner;
        emit OwnershipTransferred(address(0), _owner);
    }

    /*//////////////////////////////////////////////////////////////
                             OWNERSHIP LOGIC
    //////////////////////////////////////////////////////////////*/

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) revert Errors.InvalidOwner();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() public virtual {
        if (msg.sender != pendingOwner) revert Errors.Unauthorized();
        address oldOwner = owner;
        owner = pendingOwner;
        delete pendingOwner;
        emit OwnershipTransferred(oldOwner, owner);
    }

    function renounceOwnership() public virtual onlyOwner {
        owner = address(0);
        delete pendingOwner;
        emit OwnershipTransferred(msg.sender, address(0));
    }
}
