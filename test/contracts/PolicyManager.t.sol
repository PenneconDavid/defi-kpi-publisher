// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {PolicyManager} from "../../contracts/PolicyManager.sol";

contract PolicyManagerTest is Test {
    PolicyManager pm;
    address owner = address(0xA);
    address stranger = address(0xB);
    bytes32 protocolId = bytes32("AAVE");

    event PolicyConfigured(
        bytes32 indexed protocolId,
        int256 minChange1dBps,
        int256 minChange7dBps,
        uint256 minTvlUsd,
        uint256 cooldownSeconds,
        bool enabled
    );

    function setUp() public {
        pm = new PolicyManager(owner);
    }

    function test_constructorSetsOwner() public view {
        assertEq(pm.owner(), owner);
    }

    function test_configurePolicyStoresValues() public {
        PolicyManager.Policy memory policy = PolicyManager.Policy({
            minChange1dBps: -500,
            minChange7dBps: -1200,
            minTvlUsd: 1e18,
            cooldownSeconds: 600,
            enabled: true
        });

        vm.prank(owner);
        pm.configurePolicy(protocolId, policy);

        (int256 c1d, int256 c7d, uint256 tvl, uint256 cd, bool en) = pm.policyOf(protocolId);
        assertEq(c1d, -500);
        assertEq(c7d, -1200);
        assertEq(tvl, 1e18);
        assertEq(cd, 600);
        assertTrue(en);
    }

    function test_configurePolicyEmitsEvent() public {
        PolicyManager.Policy memory policy = PolicyManager.Policy({
            minChange1dBps: -500,
            minChange7dBps: -1200,
            minTvlUsd: 1e18,
            cooldownSeconds: 600,
            enabled: true
        });

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit PolicyConfigured(protocolId, -500, -1200, 1e18, 600, true);
        pm.configurePolicy(protocolId, policy);
    }

    function test_configurePolicyRevertsForStranger() public {
        PolicyManager.Policy memory policy = PolicyManager.Policy({
            minChange1dBps: -500,
            minChange7dBps: -1200,
            minTvlUsd: 1e18,
            cooldownSeconds: 600,
            enabled: true
        });

        vm.prank(stranger);
        vm.expectRevert("not owner");
        pm.configurePolicy(protocolId, policy);
    }

    function test_setOwnerUpdatesOwner() public {
        address newOwner = address(0xC);
        vm.prank(owner);
        pm.setOwner(newOwner);
        assertEq(pm.owner(), newOwner);
    }

    function test_setOwnerRevertsForStranger() public {
        vm.prank(stranger);
        vm.expectRevert("not owner");
        pm.setOwner(address(0xC));
    }

    function test_setOwnerRevertsForZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("invalid owner");
        pm.setOwner(address(0));
    }

    function test_policyCanBeUpdated() public {
        PolicyManager.Policy memory p1 = PolicyManager.Policy({
            minChange1dBps: -100,
            minChange7dBps: -200,
            minTvlUsd: 500,
            cooldownSeconds: 60,
            enabled: true
        });
        PolicyManager.Policy memory p2 = PolicyManager.Policy({
            minChange1dBps: -999,
            minChange7dBps: -1500,
            minTvlUsd: 1000,
            cooldownSeconds: 300,
            enabled: false
        });

        vm.startPrank(owner);
        pm.configurePolicy(protocolId, p1);
        pm.configurePolicy(protocolId, p2);
        vm.stopPrank();

        (int256 c1d,,,, bool en) = pm.policyOf(protocolId);
        assertEq(c1d, -999);
        assertFalse(en);
    }
}
