# Agent Instructions — defi-kpi-publisher

## Project

- **Name:** defi-kpi-publisher (KPI Pulse)
- **Purpose:** CRE-driven DeFi KPI oracle that toggles on-chain strategy risk mode
- **Stack:** Foundry/Solidity, Chainlink CRE, TypeScript, Bun

## Dev / demo

- **Demo:** `npm run demo` (no web UI — CLI/chain workflow)
- **Contracts:** Foundry (`forge test`, `forge build`)

## Commands

| Task | Command |
|------|---------|
| Install | `npm install` (root); `cd cre-workflow && bun install` for the CRE workflow |
| Contracts build | `forge build` |
| All tests | `npm test` (Foundry plus Node workflow tests) |
| Contract tests | `npm run test:contracts` |
| Workflow tests | `npm run test:workflows` |
| Workflow typecheck | `cd workflows && npm run build` |
| Demo | `npm run demo` (CLI, no web UI) |

CI runs in `.github/workflows/ci.yml`; match what it runs.

## Definition of done

- `npm test` passes and `cd workflows && npm run build` succeeds.
- `ConnectionGuide.txt` updated if any chain endpoint, CRE workflow, or external API changed.
- Never run `deploy:vtn`, `seed:policy`, or `emit:request` without asking; they write to a chain.

## Shared config

- **Skills:** `.agents/skills/` → [cursor-skills](https://github.com/PenneconDavid/cursor-skills)
- **Rules:** `.cursor/rules/` → [cursor-rules](https://github.com/PenneconDavid/cursor-rules)
- **Connections:** see `ConnectionGuide.txt`

## Conventions

- No frontend dev server — Tier 2 browser QA skills generally do not apply.
- Update `ConnectionGuide.txt` for chain endpoints, CRE workflows, and external APIs.
- Ask before installing Bun/npm packages or Foundry dependencies.
