import {
  cre,
  type Runtime,
  getNetwork,
  bytesToHex,
  hexToBase64,
  encodeCallMsg,
  TxStatus,
  LAST_FINALIZED_BLOCK_NUMBER,
  ConsensusAggregationByFields,
  median,
  type HTTPSendRequester,
} from "@chainlink/cre-sdk";
import {
  encodeAbiParameters,
  parseAbiParameters,
  encodeFunctionData,
  decodeFunctionResult,
  zeroAddress,
  type Address,
} from "viem";
import type { Config } from "./main";

interface DefiLlamaResponse {
  tvl: number;
  change_1d: number;
  change_7d: number;
}

interface NormalizedKpi {
  tvlUsd: number;
  change1dBps: number;
  change7dBps: number;
}

const PUBLISH_ABI = [
  {
    name: "publish",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "protocolId", type: "bytes32" },
      { name: "tvlUsd", type: "uint256" },
      { name: "change1dBps", type: "int256" },
      { name: "change7dBps", type: "int256" },
      { name: "runId", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

const APPLY_POLICY_ABI = [
  {
    name: "applyPolicy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "protocolId", type: "bytes32" },
      { name: "nextMode", type: "uint8" },
      { name: "reasonCode", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

const LATEST_SNAPSHOT_ABI = [
  {
    name: "latestSnapshot",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "protocolId", type: "bytes32" }],
    outputs: [
      { name: "tvlUsd", type: "uint256" },
      { name: "change1dBps", type: "int256" },
      { name: "change7dBps", type: "int256" },
      { name: "timestamp", type: "uint256" },
      { name: "runId", type: "bytes32" },
    ],
  },
] as const;

const PUBLISH_REPORT_PARAMS = parseAbiParameters(
  "bytes32 protocolId, uint256 tvlUsd, int256 change1dBps, int256 change7dBps, bytes32 runId"
);

const APPLY_POLICY_REPORT_PARAMS = parseAbiParameters(
  "bytes32 protocolId, uint8 nextMode, bytes32 reasonCode"
);

function fetchDefiLlamaKpi(
  sendRequester: HTTPSendRequester,
  config: Config
): NormalizedKpi {
  const response = sendRequester
    .sendRequest({ method: "GET", url: config.defiLlamaUrl })
    .result();

  if (response.statusCode !== 200) {
    throw new Error(`DefiLlama request failed: ${response.statusCode}`);
  }

  const raw: DefiLlamaResponse = JSON.parse(
    Buffer.from(response.body).toString("utf-8")
  );

  if (
    typeof raw.tvl !== "number" ||
    typeof raw.change_1d !== "number" ||
    typeof raw.change_7d !== "number"
  ) {
    throw new Error("Invalid DefiLlama payload schema");
  }

  return {
    tvlUsd: Math.max(0, Math.round(raw.tvl)),
    change1dBps: Math.round(raw.change_1d * 100),
    change7dBps: Math.round(raw.change_7d * 100),
  };
}

function evaluatePolicy(
  kpi: NormalizedKpi,
  config: Config
): { breach: boolean; nextMode: number; reasonCode: string } {
  const breach =
    kpi.tvlUsd < config.minTvlUsd ||
    kpi.change1dBps < config.minChange1dBps ||
    kpi.change7dBps < config.minChange7dBps;

  return {
    breach,
    nextMode: breach ? 1 : 0, // 0=NORMAL, 1=DEFENSIVE
    reasonCode: breach ? "KPI_THRESHOLD_BREACH" : "KPI_WITHIN_RANGE",
  };
}

function generateRunId(prefix: string): `0x${string}` {
  const ts = Date.now().toString(36);
  const raw = `${prefix}-${ts}`.slice(0, 31);
  const hex = Buffer.from(raw).toString("hex").padEnd(64, "0");
  return `0x${hex}` as `0x${string}`;
}

export function executeKpiCycle(
  runtime: Runtime,
  triggerName: string
): string {
  const config = runtime.config as Config;
  const evmConfig = config.evms[0];
  const protocolId = config.protocolIdHex as `0x${string}`;
  const runId = generateRunId(triggerName);

  runtime.log(`[KPI Cycle] Trigger: ${triggerName}`);
  runtime.log(`[KPI Cycle] Protocol: ${protocolId}`);

  // --- Step 1: Fetch KPI data via HTTP capability ---
  runtime.log("[Step 1] Fetching KPI data from DefiLlama...");
  const httpClient = new cre.capabilities.HTTPClient();
  const kpi = httpClient
    .sendRequest(
      runtime,
      fetchDefiLlamaKpi,
      ConsensusAggregationByFields({
        tvlUsd: median,
        change1dBps: median,
        change7dBps: median,
      })
    )(config)
    .result();

  runtime.log(
    `[Step 1] KPI: tvl=${kpi.tvlUsd}, 1d=${kpi.change1dBps}bps, 7d=${kpi.change7dBps}bps`
  );

  // --- Step 2: Read prior snapshot (EVM Read) ---
  runtime.log("[Step 2] Reading prior snapshot from KpiOracle...");
  const network = getNetwork({
    chainFamily: "evm",
    chainSelectorName: evmConfig.chainSelectorName,
    isTestnet: true,
  });

  if (!network) {
    throw new Error(`Network not found: ${evmConfig.chainSelectorName}`);
  }

  const evmClient = new cre.capabilities.EVMClient(
    network.chainSelector.selector
  );

  const readCallData = encodeFunctionData({
    abi: LATEST_SNAPSHOT_ABI,
    functionName: "latestSnapshot",
    args: [protocolId],
  });

  const readResult = evmClient
    .callContract(runtime, {
      call: encodeCallMsg({
        from: zeroAddress,
        to: evmConfig.kpiOracleAddress as Address,
        data: readCallData,
      }),
      blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
    })
    .result();

  const priorSnapshot = decodeFunctionResult({
    abi: LATEST_SNAPSHOT_ABI,
    functionName: "latestSnapshot",
    data: bytesToHex(readResult.data),
  });

  runtime.log(
    `[Step 2] Prior snapshot timestamp: ${(priorSnapshot as any)[3]?.toString() || "none"}`
  );

  // --- Step 3: Publish new KPI snapshot (EVM Write via CRE report) ---
  runtime.log("[Step 3] Publishing new KPI snapshot...");

  const publishData = encodeAbiParameters(PUBLISH_REPORT_PARAMS, [
    protocolId,
    BigInt(kpi.tvlUsd),
    BigInt(kpi.change1dBps),
    BigInt(kpi.change7dBps),
    runId,
  ]);

  const publishReport = runtime
    .report({
      encodedPayload: hexToBase64(publishData),
      encoderName: "evm",
      signingAlgo: "ecdsa",
      hashingAlgo: "keccak256",
    })
    .result();

  const publishResult = evmClient
    .writeReport(runtime, {
      receiver: evmConfig.kpiOracleAddress,
      report: publishReport,
      gasConfig: { gasLimit: evmConfig.gasLimit },
    })
    .result();

  if (publishResult.txStatus !== TxStatus.SUCCESS) {
    throw new Error(
      `Publish tx failed: ${publishResult.errorMessage || publishResult.txStatus}`
    );
  }

  const publishTxHash = bytesToHex(
    publishResult.txHash || new Uint8Array(32)
  );
  runtime.log(`[Step 3] Published: ${publishTxHash}`);

  // --- Step 4: Evaluate policy ---
  runtime.log("[Step 4] Evaluating policy thresholds...");
  const outcome = evaluatePolicy(kpi, config);
  runtime.log(
    `[Step 4] Breach: ${outcome.breach}, Mode: ${outcome.nextMode === 1 ? "DEFENSIVE" : "NORMAL"}`
  );

  // --- Step 5: Conditionally apply policy (EVM Write) ---
  if (outcome.breach) {
    runtime.log("[Step 5] Threshold breached, applying policy...");

    const reasonCodeHex = `0x${Buffer.from(outcome.reasonCode).toString("hex").padEnd(64, "0")}` as `0x${string}`;

    const applyData = encodeAbiParameters(APPLY_POLICY_REPORT_PARAMS, [
      protocolId,
      outcome.nextMode,
      reasonCodeHex,
    ]);

    const applyReport = runtime
      .report({
        encodedPayload: hexToBase64(applyData),
        encoderName: "evm",
        signingAlgo: "ecdsa",
        hashingAlgo: "keccak256",
      })
      .result();

    const applyResult = evmClient
      .writeReport(runtime, {
        receiver: evmConfig.strategyControllerAddress,
        report: applyReport,
        gasConfig: { gasLimit: evmConfig.gasLimit },
      })
      .result();

    if (applyResult.txStatus !== TxStatus.SUCCESS) {
      throw new Error(
        `ApplyPolicy tx failed: ${applyResult.errorMessage || applyResult.txStatus}`
      );
    }

    const applyTxHash = bytesToHex(
      applyResult.txHash || new Uint8Array(32)
    );
    runtime.log(`[Step 5] Policy applied: ${applyTxHash}`);
    return `breach:${applyTxHash}`;
  }

  runtime.log("[Step 5] No breach, skipping policy application.");
  return `ok:${publishTxHash}`;
}
