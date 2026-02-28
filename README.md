# KPI Pulse

CRE-driven DeFi KPI oracle that ingests public SaaS KPIs and automatically toggles an onchain strategy risk mode when policy thresholds are crossed.

## Hackathon Context

- Event: Chainlink Convergence Hackathon (Feb 6 - Mar 1)
- Core requirement: meaningful Chainlink Runtime Environment (CRE) usage
- Target submission angle:
  - Primary: Risk & Compliance
  - Secondary: DeFi & Tokenization
  - Bonus challenge: Tenderly Virtual TestNets

## Current Implementation Status

- Foundry build flow + TypeScript deployment flow for `KpiOracle`, `PolicyManager`, `StrategyController`
- CRE SDK-native workflow package (`cre-workflow/`) with real trigger/callback/capability wiring
- TypeScript demo scripts for local deployment and end-to-end scenario execution
- DefiLlama KPI fetch via CRE HTTPClient + normalization
- Onchain publish and conditional policy application via CRE report + writeReport
- Foundry unit tests (35 Solidity tests) and TypeScript logic tests (15 tests)

## Architecture at a Glance

Two CRE workflows share one execution path:

1. Proactive cron trigger:
   - Fetch KPI data from public endpoint(s)
   - Normalize values
   - Read prior snapshot onchain
   - Publish latest KPI snapshot
   - Conditionally apply risk policy
2. Reactive log trigger:
   - Listen for onchain `requestUpdate` event
   - Execute the same fetch/publish/apply path

Core contracts:

- `contracts/KpiOracle.sol`
- `contracts/PolicyManager.sol`
- `contracts/StrategyController.sol`

## Quickstart

### Prerequisites

- Node.js >= 20
- Bun >= 1.3 (for CRE workflow package)
- Foundry (forge)
- CRE CLI (`cre`)

### Setup

1. Install root dependencies: `npm install`
2. Install CRE workflow dependencies: `cd cre-workflow && bun install && cd ..`
3. Copy `.env.example` to `.env` and fill `TENDERLY_VTN_RPC_URL`, `PRIVATE_KEY`
4. Compile contracts: `npm run build`

### Deploy and Demo (TypeScript scripts)

5. Deploy contracts: `npm run deploy:vtn`
6. Seed policy and requester: `npm run seed:policy`
7. Run demo: `npm run demo`

### CRE Simulation (requires CRE account)

8. Log in: `cre login`
9. Update `cre-workflow/config.staging.json` with deployed contract addresses
10. Simulate: `cre workflow simulate cre-workflow`

## Commands

- `npm run setup` - print setup reminder and required env
- `npm run build` - compile contracts with Foundry (`forge build`)
- `npm run deploy:vtn` - deploy contracts to Tenderly Virtual TestNet
- `npm run seed:policy` - configure thresholds + allow update requester
- `npm run emit:request` - emit `requestUpdate(...)` event
- `npm run simulate:cron` - run proactive workflow path
- `npm run simulate:reactive` - run reactive workflow path
- `npm run demo` - execute full deterministic demo sequence
- `npm test` - run all tests (Solidity + TypeScript)
- `npm run test:contracts` - Foundry Solidity tests only
- `npm run test:workflows` - TypeScript workflow logic tests only

## Repository Map

- `docs/PRD.md` - product requirements and MVP boundaries
- `docs/ARCHITECTURE.md` - components, trust boundaries, failure handling
- `docs/DEMO_RUNBOOK.md` - five-minute demo sequence
- `docs/JUDGING_MAP.md` - submission requirement-to-artifact map
- `docs/ConnectionGuide.txt` - ports, endpoints, and integration inventory
- `contracts/` - Solidity contracts for KPI state, policy config, strategy mode
- `cre-workflow/` - CRE SDK-native workflow (bun, `@chainlink/cre-sdk`, triggers + capabilities)
- `workflows/` - TypeScript workflow logic (ethers-based local execution path)
- `scripts/` - deployment and demo execution scripts
- `project.yaml` - CRE CLI project config (RPC targets)
- `test/contracts/` - Foundry unit and integration tests
- `test/workflows/` - TypeScript logic tests (evaluatePolicy, normalizeKpi)
- `.github/workflows/ci.yml` - build, type-check, and test in CI

## Submission Evidence Plan

The final submission package will include:

- Public GitHub repository with workflows/contracts/scripts/docs
- Clear CRE workflow execution demonstration
- Tenderly Virtual TestNet Explorer link with deployment + transaction history
- 3-5 minute demo video

See `docs/JUDGING_MAP.md` for artifact mapping.
