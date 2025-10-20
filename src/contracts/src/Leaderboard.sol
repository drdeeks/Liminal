// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ReentrancyGuard } from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title Leaderboard
 * @dev Manages a cumulative leaderboard with protection against replay attacks.
 * Scores are sorted in descending order.
 */
contract Leaderboard is Ownable, ReentrancyGuard {
    struct Player {
        uint256 score;
        uint256 lastSubmissionGameId;
    }

    mapping(address => Player) public players;
    address[] public playerIndex;
    mapping(address => uint256) public playerRanks;

    error InvalidScore();
    error GameAlreadySubmitted();
    error NoPlayersOnLeaderboard();

    event ScoreSubmitted(address indexed player, uint256 score, uint256 totalScore);

    constructor(address initialOwner) Ownable(initialOwner) { }

    /**
     * @dev Submits a score for the message sender.
     * @param _score The score to be added.
     * @param _gameId A unique identifier for the game session to prevent replay attacks.
     */
    function submitScore(uint256 _score, uint256 _gameId) external nonReentrant {
        if (_score == 0) {
            revert InvalidScore();
        }

        Player storage player = players[msg.sender];

        if (_gameId <= player.lastSubmissionGameId) {
            revert GameAlreadySubmitted();
        }

        if (player.score == 0) {
            playerIndex.push(msg.sender);
            playerRanks[msg.sender] = playerIndex.length; // Initial rank
        }

        player.score += _score;
        player.lastSubmissionGameId = _gameId;

        _updateRank(msg.sender);

        emit ScoreSubmitted(msg.sender, _score, player.score);
    }

    /**
     * @dev Updates the rank of a player after a score submission.
     * This function maintains a sorted leaderboard.
     */
    function _updateRank(address _player) internal {
        uint256 rank = playerRanks[_player];
        uint256 currentScore = players[_player].score;

        // Bubble up the player to their correct rank
        while (rank > 1 && currentScore > players[playerIndex[rank - 2]].score) {
            address playerToSwap = playerIndex[rank - 2];

            // Swap players in the index
            playerIndex[rank - 1] = playerToSwap;
            playerIndex[rank - 2] = _player;

            // Update ranks
            playerRanks[_player] = rank - 1;
            playerRanks[playerToSwap] = rank;

            rank--;
        }
    }

    /**
     * @dev Returns the number of players on the leaderboard.
     */
    function getPlayerCount() external view returns (uint256) {
        return playerIndex.length;
    }

    /**
     * @dev Returns a paginated list of top players and their scores.
     * @param _page The page number to retrieve.
     * @param _pageSize The number of players per page.
     */
    function getLeaderboard(
        uint256 _page,
        uint256 _pageSize
    )
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        if (_pageSize == 0) {
            return (new address[](0), new uint256[](0));
        }

        uint256 playerCount = playerIndex.length;
        if (playerCount == 0) {
            revert NoPlayersOnLeaderboard();
        }
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

    /**
     * @dev Returns the rank of a specific player.
     * @param _player The address of the player.
     * @return The rank of the player (1-based). Returns 0 if the player is not on the leaderboard.
     */
    function getPlayerRank(address _player) external view returns (uint256) {
        return playerRanks[_player];
    }
}
