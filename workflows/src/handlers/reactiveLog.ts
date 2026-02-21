import {executeKpiCycle, type KpiCycleResult} from "../executeKpiCycle.js";

export async function handleReactiveLog(event: {
  protocolId: string;
  reason: string;
}): Promise<KpiCycleResult> {
  return executeKpiCycle({
    trigger: "log",
    protocolIdOverride: event.protocolId,
    runIdPrefix: "reactive"
  });
}
