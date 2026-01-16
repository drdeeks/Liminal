// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";
import {Errors} from "./Errors.sol";

contract Leaderboard is Owned, Pausable {
    struct Entry {
        address user;
        uint256 score;
    }

    Entry[] public scores;
    mapping(address => uint256) public userScore;
    mapping(address => uint256) private userIndex;
    mapping(address => bool) public hasScore;
    mapping(address => bool) public authorizedUpdaters;
    mapping(address => uint256) private lastUpdateBlock;

    uint256 public constant MAX_SCORE_INCREMENT = 1000;
    uint256 public constant RATE_LIMIT_BLOCKS = 1;

    event ScoreUpdated(address indexed user, uint256 newTotalScore);
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);

    error InvalidScore();
    error RateLimited();
    error ScoreOverflow();

    constructor() Owned(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }

    function updateScore(address user, uint256 _scoreToAdd) external whenNotPaused {
        if (!authorizedUpdaters[msg.sender]) revert Errors.Unauthorized();
        if (_scoreToAdd == 0 || _scoreToAdd > MAX_SCORE_INCREMENT) revert InvalidScore();
        if (block.number < lastUpdateBlock[user] + RATE_LIMIT_BLOCKS) revert RateLimited();

        uint256 currentScore = userScore[user];
        uint256 newTotalScore;
        unchecked {
            newTotalScore = currentScore + _scoreToAdd;
            if (newTotalScore < currentScore) revert ScoreOverflow();
        }

        lastUpdateBlock[user] = block.number;
        userScore[user] = newTotalScore;

        if (!hasScore[user]) {
            scores.push(Entry(user, newTotalScore));
            userIndex[user] = scores.length - 1;
            hasScore[user] = true;
        } else {
            scores[userIndex[user]].score = newTotalScore;
        }

        emit ScoreUpdated(user, newTotalScore);
    }

    function getScores(uint256 offset, uint256 limit) external view returns (Entry[] memory, uint256 total) {
        total = scores.length;
        if (offset >= total) return (new Entry[](0), total);
        
        uint256 end = offset + limit > total ? total : offset + limit;
        uint256 size = end - offset;
        Entry[] memory result = new Entry[](size);
        
        for (uint256 i = 0; i < size; i++) {
            result[i] = scores[offset + i];
        }
        return (result, total);
    }

    function getScore(address _user) external view returns (uint256) {
        return userScore[_user];
    }

    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit UpdaterAuthorized(updater);
    }

    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit UpdaterRevoked(updater);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
