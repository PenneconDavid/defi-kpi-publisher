import {defaultConfig} from "./src/config.js";
import {handleProactiveCron} from "./src/handlers/proactiveCron.js";
import {handleReactiveLog} from "./src/handlers/reactiveLog.js";

/**
 * Workflow manifest for the ethers-based local execution path.
 * The CRE SDK-native workflow lives in cre-workflow/main.ts.
 */
export const workflowManifest = {
  handlers: [
    {
      name: "proactiveCronWorkflow",
      trigger: "cron",
      schedule: defaultConfig.cronSchedule,
      callback: "handleProactiveCron"
    },
    {
      name: "reactiveLogWorkflow",
      trigger: "evm.log",
      event: "UpdateRequested(bytes32,address,string)",
      callback: "handleReactiveLog"
    }
  ]
};

export const callbacks = {
  handleProactiveCron,
  handleReactiveLog
};
