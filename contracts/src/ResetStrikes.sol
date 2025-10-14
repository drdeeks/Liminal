// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title ResetStrikes
 * @dev A smart contract to allow users to reset their strikes by paying a fee.
 */
contract ResetStrikes is Ownable, ReentrancyGuard {
    uint256 public price;

    event StrikesReset(address indexed player);

    constructor(uint256 _initialPrice) Ownable(msg.sender) {
        price = _initialPrice;
    }

    /**
     * @dev Allows a user to reset their strikes by paying the required fee.
     */
    function resetStrikes() external payable nonReentrant {
        require(msg.value == price, "Incorrect payment amount");

        // Here you would typically interact with your game's main contract
        // to reset the strikes for the player. For this example, we'll just
        // emit an event.
        emit StrikesReset(msg.sender);
    }

    /**
     * @dev Allows the owner to update the price for resetting strikes.
     * @param _newPrice The new price in wei.
     */
    function updatePrice(uint256 _newPrice) external onlyOwner {
        price = _newPrice;
    }

    /**
     * @dev Allows the owner to withdraw the contract's balance.
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}