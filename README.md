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

Step 2 baseline is implemented:

- Foundry build flow + TypeScript deployment flow for `KpiOracle`, `PolicyManager`, `StrategyController`
- TypeScript workflow callbacks for proactive cron and reactive log paths
- DefiLlama KPI fetch + normalization
- Onchain publish and conditional policy application from workflow logic
- Demo scripts for deployment, policy seeding, update request, and end-to-end scenario output
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

1. Install dependencies:
   - `npm install`
2. Prepare env:
   - Copy `.env.example` to `.env`
   - Fill at minimum: `TENDERLY_VTN_RPC_URL`, `PRIVATE_KEY`
3. Compile:
   - `npm run build`
4. Deploy contracts:
   - `npm run deploy:vtn`
5. Seed policy and requester:
   - `npm run seed:policy`
6. Run workflow simulations:
   - `npm run simulate:cron`
   - `npm run simulate:reactive`
7. Run deterministic demo:
   - `npm run demo`

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
- `workflows/` - TypeScript workflow package and handlers
- `scripts/` - deployment and demo execution scripts
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
