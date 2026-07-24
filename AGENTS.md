# Agent Instructions — defi-kpi-publisher

## Project

- **Name:** defi-kpi-publisher (KPI Pulse)
- **Purpose:** CRE-driven DeFi KPI oracle that toggles on-chain strategy risk mode
- **Stack:** Foundry/Solidity, Chainlink CRE, TypeScript, Bun

## Dev / demo

- **Demo:** `npm run demo` (no web UI — CLI/chain workflow)
- **Contracts:** Foundry (`forge test`, `forge build`)

## Shared config

- **Skills:** `.agents/skills/` → [cursor-skills](https://github.com/PenneconDavid/cursor-skills)
- **Rules:** `.cursor/rules/` → [cursor-rules](https://github.com/PenneconDavid/cursor-rules)
- **Connections:** see `ConnectionGuide.txt`

## Conventions

- No frontend dev server — Tier 2 browser QA skills generally do not apply.
- Update `ConnectionGuide.txt` for chain endpoints, CRE workflows, and external APIs.
- Ask before installing Bun/npm packages or Foundry dependencies.
