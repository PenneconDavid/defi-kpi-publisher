// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {KpiOracle} from "../../contracts/KpiOracle.sol";
import {PolicyManager} from "../../contracts/PolicyManager.sol";
import {StrategyController} from "../../contracts/StrategyController.sol";
import {IKpiTypes} from "../../contracts/interfaces/IKpiTypes.sol";

contract IntegrationTest is Test {
    KpiOracle oracle;
    PolicyManager pm;
    StrategyController sc;

    address deployer;
    address requester = address(0xBEEF);
    bytes32 protocolId = bytes32("AAVE");

    function setUp() public {
        deployer = address(this);
        oracle = new KpiOracle(deployer);
        pm = new PolicyManager(deployer);
        sc = new StrategyController(deployer);

        pm.configurePolicy(
            protocolId,
            PolicyManager.Policy({
                minChange1dBps: -500,
                minChange7dBps: -1200,
                minTvlUsd: 1_000_000,
                cooldownSeconds: 600,
                enabled: true
            })
        );

        sc.setRequester(requester, true);
    }

    function test_happyPathNoBreachKeepsNormal() public {
        oracle.publish(protocolId, 50_000_000, 100, 200, bytes32("run-happy"));

        (uint256 tvl, int256 c1d, int256 c7d,,) = oracle.latestSnapshot(protocolId);
        assertEq(tvl, 50_000_000);
        assertEq(c1d, 100);
        assertEq(c7d, 200);

        bool breach = _evaluatePolicy(tvl, c1d, c7d);
        assertFalse(breach);

        assertEq(uint8(sc.modeOf(protocolId)), uint8(IKpiTypes.RiskMode.NORMAL));
    }

    function test_breachPathTriggersDefensive() public {
        oracle.publish(protocolId, 500_000, -600, -1300, bytes32("run-breach"));

        (uint256 tvl, int256 c1d, int256 c7d,,) = oracle.latestSnapshot(protocolId);
        bool breach = _evaluatePolicy(tvl, c1d, c7d);
        assertTrue(breach);

        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.DEFENSIVE, bytes32("KPI_BREACH"));
        assertEq(uint8(sc.modeOf(protocolId)), uint8(IKpiTypes.RiskMode.DEFENSIVE));
    }

    function test_recoveryPathRestoresNormal() public {
        oracle.publish(protocolId, 500_000, -600, -1300, bytes32("run-breach"));
        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.DEFENSIVE, bytes32("KPI_BREACH"));
        assertEq(uint8(sc.modeOf(protocolId)), uint8(IKpiTypes.RiskMode.DEFENSIVE));

        oracle.publish(protocolId, 50_000_000, 100, 200, bytes32("run-recovery"));
        (uint256 tvl, int256 c1d, int256 c7d,,) = oracle.latestSnapshot(protocolId);
        bool breach = _evaluatePolicy(tvl, c1d, c7d);
        assertFalse(breach);

        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.NORMAL, bytes32("KPI_RECOVERED"));
        assertEq(uint8(sc.modeOf(protocolId)), uint8(IKpiTypes.RiskMode.NORMAL));
    }

    function test_reactiveRequestUpdateFlow() public {
        vm.prank(requester);
        sc.requestUpdate(protocolId, "manual-check");

        oracle.publish(protocolId, 50_000_000, 50, 80, bytes32("run-reactive"));

        (uint256 tvl, int256 c1d, int256 c7d,,) = oracle.latestSnapshot(protocolId);
        bool breach = _evaluatePolicy(tvl, c1d, c7d);
        assertFalse(breach);
    }

    function _evaluatePolicy(uint256 tvl, int256 c1d, int256 c7d) internal view returns (bool) {
        (int256 minC1d, int256 minC7d, uint256 minTvl,,) = pm.policyOf(protocolId);
        return tvl < minTvl || c1d < minC1d || c7d < minC7d;
    }
}
