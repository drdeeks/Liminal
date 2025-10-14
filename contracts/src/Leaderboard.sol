// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title Leaderboard
 * @dev A smart contract to manage a simple leaderboard.
 * Scores are cumulative.
 */
contract Leaderboard is Ownable, ReentrancyGuard {
    struct Player {
        uint256 score;
        uint256 lastSubmissionGameId;
        bool exists;
    }

    mapping(address => Player) public players;
    address[] public playerIndex;

    event ScoreSubmitted(address indexed player, uint256 score, uint256 totalScore);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Submits a score for the message sender.
     * @param _score The score to be added.
     * @param _gameId A unique identifier for the game session to prevent replay attacks.
     */
    function submitScore(uint256 _score, uint256 _gameId) external nonReentrant {
        require(_score > 0, "Score must be positive");

        Player storage player = players[msg.sender];

        // Ensure that a score for this specific game session hasn't been submitted before.
        require(_gameId > player.lastSubmissionGameId, "Score already submitted for this game");

        if (!player.exists) {
            // Add new player to index if they are not already on the leaderboard
            player.exists = true;
            playerIndex.push(msg.sender);
        }

        player.score += _score;
        player.lastSubmissionGameId = _gameId;

        emit ScoreSubmitted(msg.sender, _score, player.score);
    }

    /**
     * @dev Returns the number of players on the leaderboard.
     */
    function getPlayerCount() external view returns (uint256) {
        return playerIndex.length;
    }

    /**
     * @dev Returns a paginated list of players and their scores.
     * @param _page The page number to retrieve.
     * @param _pageSize The number of players per page.
     */
    function getLeaderboard(uint256 _page, uint256 _pageSize) external view returns (address[] memory, uint256[] memory) {
        require(_pageSize > 0, "Page size must be positive");
        uint256 playerCount = playerIndex.length;
        uint256 startIndex = _page * _pageSize;

        if (startIndex >= playerCount) {
            return (new address[](0), new uint256[](0));
        }

        uint256 endIndex = startIndex + _pageSize;
        if (endIndex > playerCount) {
            endIndex = playerCount;
        }

        uint256 size = endIndex - startIndex;
        address[] memory addresses = new address[](size);
        uint256[] memory scores = new uint256[](size);

        for (uint256 i = 0; i < size; i++) {
            address playerAddress = playerIndex[startIndex + i];
            addresses[i] = playerAddress;
            scores[i] = players[playerAddress].score;
        }

        return (addresses, scores);
    }
}