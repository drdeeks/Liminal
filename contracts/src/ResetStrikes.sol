// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";

contract ResetStrikes is Owned, Pausable {
    uint256 public cost;

    event StrikesReset(address indexed user);

    constructor(uint256 _initialCost) Owned(msg.sender) {
        cost = _initialCost;
    }

    function resetStrikes() external payable whenNotPaused {
        require(msg.value >= cost, "Not enough ether sent");
        emit StrikesReset(msg.sender);
    }

    function setCost(uint256 _newCost) external onlyOwner {
        cost = _newCost;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
