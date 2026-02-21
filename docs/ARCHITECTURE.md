# KPI Pulse Architecture v1

## Components

- `workflows/` CRE TypeScript package with two triggers and shared callback logic.
- `contracts/KpiOracle.sol` onchain KPI snapshot registry.
- `contracts/PolicyManager.sol` policy config and threshold evaluation helpers.
- `contracts/StrategyController.sol` risk mode state machine and policy application.
- Public KPI endpoint adapter (DefiLlama for MVP).
- Tenderly Virtual TestNet for deployment, tx inspection, and demo evidence.

## Data Flow

```mermaid
flowchart TD
  cronTrigger[cronTrigger] --> executeKpiCycle
  logTrigger[logTrigger_requestUpdate] --> executeKpiCycle
  executeKpiCycle --> httpFetchDefiLlama
  httpFetchDefiLlama --> normalizeKpis
  normalizeKpis --> evmReadPriorSnapshot
  evmReadPriorSnapshot --> evmWritePublish
  evmWritePublish --> policyEval
  policyEval -->|thresholdBreach| evmWriteApplyPolicy
  policyEval -->|noBreach| completeRun
  evmWriteApplyPolicy --> completeRun
```

## Trust Boundaries

1. External API response -> workflow parsing.
2. Workflow capability calls -> onchain writes.
3. Policy configuration authority -> runtime behavior.

## Failure Modes and Mitigations

- **Endpoint unavailable or rate-limited**
  - Retry with backoff; fail closed with no write if validation fails.
- **Schema drift**
  - Strict parsing and normalized type checks before any chain call.
- **Policy noise / false positives**
  - Include cooldown/hysteresis parameters in policy logic.
- **Write revert**
  - Surface explicit run errors and retain traceability in logs.
- **Reactive trigger spam**
  - Access control or cooldown in update request path.

## Security and Scope Notes

- Step 1 provides skeleton interfaces and architecture only.
- Full threat model and implementation hardening is part of Step 2+.
