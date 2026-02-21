import {ethers} from "ethers";
import {defaultConfig} from "../config.js";

export type PriorSnapshot = {
  tvlUsd: bigint;
  change1dBps: bigint;
  change7dBps: bigint;
  timestamp: bigint;
  runId: string;
};

const kpiOracleAbi = [
  "function latestSnapshot(bytes32 protocolId) view returns (uint256 tvlUsd, int256 change1dBps, int256 change7dBps, uint256 timestamp, bytes32 runId)",
  "function publish(bytes32 protocolId, uint256 tvlUsd, int256 change1dBps, int256 change7dBps, bytes32 runId) external"
];

const strategyControllerAbi = [
  "function applyPolicy(bytes32 protocolId, uint8 nextMode, bytes32 reasonCode) external",
  "function modeOf(bytes32 protocolId) view returns (uint8)"
];

function getSigner(): ethers.Wallet {
  if (!defaultConfig.rpcUrl || !defaultConfig.privateKey) {
    throw new Error("Missing WORKFLOW_RPC_URL/TENDERLY_VTN_RPC_URL or PRIVATE_KEY for EVM client");
  }
  const provider = new ethers.JsonRpcProvider(defaultConfig.rpcUrl);
  return new ethers.Wallet(defaultConfig.privateKey, provider);
}

function toProtocolIdBytes(protocolId: string): string {
  return ethers.encodeBytes32String(protocolId);
}

function toReasonCodeBytes(reasonCode: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(reasonCode));
}

export async function readPriorSnapshot(protocolId: string): Promise<PriorSnapshot | null> {
  const signer = getSigner();
  const kpiOracle = new ethers.Contract(defaultConfig.addresses.kpiOracle, kpiOracleAbi, signer);
  const protocolIdBytes = toProtocolIdBytes(protocolId);
  const snapshot = await kpiOracle.latestSnapshot(protocolIdBytes);

  const timestamp = snapshot.timestamp as bigint;
  if (timestamp === 0n) {
    return null;
  }

  const runIdHex = snapshot.runId as string;
  const runIdUtf8 = ethers.toUtf8String(runIdHex).replace(/\u0000/g, "");

  return {
    tvlUsd: snapshot.tvlUsd as bigint,
    change1dBps: snapshot.change1dBps as bigint,
    change7dBps: snapshot.change7dBps as bigint,
    timestamp,
    runId: runIdUtf8
  };
}

export async function publishSnapshot(args: {
  protocolId: string;
  tvlUsd: number;
  change1dBps: number;
  change7dBps: number;
  runId: string;
}): Promise<string> {
  const signer = getSigner();
  const kpiOracle = new ethers.Contract(defaultConfig.addresses.kpiOracle, kpiOracleAbi, signer);

  const protocolIdBytes = toProtocolIdBytes(args.protocolId);
  const runIdBytes = ethers.encodeBytes32String(args.runId.slice(0, 31));

  const tx = await kpiOracle.publish(
    protocolIdBytes,
    BigInt(args.tvlUsd),
    BigInt(args.change1dBps),
    BigInt(args.change7dBps),
    runIdBytes
  );
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}

export async function applyPolicy(args: {
  protocolId: string;
  nextMode: "NORMAL" | "DEFENSIVE";
  reasonCode: string;
}): Promise<string> {
  const signer = getSigner();
  const strategyController = new ethers.Contract(
    defaultConfig.addresses.strategyController,
    strategyControllerAbi,
    signer
  );

  const protocolIdBytes = toProtocolIdBytes(args.protocolId);
  const nextMode = args.nextMode === "DEFENSIVE" ? 1 : 0;
  const reasonCode = toReasonCodeBytes(args.reasonCode);
  const tx = await strategyController.applyPolicy(protocolIdBytes, nextMode, reasonCode);
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}
