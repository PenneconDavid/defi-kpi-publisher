# KPI Pulse Demo Runbook (<=5 minutes)

## Objective

Demonstrate CRE workflow execution that ingests KPI data and drives onchain risk policy updates on Tenderly Virtual TestNet.

## Prerequisites

- `.env` configured from `.env.example`.
- `npm install` and `npm run build` completed.
- Tenderly Virtual TestNet Explorer open for the target network.

## Live Sequence

1. Show repository structure and `docs/JUDGING_MAP.md`.
2. Run `npm run deploy:vtn` and display addresses + deploy tx outputs.
3. Run `npm run seed:policy` to configure thresholds and requester allowlist.
4. Open Tenderly Explorer and verify the three deployed contracts.
5. Run `npm run simulate:cron`.
6. Show `KpiPublished` event + publish tx hash from script output.
7. Run `npm run emit:request`.
8. Run `npm run simulate:reactive`.
9. Show `UpdateRequested` + follow-up publish/apply tx hashes in Explorer.
10. Optionally run `npm run demo` for a single-command end-to-end proof output.
11. Close with `docs/JUDGING_MAP.md` requirement mapping.

## Expected Artifacts

- Contract creation transactions for all three contracts.
- At least one successful publish tx.
- One reactive request tx and one resulting workflow-driven action.
- Optional breach scenario showing mode change from `NORMAL` to `DEFENSIVE`.
