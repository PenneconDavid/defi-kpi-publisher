# KPI Pulse PRD v1

## 1. Problem

DeFi strategy operators still rely on manual KPI monitoring for risk posture changes. That creates delayed reactions and inconsistent controls when protocol health degrades.

## 2. Users and Judge Value

- **Primary user:** strategy operators, treasury/risk contributors, protocol governance teams.
- **Judge value:** practical CRE orchestration that combines offchain KPI ingestion with onchain policy enforcement.

## 3. Goals (MVP)

1. Ingest KPI data from a public endpoint (DefiLlama first).
2. Normalize KPI fields for deterministic policy checks.
3. Publish snapshots onchain through `KpiOracle`.
4. Conditionally trigger strategy mode updates via `StrategyController`.
5. Support both proactive and reactive CRE workflow execution.

## 4. Non-Goals (MVP)

- Full frontend dashboard.
- Cross-chain writes.
- Paid/private API integrations.
- Multi-tenant governance surface.

## 5. Success Metrics

- Workflow success rate >= 95% for scripted demo runs.
- Deterministic policy outcomes for fixed test vectors.
- All critical actions visible as onchain transactions and emitted events.
- End-to-end execution fast enough for five-minute live demo narrative.

## 6. Scope

### MVP

- Two CRE workflows:
  - Cron-triggered proactive updater.
  - Log-triggered reactive updater.
- Three contracts:
  - `KpiOracle.sol`
  - `PolicyManager.sol`
  - `StrategyController.sol`
- Tenderly Virtual TestNet deployment + explorer artifacts.
- Submission-focused documentation package.

### Stretch

- Secondary public data source fallback.
- Configurable policy profiles by protocol type.
- Confidence/hysteresis tuning UI.
- Lightweight read-only status frontend.
