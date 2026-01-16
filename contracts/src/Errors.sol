// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Common errors used across contracts
library Errors {
    error Unauthorized();
    error InvalidOwner();
    error ContractPaused();
    error ContractNotPaused();
}
