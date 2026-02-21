# KPI Pulse Judging Map

This file maps known submission requirements to concrete repository evidence.

## Core Hackathon Requirements

| Requirement | Evidence Path |
| --- | --- |
| Meaningful CRE usage | `workflows/workflow.ts`, `workflows/src/handlers/*`, `workflows/src/clients/*` |
| Blockchain + external source integration | `workflows/src/clients/http.ts`, `workflows/src/clients/evm.ts` |
| Public source code | Repository root |
| Demo video under 5 minutes | To be produced before submission |
| Workflow simulation or deployment evidence | `scripts/demo-scenario.ts`, run logs, and explorer links |

## Tenderly Virtual TestNets Challenge Requirements

| Requirement | Evidence Path |
| --- | --- |
| Docs on use case + architecture + CRE + VTN value | `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md` |
| Clear CRE execution integrated with VTN | `docs/DEMO_RUNBOOK.md`, `scripts/*`, workflow handlers |
| Repo with workflows/contracts/scripts/docs | `workflows/`, `contracts/`, `scripts/`, `docs/` |
| Tenderly Explorer link with deployed contracts + tx history | To be added in submission checklist |

## Submission Checklist (fill before final submission)

- [ ] Public repo is accessible.
- [ ] Explorer link is populated in README.
- [ ] Demo video link is added to README.
- [ ] All required scripts execute successfully.
- [ ] Connection inventory is up to date in `docs/ConnectionGuide.txt`.
