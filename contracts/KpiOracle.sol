// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IKpiTypes} from "./interfaces/IKpiTypes.sol";

contract KpiOracle is IKpiTypes {
    mapping(bytes32 protocolId => KpiSnapshot) public latestSnapshot;
    address public publisher;

    event KpiPublished(
        bytes32 indexed protocolId,
        uint256 tvlUsd,
        int256 change1dBps,
        int256 change7dBps,
        uint256 timestamp,
        bytes32 runId
    );

    constructor(address initialPublisher) {
        publisher = initialPublisher;
    }

    function setPublisher(address nextPublisher) external {
        require(nextPublisher != address(0), "invalid publisher");
        require(msg.sender == publisher, "not publisher");
        publisher = nextPublisher;
    }

    function publish(
        bytes32 protocolId,
        uint256 tvlUsd,
        int256 change1dBps,
        int256 change7dBps,
        bytes32 runId
    ) external {
        require(msg.sender == publisher, "not publisher");

        KpiSnapshot memory snap = KpiSnapshot({
            tvlUsd: tvlUsd,
            change1dBps: change1dBps,
            change7dBps: change7dBps,
            timestamp: block.timestamp,
            runId: runId
        });

        latestSnapshot[protocolId] = snap;
        emit KpiPublished(protocolId, tvlUsd, change1dBps, change7dBps, block.timestamp, runId);
    }
}
