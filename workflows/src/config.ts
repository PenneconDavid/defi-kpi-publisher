import * as dotenv from "dotenv";
import * as fs from "node:fs";

dotenv.config();

type DeploymentArtifacts = {
  protocolId: string;
  addresses: {
    kpiOracle: string;
    policyManager: string;
    strategyController: string;
  };
};

export type WorkflowConfig = {
  protocolId: string;
  defiLlamaProtocolSlug: string;
  chainName: "tenderly-vtn" | "sepolia";
  cronSchedule: string;
  rpcUrl: string;
  privateKey: string;
  deploymentFile: string;
  policyThresholds: {
    minTvlUsd: number;
    minChange1dBps: number;
    minChange7dBps: number;
  };
  addresses: {
    kpiOracle: string;
    policyManager: string;
    strategyController: string;
  };
};

function maybeLoadDeployment(deploymentFile: string): DeploymentArtifacts | null {
  if (!fs.existsSync(deploymentFile)) {
    return null;
  }
  const raw = fs.readFileSync(deploymentFile, "utf8");
  return JSON.parse(raw) as DeploymentArtifacts;
}

const deploymentFile = process.env.DEPLOYMENT_FILE || "deployments/latest.json";
const loadedDeployment = maybeLoadDeployment(deploymentFile);

export const defaultConfig: WorkflowConfig = {
  protocolId: process.env.PROTOCOL_ID || loadedDeployment?.protocolId || "AAVE",
  defiLlamaProtocolSlug: process.env.DEFI_LLAMA_PROTOCOL_SLUG || "aave",
  chainName: process.env.WORKFLOW_CHAIN_NAME === "sepolia" ? "sepolia" : "tenderly-vtn",
  cronSchedule: process.env.CRON_SCHEDULE || "0 */10 * * * *",
  rpcUrl:
    process.env.WORKFLOW_RPC_URL || process.env.TENDERLY_VTN_RPC_URL || process.env.SEPOLIA_RPC_URL || "",
  privateKey: process.env.PRIVATE_KEY || "",
  deploymentFile,
  policyThresholds: {
    minTvlUsd: Number(process.env.MIN_TVL_USD || 1),
    minChange1dBps: Number(process.env.MIN_CHANGE_1D_BPS || -500),
    minChange7dBps: Number(process.env.MIN_CHANGE_7D_BPS || -1200)
  },
  addresses: {
    kpiOracle:
      process.env.KPI_ORACLE_ADDRESS ||
      loadedDeployment?.addresses.kpiOracle ||
      "0x0000000000000000000000000000000000000000",
    policyManager:
      process.env.POLICY_MANAGER_ADDRESS ||
      loadedDeployment?.addresses.policyManager ||
      "0x0000000000000000000000000000000000000000",
    strategyController:
      process.env.STRATEGY_CONTROLLER_ADDRESS ||
      loadedDeployment?.addresses.strategyController ||
      "0x0000000000000000000000000000000000000000"
  }
};
