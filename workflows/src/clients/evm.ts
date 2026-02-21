export type PriorSnapshot = {
  tvlUsd: bigint;
  change1dBps: bigint;
  change7dBps: bigint;
  timestamp: bigint;
  runId: string;
};

export async function readPriorSnapshot(_protocolId: string): Promise<PriorSnapshot | null> {
  // Step 1 scaffold: CRE EVM read capability integration lands in Step 2.
  return null;
}

export async function publishSnapshot(_args: {
  protocolId: string;
  tvlUsd: number;
  change1dBps: number;
  change7dBps: number;
  runId: string;
}): Promise<string> {
  // Step 1 scaffold: CRE EVM write capability integration lands in Step 2.
  return "tx_publish_placeholder";
}

export async function applyPolicy(_args: {
  protocolId: string;
  nextMode: "NORMAL" | "DEFENSIVE";
  reasonCode: string;
}): Promise<string> {
  // Step 1 scaffold: CRE EVM write capability integration lands in Step 2.
  return "tx_apply_policy_placeholder";
}
