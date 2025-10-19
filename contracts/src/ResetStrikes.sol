// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title ResetStrikes
 * @dev Allows users to reset their strikes by paying a fee.
 * The contract is Ownable and includes ReentrancyGuard for security.
 */
contract ResetStrikes is Ownable, ReentrancyGuard {
    uint256 public price;

    error IncorrectPaymentAmount(uint256 sent, uint256 required);
    error WithdrawalFailed();
    error NewPriceIsZero();

    event StrikesReset(address indexed player);
    event PriceUpdated(uint256 newPrice);

    constructor(address initialOwner, uint256 _initialPrice) Ownable(initialOwner) {
        if (_initialPrice == 0) {
            revert NewPriceIsZero();
        }
        price = _initialPrice;
        emit PriceUpdated(_initialPrice);
    }

    /**
     * @dev Allows a user to reset their strikes by paying the required fee.
     */
    function resetStrikes() external payable nonReentrant {
        if (msg.value != price) {
            revert IncorrectPaymentAmount(msg.value, price);
        }

        // In a real-world scenario, this would interact with the main game contract.
        // For this example, we simply emit an event.
        emit StrikesReset(msg.sender);
    }

    /**
     * @dev Allows the owner to update the price for resetting strikes.
     * @param _newPrice The new price in wei.
     */
    function updatePrice(uint256 _newPrice) external onlyOwner {
        if (_newPrice == 0) {
            revert NewPriceIsZero();
        }
        price = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    /**
     * @dev Allows the owner to withdraw the contract's balance.
     */
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }
    }
}