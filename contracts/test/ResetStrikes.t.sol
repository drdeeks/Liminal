// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ResetStrikes} from "../src/ResetStrikes.sol";

contract MockAggregator {
    int256 public price;
    uint256 public updatedAt;
    uint80 public roundId;
    uint80 public answeredInRound;

    function setPrice(int256 _price) external {
        price = _price;
        updatedAt = block.timestamp;
        roundId++;
        answeredInRound = roundId;
    }

    function setStalePrice(int256 _price, uint256 _updatedAt) external {
        price = _price;
        updatedAt = _updatedAt;
        roundId++;
        answeredInRound = roundId;
    }

    function setStaleRound(int256 _price) external {
        price = _price;
        updatedAt = block.timestamp;
        roundId++;
        answeredInRound = roundId - 1;
    }

    function latestRoundData() external view returns (
        uint80 _roundId,
        int256 answer,
        uint256 startedAt,
        uint256 _updatedAt,
        uint80 _answeredInRound
    ) {
        return (roundId, price, 0, updatedAt, answeredInRound);
    }
}

contract ResetStrikesTest is Test {
    ResetStrikes public resetStrikes;
    MockAggregator public mockAggregator;
    address public owner = address(1);
    address public user = address(2);

    event StrikesReset(address indexed user, uint256 ethPaid);

    function setUp() public {
        mockAggregator = new MockAggregator();
        mockAggregator.setPrice(2000e8); // $2000 ETH/USD
        
        vm.prank(owner);
        resetStrikes = new ResetStrikes(address(mockAggregator), 5); // 5 cents
    }

    function test_ResetStrikes() public {
        mockAggregator.setPrice(2000e8); // $2000
        
        // 5 cents = $0.05
        // Required ETH = 0.05 / 2000 = 0.000025 ETH = 25000000000000 wei
        uint256 requiredEth = (5 * 1e26) / 2000e8;
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit StrikesReset(user, requiredEth);
        resetStrikes.resetStrikes{value: requiredEth}();
    }

    function test_ResetStrikesWithRefund() public {
        mockAggregator.setPrice(2000e8);
        
        uint256 requiredEth = (5 * 1e26) / 2000e8;
        uint256 sentEth = requiredEth * 2;
        
        vm.deal(user, 1 ether);
        uint256 balanceBefore = user.balance;
        
        vm.prank(user);
        resetStrikes.resetStrikes{value: sentEth}();
        
        uint256 balanceAfter = user.balance;
        assertEq(balanceBefore - balanceAfter, requiredEth);
    }

    function test_RevertInsufficientPayment() public {
        mockAggregator.setPrice(2000e8);
        
        uint256 requiredEth = (5 * 1e26) / 2000e8;
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(ResetStrikes.InsufficientPayment.selector);
        resetStrikes.resetStrikes{value: requiredEth - 1}();
    }

    function test_RevertStalePrice() public {
        uint256 staleTime = block.timestamp > 3601 ? block.timestamp - 3601 : 0;
        mockAggregator.setStalePrice(2000e8, staleTime);
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(ResetStrikes.StalePrice.selector);
        resetStrikes.resetStrikes{value: 0.001 ether}();
    }

    function test_RevertStaleRound() public {
        mockAggregator.setStaleRound(2000e8);
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(ResetStrikes.StalePrice.selector);
        resetStrikes.resetStrikes{value: 0.001 ether}();
    }

    function test_RevertInvalidPriceNegative() public {
        mockAggregator.setPrice(-1);
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(ResetStrikes.InvalidPrice.selector);
        resetStrikes.resetStrikes{value: 0.001 ether}();
    }

    function test_RevertInvalidPriceTooLow() public {
        mockAggregator.setPrice(1e5); // $1
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(ResetStrikes.InvalidPrice.selector);
        resetStrikes.resetStrikes{value: 0.001 ether}();
    }

    function test_RevertInvalidPriceTooHigh() public {
        mockAggregator.setPrice(1e14); // $1M
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(ResetStrikes.InvalidPrice.selector);
        resetStrikes.resetStrikes{value: 0.001 ether}();
    }

    function test_SetPriceFeed() public {
        MockAggregator newAggregator = new MockAggregator();
        newAggregator.setPrice(3000e8);
        
        vm.prank(owner);
        resetStrikes.setPriceFeed(address(newAggregator));
        
        assertEq(address(resetStrikes.priceFeed()), address(newAggregator));
    }

    function test_RevertSetPriceFeedZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(ResetStrikes.InvalidPriceFeed.selector);
        resetStrikes.setPriceFeed(address(0));
    }

    function test_SetUsdCostInCents() public {
        vm.prank(owner);
        resetStrikes.setUsdCostInCents(10);
        
        assertEq(resetStrikes.usdCostInCents(), 10);
    }

    function test_RevertSetUsdCostZero() public {
        vm.prank(owner);
        vm.expectRevert(ResetStrikes.InvalidCost.selector);
        resetStrikes.setUsdCostInCents(0);
    }

    function test_RevertSetUsdCostTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(ResetStrikes.InvalidCost.selector);
        resetStrikes.setUsdCostInCents(10001);
    }

    function test_Withdraw() public {
        mockAggregator.setPrice(2000e8);
        
        uint256 requiredEth = (5 * 1e26) / 2000e8;
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        resetStrikes.resetStrikes{value: requiredEth}();
        
        uint256 ownerBalanceBefore = owner.balance;
        
        vm.prank(owner);
        resetStrikes.withdraw();
        
        assertEq(owner.balance - ownerBalanceBefore, requiredEth);
        assertEq(address(resetStrikes).balance, 0);
    }

    function test_PauseUnpause() public {
        vm.prank(owner);
        resetStrikes.pause();
        assertTrue(resetStrikes.paused());
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("ContractPaused()"));
        resetStrikes.resetStrikes{value: 0.001 ether}();
        
        vm.prank(owner);
        resetStrikes.unpause();
        assertFalse(resetStrikes.paused());
    }

    function test_RevertConstructorZeroAddress() public {
        vm.expectRevert(ResetStrikes.InvalidPriceFeed.selector);
        new ResetStrikes(address(0), 5);
    }

    function test_RevertConstructorInvalidCost() public {
        vm.expectRevert(ResetStrikes.InvalidCost.selector);
        new ResetStrikes(address(mockAggregator), 0);
        
        vm.expectRevert(ResetStrikes.InvalidCost.selector);
        new ResetStrikes(address(mockAggregator), 10001);
    }

    function testFuzz_ResetStrikesVariousPrices(uint256 price) public {
        price = bound(price, 1e6, 1e13); // $10 to $100k
        mockAggregator.setPrice(int256(price));
        
        uint256 requiredEth = (5 * 1e26) / price;
        
        // Ensure we send enough
        if (requiredEth > 0) {
            vm.deal(user, requiredEth * 2);
            vm.prank(user);
            resetStrikes.resetStrikes{value: requiredEth}();
        }
    }
}
