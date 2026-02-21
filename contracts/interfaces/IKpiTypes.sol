// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKpiTypes {
    enum RiskMode {
        NORMAL,
        DEFENSIVE
    }

    struct KpiSnapshot {
        uint256 tvlUsd;
        int256 change1dBps;
        int256 change7dBps;
        uint256 timestamp;
        bytes32 runId;
    }
}
