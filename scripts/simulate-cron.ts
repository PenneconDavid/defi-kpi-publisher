import * as dotenv from "dotenv";
import {handleProactiveCron} from "../workflows/src/handlers/proactiveCron.js";

dotenv.config();

async function main(): Promise<void> {
  const result = await handleProactiveCron();
  console.log("Cron simulation result:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
