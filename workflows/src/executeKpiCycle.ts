import {fetchProtocolKpi, normalizeKpi} from "./clients/http.js";
import {applyPolicy, publishSnapshot, readPriorSnapshot} from "./clients/evm.js";
import {defaultConfig} from "./config.js";
import {evaluatePolicy} from "./logic/evaluatePolicy.js";

export type TriggerType = "cron" | "log";

export type KpiCycleResult = {
  trigger: TriggerType;
  protocolId: string;
  runId: string;
  publishTxHash?: string;
  applyPolicyTxHash?: string;
  breach: boolean;
  mode: "NORMAL" | "DEFENSIVE";
};

type ExecuteOptions = {
  trigger: TriggerType;
  protocolIdOverride?: string;
  runIdPrefix?: string;
};

function buildRunId(prefix: string): string {
  const now = Date.now().toString(36);
  return `${prefix}-${now}`.slice(0, 31);
}

export async function executeKpiCycle(options: ExecuteOptions): Promise<KpiCycleResult> {
  const protocolId = options.protocolIdOverride || defaultConfig.protocolId;
  const runId = buildRunId(options.runIdPrefix || options.trigger);

  const raw = await fetchProtocolKpi(defaultConfig.defiLlamaProtocolSlug);
  const kpi = normalizeKpi(raw);

  await readPriorSnapshot(protocolId);

  const publishTxHash = await publishSnapshot({
    protocolId,
    tvlUsd: kpi.tvlUsd,
    change1dBps: kpi.change1dBps,
    change7dBps: kpi.change7dBps,
    runId
  });

  const outcome = evaluatePolicy(
    {
      tvlUsd: kpi.tvlUsd,
      change1dBps: kpi.change1dBps,
      change7dBps: kpi.change7dBps
    },
    defaultConfig.policyThresholds
  );

  let applyPolicyTxHash: string | undefined;
  if (outcome.breach) {
    applyPolicyTxHash = await applyPolicy({
      protocolId,
      nextMode: outcome.nextMode,
      reasonCode: outcome.reasonCode
    });
  }

  return {
    trigger: options.trigger,
    protocolId,
    runId,
    publishTxHash,
    applyPolicyTxHash,
    breach: outcome.breach,
    mode: outcome.nextMode
  };
}
