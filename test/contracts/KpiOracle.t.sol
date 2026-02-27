// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {KpiOracle} from "../../contracts/KpiOracle.sol";
import {IKpiTypes} from "../../contracts/interfaces/IKpiTypes.sol";

contract KpiOracleTest is Test {
    KpiOracle oracle;
    address publisher = address(0xA);
    address stranger = address(0xB);
    bytes32 protocolId = bytes32("AAVE");

    event KpiPublished(
        bytes32 indexed protocolId,
        uint256 tvlUsd,
        int256 change1dBps,
        int256 change7dBps,
        uint256 timestamp,
        bytes32 runId
    );

    function setUp() public {
        oracle = new KpiOracle(publisher);
    }

    function test_constructorSetsPublisher() public view {
        assertEq(oracle.publisher(), publisher);
    }

    function test_publishStoresSnapshot() public {
        vm.prank(publisher);
        oracle.publish(protocolId, 1e18, -200, 500, bytes32("run1"));

        (uint256 tvl, int256 c1d, int256 c7d, uint256 ts, bytes32 rid) =
            oracle.latestSnapshot(protocolId);

        assertEq(tvl, 1e18);
        assertEq(c1d, -200);
        assertEq(c7d, 500);
        assertEq(ts, block.timestamp);
        assertEq(rid, bytes32("run1"));
    }

    function test_publishEmitsEvent() public {
        vm.prank(publisher);
        vm.expectEmit(true, false, false, true);
        emit KpiPublished(protocolId, 1e18, -200, 500, block.timestamp, bytes32("run1"));
        oracle.publish(protocolId, 1e18, -200, 500, bytes32("run1"));
    }

    function test_publishOverwritesPriorSnapshot() public {
        vm.startPrank(publisher);
        oracle.publish(protocolId, 100, 0, 0, bytes32("first"));
        oracle.publish(protocolId, 200, -10, 20, bytes32("second"));
        vm.stopPrank();

        (uint256 tvl,,,,) = oracle.latestSnapshot(protocolId);
        assertEq(tvl, 200);
    }

    function test_publishRevertsForNonPublisher() public {
        vm.prank(stranger);
        vm.expectRevert("not publisher");
        oracle.publish(protocolId, 1e18, 0, 0, bytes32("run1"));
    }

    function test_setPublisherUpdatesPublisher() public {
        address newPub = address(0xC);
        vm.prank(publisher);
        oracle.setPublisher(newPub);
        assertEq(oracle.publisher(), newPub);
    }

    function test_setPublisherRevertsForStranger() public {
        vm.prank(stranger);
        vm.expectRevert("not publisher");
        oracle.setPublisher(address(0xC));
    }

    function test_setPublisherRevertsForZeroAddress() public {
        vm.prank(publisher);
        vm.expectRevert("invalid publisher");
        oracle.setPublisher(address(0));
    }

    function test_differentProtocolIdsAreIndependent() public {
        bytes32 idA = bytes32("AAVE");
        bytes32 idB = bytes32("COMP");

        vm.startPrank(publisher);
        oracle.publish(idA, 100, 10, 20, bytes32("rA"));
        oracle.publish(idB, 999, -5, -3, bytes32("rB"));
        vm.stopPrank();

        (uint256 tvlA,,,,) = oracle.latestSnapshot(idA);
        (uint256 tvlB,,,,) = oracle.latestSnapshot(idB);
        assertEq(tvlA, 100);
        assertEq(tvlB, 999);
    }
}
