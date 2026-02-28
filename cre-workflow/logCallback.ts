import { type Runtime, type EVMLog, bytesToHex } from "@chainlink/cre-sdk";
import { decodeEventLog, parseAbi } from "viem";
import { executeKpiCycle } from "./kpiCycle";

const EVENT_ABI = parseAbi([
  "event UpdateRequested(bytes32 indexed protocolId, address indexed requester, string reason)",
]);

export function onLogTrigger(runtime: Runtime, log: EVMLog): string {
  runtime.log("CRE Workflow: Log Trigger - Reactive KPI Update");

  const topics = log.topics.map((t: Uint8Array) => bytesToHex(t)) as [
    `0x${string}`,
    ...`0x${string}`[]
  ];
  const data = bytesToHex(log.data);

  const decoded = decodeEventLog({ abi: EVENT_ABI, data, topics });
  const protocolId = decoded.args.protocolId as `0x${string}`;
  const requester = decoded.args.requester as string;
  const reason = decoded.args.reason as string;

  runtime.log(`[Log Trigger] Protocol: ${protocolId}`);
  runtime.log(`[Log Trigger] Requester: ${requester}`);
  runtime.log(`[Log Trigger] Reason: ${reason}`);

  return executeKpiCycle(runtime, "reactive");
}
