// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Context} from "./Context.sol";
import {Errors} from "./Errors.sol";

abstract contract Pausable is Context {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() {
        _paused = false;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    modifier whenNotPaused() {
        if (_paused) revert Errors.ContractPaused();
        _;
    }

    modifier whenPaused() {
        if (!_paused) revert Errors.ContractNotPaused();
        _;
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}