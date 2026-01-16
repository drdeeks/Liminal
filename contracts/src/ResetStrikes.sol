// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";
import {AggregatorV3Interface} from "./interfaces/AggregatorV3Interface.sol";

contract ResetStrikes is Owned, Pausable {
    AggregatorV3Interface public priceFeed;
    uint256 public usdCostInCents;
    uint256 public constant MAX_STALENESS = 3600; // 1 hour
    uint256 public constant MIN_PRICE = 1e6; // $10 minimum (8 decimals)
    uint256 public constant MAX_PRICE = 1e13; // $100k maximum (8 decimals)

    event StrikesReset(address indexed user, uint256 ethPaid);
    event PriceFeedUpdated(address indexed newPriceFeed);
    event UsdCostUpdated(uint256 newCostInCents);

    error StalePrice();
    error InvalidPrice();
    error InsufficientPayment();
    error InvalidPriceFeed();
    error InvalidCost();
    error WithdrawFailed();

    constructor(address _priceFeedAddress, uint256 _usdCostInCents) Owned(msg.sender) {
        if (_priceFeedAddress == address(0)) revert InvalidPriceFeed();
        if (_usdCostInCents == 0 || _usdCostInCents > 10000) revert InvalidCost();
        
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        usdCostInCents = _usdCostInCents;
    }

    function resetStrikes() external payable whenNotPaused {
        (uint80 roundId, int256 price, , uint256 updatedAt, uint80 answeredInRound) = priceFeed.latestRoundData();
        
        if (price <= 0) revert InvalidPrice();
        if (updatedAt == 0 || block.timestamp - updatedAt > MAX_STALENESS) revert StalePrice();
        if (answeredInRound < roundId) revert StalePrice();
        
        uint256 ethUsdPrice = uint256(price);
        if (ethUsdPrice < MIN_PRICE || ethUsdPrice > MAX_PRICE) revert InvalidPrice();

        uint256 requiredEthInWei = (usdCostInCents * 1e26) / ethUsdPrice;
        if (msg.value < requiredEthInWei) revert InsufficientPayment();

        emit StrikesReset(msg.sender, msg.value);

        // Refund excess
        unchecked {
            uint256 excess = msg.value - requiredEthInWei;
            if (excess > 0) {
                (bool success, ) = msg.sender.call{value: excess}("");
                if (!success) revert WithdrawFailed();
            }
        }
    }

    function setPriceFeed(address _newPriceFeedAddress) external onlyOwner {
        if (_newPriceFeedAddress == address(0)) revert InvalidPriceFeed();
        priceFeed = AggregatorV3Interface(_newPriceFeedAddress);
        emit PriceFeedUpdated(_newPriceFeedAddress);
    }

    function setUsdCostInCents(uint256 _newUsdCostInCents) external onlyOwner {
        if (_newUsdCostInCents == 0 || _newUsdCostInCents > 10000) revert InvalidCost();
        usdCostInCents = _newUsdCostInCents;
        emit UsdCostUpdated(_newUsdCostInCents);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawFailed();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
