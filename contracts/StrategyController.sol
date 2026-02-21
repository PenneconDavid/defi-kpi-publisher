// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IKpiTypes} from "./interfaces/IKpiTypes.sol";

contract StrategyController is IKpiTypes {
    mapping(bytes32 protocolId => RiskMode) public modeOf;
    mapping(address caller => bool allowed) public canRequestUpdate;

    address public owner;

    event PolicyApplied(
        bytes32 indexed protocolId,
        RiskMode previousMode,
        RiskMode newMode,
        bytes32 reasonCode
    );

    event UpdateRequested(bytes32 indexed protocolId, address indexed requester, string reason);

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

    function setRequester(address requester, bool allowed) external onlyOwner {
        canRequestUpdate[requester] = allowed;
    }

    function requestUpdate(bytes32 protocolId, string calldata reason) external {
        require(canRequestUpdate[msg.sender], "not allowed");
        emit UpdateRequested(protocolId, msg.sender, reason);
    }

    function applyPolicy(bytes32 protocolId, RiskMode nextMode, bytes32 reasonCode) external onlyOwner {
        RiskMode previous = modeOf[protocolId];
        modeOf[protocolId] = nextMode;
        emit PolicyApplied(protocolId, previous, nextMode, reasonCode);
    }
}
