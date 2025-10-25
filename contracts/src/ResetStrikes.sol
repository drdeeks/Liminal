// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";
import {AggregatorV3Interface} from "./interfaces/AggregatorV3Interface.sol";

contract ResetStrikes is Owned, Pausable {
    AggregatorV3Interface public priceFeed;
    uint256 public usdCostInCents; // e.g., 5 for 0.05 USD

    event StrikesReset(address indexed user);

    constructor(address _priceFeedAddress, uint256 _usdCostInCents) Owned(msg.sender) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        usdCostInCents = _usdCostInCents;
    }

    function resetStrikes() external payable whenNotPaused {
        (, int256 price, , ,) = priceFeed.latestRoundData();
        uint256 ethUsdPrice = uint256(price); // Price is in 8 decimals

        // Calculate required ETH for usdCostInCents
        // usdCostInCents * 10^18 (for wei) / (ethUsdPrice * 10^6) (to convert 8 decimals to 2 decimals for cents)
        // Simplified: usdCostInCents * 10^12 / ethUsdPrice
        uint256 requiredEthInWei = (usdCostInCents * (10**12) * (10**18)) / ethUsdPrice;

        require(msg.value >= requiredEthInWei, "Not enough ether sent");
        emit StrikesReset(msg.sender);
    }

    function setPriceFeed(address _newPriceFeedAddress) external onlyOwner {
        priceFeed = AggregatorV3Interface(_newPriceFeedAddress);
    }

    function setUsdCostInCents(uint256 _newUsdCostInCents) external onlyOwner {
        usdCostInCents = _newUsdCostInCents;
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
