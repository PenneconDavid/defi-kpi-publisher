# KPI Pulse Demo Runbook (<=5 minutes)

## Objective

Demonstrate CRE workflow execution that ingests KPI data and drives onchain risk policy updates on Tenderly Virtual TestNet.

## Prerequisites

- Deployed contract addresses available.
- Workflow package configured for target chain.
- Tenderly Virtual TestNet Explorer open.

## Live Sequence

1. Show repository structure and `docs/JUDGING_MAP.md`.
2. Run `npm run deploy:vtn` and display deployment outputs.
3. Open Tenderly Explorer and verify all core contracts are deployed.
4. Run `npm run simulate:cron` (or trigger one deployed cron run).
5. Show `KpiPublished` event + corresponding publish tx.
6. Run `npm run emit-request-update`.
7. Show `UpdateRequested` event and subsequent reactive workflow tx.
8. Show conditional `PolicyApplied` event and mode transition tx.
9. Close with requirement-to-proof mapping and explorer links.

## Expected Artifacts

- Contract creation transactions for all three contracts.
- At least one successful publish tx.
- One reactive request tx and one resulting workflow-driven action.
- Optional breach scenario showing mode change from `NORMAL` to `DEFENSIVE`.
