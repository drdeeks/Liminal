// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";

contract Leaderboard is Owned, Pausable {
    struct Entry {
        address user;
        uint256 score;
    }

    Entry[] public scores;
    mapping(address => uint256) public userScore;
    mapping(address => uint256) private userIndex;
    mapping(address => bool) public hasScore;

    event ScoreUpdated(address indexed user, uint256 newTotalScore);

    constructor() Owned(msg.sender) {}

    function updateScore(uint256 _scoreToAdd) external whenNotPaused {
        address user = msg.sender;

        uint256 newTotalScore = userScore[user] + _scoreToAdd;
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

    function getScores() external view returns (Entry[] memory) {
        return scores;
    }

    function getScore(address _user) external view returns (uint256) {
        return userScore[_user];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
