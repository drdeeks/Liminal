// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";

contract GMR is Owned, Pausable {
    mapping(address => uint256) private lastGmBlock;
    uint256 public constant RATE_LIMIT_BLOCKS = 5;

    event Gm(address indexed user, uint256 timestamp);

    error RateLimited();

    constructor() Owned(msg.sender) {}

    function gm() external whenNotPaused {
        if (lastGmBlock[msg.sender] != 0 && block.number < lastGmBlock[msg.sender] + RATE_LIMIT_BLOCKS) {
            revert RateLimited();
        }
        
        lastGmBlock[msg.sender] = block.number;
        emit Gm(msg.sender, block.timestamp);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}