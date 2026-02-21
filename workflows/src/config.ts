export type WorkflowConfig = {
  protocolId: string;
  defiLlamaProtocolSlug: string;
  chainName: "tenderly-vtn" | "sepolia";
  cronSchedule: string;
  addresses: {
    kpiOracle: string;
    policyManager: string;
    strategyController: string;
  };
};

export const defaultConfig: WorkflowConfig = {
  protocolId: "AAVE",
  defiLlamaProtocolSlug: "aave",
  chainName: "tenderly-vtn",
  cronSchedule: "0 */10 * * * *",
  addresses: {
    kpiOracle: "0x0000000000000000000000000000000000000000",
    policyManager: "0x0000000000000000000000000000000000000000",
    strategyController: "0x0000000000000000000000000000000000000000"
  }
};
