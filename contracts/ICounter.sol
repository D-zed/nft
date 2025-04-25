// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ICounter {
    function increment() external pure;
}

contract Counter1 is ICounter {
    function increment() public pure override {}
}
