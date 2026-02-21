// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PolicyManager {
    struct Policy {
        int256 minChange1dBps;
        int256 minChange7dBps;
        uint256 minTvlUsd;
        uint256 cooldownSeconds;
        bool enabled;
    }

    mapping(bytes32 protocolId => Policy) public policyOf;
    address public owner;

    event PolicyConfigured(
        bytes32 indexed protocolId,
        int256 minChange1dBps,
        int256 minChange7dBps,
        uint256 minTvlUsd,
        uint256 cooldownSeconds,
        bool enabled
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address initialOwner) {
        owner = initialOwner;
    }

    function setOwner(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "invalid owner");
        owner = nextOwner;
    }

    function configurePolicy(bytes32 protocolId, Policy calldata policy) external onlyOwner {
        policyOf[protocolId] = policy;
        emit PolicyConfigured(
            protocolId,
            policy.minChange1dBps,
            policy.minChange7dBps,
            policy.minTvlUsd,
            policy.cooldownSeconds,
            policy.enabled
        );
    }
}
