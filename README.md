# KPI Pulse

CRE-driven DeFi KPI oracle that ingests public SaaS KPIs and automatically toggles an onchain strategy risk mode when policy thresholds are crossed.

## Hackathon Context

- Event: Chainlink Convergence Hackathon (Feb 6 - Mar 1)
- Core requirement: meaningful Chainlink Runtime Environment (CRE) usage
- Target submission angle:
  - Primary: Risk & Compliance
  - Secondary: DeFi & Tokenization
  - Bonus challenge: Tenderly Virtual TestNets

## What Step 1 Includes

This repository currently contains Step 1 artifacts only:

- Judge-friendly repository scaffolding
- PRD v1 and architecture docs
- Demo runbook and requirement-to-proof mapping
- Smart contract, workflow, and script skeleton files (no full business logic yet)

No production implementation claims are made at this stage.

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

## Repository Map

- `docs/PRD.md` - product requirements and MVP boundaries
- `docs/ARCHITECTURE.md` - components, trust boundaries, failure handling
- `docs/DEMO_RUNBOOK.md` - five-minute demo sequence
- `docs/JUDGING_MAP.md` - submission requirement-to-artifact map
- `docs/ConnectionGuide.txt` - all ports, endpoints, and connections
- `contracts/` - contract skeletons and shared interfaces
- `workflows/` - CRE TypeScript workflow skeletons
- `scripts/` - deployment/demo script skeletons
- `test/` - contract/workflow test placeholders
- `.github/workflows/ci.yml` - CI scaffold

## Planned Commands (Scaffolded)

These command names are reserved for Step 2 implementation:

- `npm run setup`
- `npm run simulate:cron`
- `npm run simulate:reactive`
- `npm run deploy:vtn`
- `npm run demo`

## Submission Evidence Plan

The final submission package will include:

- Public GitHub repository with workflows/contracts/scripts/docs
- Clear CRE workflow execution demonstration
- Tenderly Virtual TestNet Explorer link with deployment + transaction history
- 3-5 minute demo video

See `docs/JUDGING_MAP.md` for artifact mapping.
