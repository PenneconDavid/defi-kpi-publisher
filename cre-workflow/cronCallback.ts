import type { Runtime, CronPayload } from "@chainlink/cre-sdk";
import { executeKpiCycle } from "./kpiCycle";

export function onCronTrigger(runtime: Runtime, payload: CronPayload): string {
  if (!payload.scheduledExecutionTime) {
    throw new Error("Scheduled execution time is required");
  }

  runtime.log("CRE Workflow: Cron Trigger - Proactive KPI Update");
  return executeKpiCycle(runtime, "cron");
}
