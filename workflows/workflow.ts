import {defaultConfig} from "./src/config.js";
import {handleProactiveCron} from "./src/handlers/proactiveCron.js";
import {handleReactiveLog} from "./src/handlers/reactiveLog.js";

/**
 * CRE-oriented workflow manifest.
 * Step 2 wires executable callback handlers and keeps trigger metadata
 * aligned with CRE trigger-and-callback architecture.
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
