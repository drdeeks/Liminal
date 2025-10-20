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

    event ScoreUpdated(address indexed user, uint256 score);

    constructor() Owned(msg.sender) {}

    function updateScore(address _user, uint256 _score) external onlyOwner whenNotPaused {
        require(_user != address(0), "Invalid user address");
        userScore[_user] = _score;
        if (!hasScore[_user]) {
            scores.push(Entry(_user, _score));
            userIndex[_user] = scores.length - 1;
            hasScore[_user] = true;
        } else {
            scores[userIndex[_user]].score = _score;
        }
        emit ScoreUpdated(_user, _score);
    }

    function getScores() external view returns (Entry[] memory) {
        return scores;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
