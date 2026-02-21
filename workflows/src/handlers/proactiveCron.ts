import {fetchProtocolKpi, normalizeKpi} from "../clients/http.js";
import {applyPolicy, publishSnapshot, readPriorSnapshot} from "../clients/evm.js";
import {evaluatePolicy} from "../logic/evaluatePolicy.js";
import {defaultConfig} from "../config.js";

export async function handleProactiveCron(): Promise<void> {
  const raw = await fetchProtocolKpi(defaultConfig.defiLlamaProtocolSlug);
  const kpi = normalizeKpi(raw);

  await readPriorSnapshot(defaultConfig.protocolId);

  await publishSnapshot({
    protocolId: defaultConfig.protocolId,
    tvlUsd: kpi.tvlUsd,
    change1dBps: kpi.change1dBps,
    change7dBps: kpi.change7dBps,
    runId: "cron-placeholder-run-id"
  });

  const outcome = evaluatePolicy(
    {
      tvlUsd: kpi.tvlUsd,
      change1dBps: kpi.change1dBps,
      change7dBps: kpi.change7dBps
    },
    {
      minTvlUsd: 1,
      minChange1dBps: -500,
      minChange7dBps: -1200
    }
  );

  if (outcome.breach) {
    await applyPolicy({
      protocolId: defaultConfig.protocolId,
      nextMode: outcome.nextMode,
      reasonCode: outcome.reasonCode
    });
  }
}
