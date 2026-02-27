// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {StrategyController} from "../../contracts/StrategyController.sol";
import {IKpiTypes} from "../../contracts/interfaces/IKpiTypes.sol";

contract StrategyControllerTest is Test {
    StrategyController sc;
    address owner = address(0xA);
    address requester = address(0xB);
    address stranger = address(0xC);
    bytes32 protocolId = bytes32("AAVE");

    event PolicyApplied(
        bytes32 indexed protocolId,
        IKpiTypes.RiskMode previousMode,
        IKpiTypes.RiskMode newMode,
        bytes32 reasonCode
    );

    event UpdateRequested(bytes32 indexed protocolId, address indexed requester, string reason);

    function setUp() public {
        sc = new StrategyController(owner);
    }

    function test_constructorSetsOwner() public view {
        assertEq(sc.owner(), owner);
    }

    function test_defaultModeIsNormal() public view {
        uint8 mode = uint8(sc.modeOf(protocolId));
        assertEq(mode, uint8(IKpiTypes.RiskMode.NORMAL));
    }

    // --- setRequester ---

    function test_setRequesterAllowsCaller() public {
        vm.prank(owner);
        sc.setRequester(requester, true);
        assertTrue(sc.canRequestUpdate(requester));
    }

    function test_setRequesterRevokesAccess() public {
        vm.startPrank(owner);
        sc.setRequester(requester, true);
        sc.setRequester(requester, false);
        vm.stopPrank();
        assertFalse(sc.canRequestUpdate(requester));
    }

    function test_setRequesterRevertsForStranger() public {
        vm.prank(stranger);
        vm.expectRevert("not owner");
        sc.setRequester(requester, true);
    }

    // --- requestUpdate ---

    function test_requestUpdateEmitsEvent() public {
        vm.prank(owner);
        sc.setRequester(requester, true);

        vm.prank(requester);
        vm.expectEmit(true, true, false, true);
        emit UpdateRequested(protocolId, requester, "test-reason");
        sc.requestUpdate(protocolId, "test-reason");
    }

    function test_requestUpdateRevertsForNonAllowed() public {
        vm.prank(stranger);
        vm.expectRevert("not allowed");
        sc.requestUpdate(protocolId, "should-fail");
    }

    // --- applyPolicy ---

    function test_applyPolicySetsMode() public {
        vm.prank(owner);
        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.DEFENSIVE, bytes32("BREACH"));
        assertEq(uint8(sc.modeOf(protocolId)), uint8(IKpiTypes.RiskMode.DEFENSIVE));
    }

    function test_applyPolicyEmitsEvent() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit PolicyApplied(
            protocolId, IKpiTypes.RiskMode.NORMAL, IKpiTypes.RiskMode.DEFENSIVE, bytes32("BREACH")
        );
        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.DEFENSIVE, bytes32("BREACH"));
    }

    function test_applyPolicyRecordsPreviousMode() public {
        vm.startPrank(owner);
        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.DEFENSIVE, bytes32("BREACH"));
        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.NORMAL, bytes32("RECOVERY"));
        vm.stopPrank();

        assertEq(uint8(sc.modeOf(protocolId)), uint8(IKpiTypes.RiskMode.NORMAL));
    }

    function test_applyPolicyRevertsForStranger() public {
        vm.prank(stranger);
        vm.expectRevert("not owner");
        sc.applyPolicy(protocolId, IKpiTypes.RiskMode.DEFENSIVE, bytes32("X"));
    }

    // --- setOwner ---

    function test_setOwnerUpdatesOwner() public {
        address newOwner = address(0xD);
        vm.prank(owner);
        sc.setOwner(newOwner);
        assertEq(sc.owner(), newOwner);
    }

    function test_setOwnerRevertsForStranger() public {
        vm.prank(stranger);
        vm.expectRevert("not owner");
        sc.setOwner(address(0xD));
    }

    function test_setOwnerRevertsForZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("invalid owner");
        sc.setOwner(address(0));
    }
}
