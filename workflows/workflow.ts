/**
 * Step 1 scaffold:
 * Registers the two intended CRE trigger paths.
 * Full CRE SDK implementation is added in Step 2.
 */

export const workflowPlan = {
  handlers: [
    {
      name: "proactiveCronWorkflow",
      trigger: "cron",
      callback: "executeKpiCycle"
    },
    {
      name: "reactiveLogWorkflow",
      trigger: "evm.log",
      callback: "executeKpiCycle"
    }
  ]
};
