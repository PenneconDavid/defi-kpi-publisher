export type PolicyInput = {
  tvlUsd: number;
  change1dBps: number;
  change7dBps: number;
};

export type PolicyConfig = {
  minTvlUsd: number;
  minChange1dBps: number;
  minChange7dBps: number;
};

export type PolicyOutcome = {
  breach: boolean;
  nextMode: "NORMAL" | "DEFENSIVE";
  reasonCode: string;
};

export function evaluatePolicy(input: PolicyInput, config: PolicyConfig): PolicyOutcome {
  const breach =
    input.tvlUsd < config.minTvlUsd ||
    input.change1dBps < config.minChange1dBps ||
    input.change7dBps < config.minChange7dBps;

  return {
    breach,
    nextMode: breach ? "DEFENSIVE" : "NORMAL",
    reasonCode: breach ? "KPI_THRESHOLD_BREACH" : "KPI_WITHIN_RANGE"
  };
}
