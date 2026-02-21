import {executeKpiCycle, type KpiCycleResult} from "../executeKpiCycle.js";

export async function handleProactiveCron(): Promise<KpiCycleResult> {
  return executeKpiCycle({
    trigger: "cron",
    runIdPrefix: "cron"
  });
}
