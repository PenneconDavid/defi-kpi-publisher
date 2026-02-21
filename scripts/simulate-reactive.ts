import * as dotenv from "dotenv";
import {defaultConfig} from "../workflows/src/config.js";
import {handleReactiveLog} from "../workflows/src/handlers/reactiveLog.js";

dotenv.config();

async function main(): Promise<void> {
  const reason = process.env.UPDATE_REASON || "reactive-simulation";
  const result = await handleReactiveLog({
    protocolId: defaultConfig.protocolId,
    reason
  });
  console.log("Reactive simulation result:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
