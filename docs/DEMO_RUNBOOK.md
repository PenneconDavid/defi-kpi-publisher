# KPI Pulse Demo Runbook (<=5 minutes)

## Objective

Demonstrate CRE workflow execution that ingests KPI data and drives onchain risk policy updates on Tenderly Virtual TestNet.

## Prerequisites

- `.env` configured from `.env.example`.
- `npm install` and `cd cre-workflow && bun install && cd ..` completed.
- `npm run build` completed.
- `cre login` completed.
- Tenderly Virtual TestNet Explorer open.

## Live Sequence

### Part 1: Contract deployment and setup (~1 min)

1. Show repository structure and key files.
2. Run `npm run deploy:vtn` -- display deployed addresses.
3. Run `npm run seed:policy` -- configure thresholds + requester allowlist.
4. Open Tenderly Explorer and show the three deployed contracts + setup txs.

### Part 2: CRE workflow simulation (~2 min)

5. Run `cre workflow simulate cre-workflow --non-interactive --trigger-index 0`.
6. Walk through the log output:
   - Cron trigger fires
   - HTTPClient fetches live TVL from DefiLlama (consensus-backed)
   - EVMClient reads prior snapshot from KpiOracle
   - Change computed from onchain history
   - runtime.report() + writeReport publishes new snapshot
   - evaluatePolicy evaluates thresholds
   - No breach -> mode stays NORMAL
7. Show the simulation success message.

### Part 3: TypeScript demo flow (~1.5 min)

8. Run `npm run demo` -- show full JSON output with tx hashes.
9. Open Tenderly Explorer and click through:
   - `KpiPublished` event on KpiOracle
   - `UpdateRequested` event on StrategyController
   - Policy seed and requester allowlist txs
10. Point out Explorer links printed in demo output.

### Part 4: Wrap-up (~30 sec)

11. Show `docs/JUDGING_MAP.md` mapping each requirement to evidence.
12. Highlight: CRE simulation + Tenderly VTN + 49 passing tests.

## Verified Artifacts (from live run)

- Deployed contracts:
  - KpiOracle: `0xD70943E223Ce5138849f282e661b1499A5b1Ff88`
  - PolicyManager: `0x6Ac7f46593d3b184dc09eDa7F87F18bA01083d22`
  - StrategyController: `0xf719e37c838236EF84d2D9A55FE08bd811E732D3`
- Demo proactive publish tx: `0x2a03878b5f8e3c233cd6df77e46d5b863fabe5e951f26bd0711556bcf9f5d468`
- Demo reactive publish tx: `0x225e27d75922be49ff3bbad504ae0a0899a60edb884d710b3c1527a66cd4cb62`
- Reactive trigger tx: `0x6fa7b93ab3b1caecffcd5f14469ed787c170ee07ee60d5ca433a797f1fb1daf6`
- CRE simulation: successful cron trigger execution with live DefiLlama TVL
- Explorer: https://dashboard.tenderly.co/explorer/vnet/648321a4-4a78-4ff7-a072-d6a8c7aa639c/transactions
