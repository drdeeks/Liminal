// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";

contract GMR is Owned, Pausable {
    event Gm(address indexed user);

    constructor() Owned(msg.sender) {}

    function gm() external whenNotPaused {
        emit Gm(msg.sender);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}