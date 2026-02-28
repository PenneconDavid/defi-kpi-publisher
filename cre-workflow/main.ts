import {
  cre,
  Runner,
  getNetwork,
  type CronPayload,
  type EVMLog,
  type Runtime,
} from "@chainlink/cre-sdk";
import { keccak256, toHex } from "viem";
import { z } from "zod";
import { onCronTrigger } from "./cronCallback";
import { onLogTrigger } from "./logCallback";

const configSchema = z.object({
  schedule: z.string(),
  defiLlamaUrl: z.string(),
  protocolIdHex: z.string(),
  minTvlUsd: z.number(),
  minChange1dBps: z.number(),
  minChange7dBps: z.number(),
  evms: z.array(
    z.object({
      kpiOracleAddress: z.string(),
      strategyControllerAddress: z.string(),
      chainSelectorName: z.string(),
      gasLimit: z.string(),
    })
  ),
});

export type Config = z.infer<typeof configSchema>;

const UPDATE_REQUESTED_SIGNATURE = "UpdateRequested(bytes32,address,string)";

const initWorkflow = (config: Config) => {
  const cronCapability = new cre.capabilities.CronCapability();

  const network = getNetwork({
    chainFamily: "evm",
    chainSelectorName: config.evms[0].chainSelectorName,
    isTestnet: true,
  });

  if (!network) {
    throw new Error(`Network not found: ${config.evms[0].chainSelectorName}`);
  }

  const evmClient = new cre.capabilities.EVMClient(
    network.chainSelector.selector
  );
  const eventHash = keccak256(toHex(UPDATE_REQUESTED_SIGNATURE));

  return [
    cre.handler(
      cronCapability.trigger({ schedule: config.schedule }),
      onCronTrigger
    ),

    cre.handler(
      evmClient.logTrigger({
        addresses: [config.evms[0].strategyControllerAddress],
        topics: [{ values: [eventHash] }],
        confidence: "CONFIDENCE_LEVEL_FINALIZED",
      }),
      onLogTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner({ configSchema });
  await runner.run(initWorkflow);
}

main();
