# KPI Pulse Judging Map

This file maps known submission requirements to concrete repository evidence.

## Core Hackathon Requirements

| Requirement | Evidence Path |
| --- | --- |
| Meaningful CRE usage | `cre-workflow/main.ts` (cre.handler, CronCapability, EVMClient.logTrigger), `cre-workflow/kpiCycle.ts` (HTTPClient, EVMClient, runtime.report, writeReport) |
| Blockchain + external source integration | `cre-workflow/kpiCycle.ts` (DefiLlama HTTP + EVM read/write), `workflows/src/clients/evm.ts`, `workflows/src/clients/http.ts` |
| Public source code | Repository root |
| Demo video under 5 minutes | To be produced before submission |
| Workflow simulation or deployment evidence | `cre workflow simulate cre-workflow`, `scripts/demo-scenario.ts`, run logs, and explorer links |

## Tenderly Virtual TestNets Challenge Requirements

| Requirement | Evidence Path |
| --- | --- |
| Docs on use case + architecture + CRE + VTN value | `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md` |
| Clear CRE execution integrated with VTN | `docs/DEMO_RUNBOOK.md`, `cre-workflow/`, `scripts/deploy-contracts.ts`, `scripts/demo-scenario.ts` |
| Repo with workflows/contracts/scripts/docs | `cre-workflow/`, `workflows/`, `contracts/`, `scripts/`, `docs/` |
| Tenderly Explorer link with deployed contracts + tx history | To be added in submission checklist |

## Submission Checklist (fill before final submission)

- [ ] Public repo is accessible.
- [ ] Explorer link is populated in README.
- [ ] Demo video link is added to README.
- [ ] All required scripts execute successfully.
- [ ] CRE simulation evidence captured (screenshot or log).
- [ ] Connection inventory is up to date in `docs/ConnectionGuide.txt`.
