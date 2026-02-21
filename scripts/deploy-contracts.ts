import {ethers} from "ethers";
import * as fs from "node:fs";
import * as path from "node:path";
import {loadFoundryArtifact} from "./lib/artifacts.js";
import {getSigner} from "./lib/runtime.js";

type DeploymentArtifacts = {
  network: string;
  chainId: string;
  deployer: string;
  protocolId: string;
  addresses: {
    kpiOracle: string;
    policyManager: string;
    strategyController: string;
  };
  deployedAt: string;
};

function resolveDeploymentFile(): string {
  return process.env.DEPLOYMENT_FILE || "deployments/latest.json";
}

function ensureParentDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
}

async function main(): Promise<void> {
  const signer = getSigner();
  const chain = await signer.provider!.getNetwork();
  const protocolId = process.env.PROTOCOL_ID || "AAVE";

  const kpiOracleArtifact = loadFoundryArtifact("KpiOracle");
  const policyManagerArtifact = loadFoundryArtifact("PolicyManager");
  const strategyControllerArtifact = loadFoundryArtifact("StrategyController");

  const kpiOracleFactory = new ethers.ContractFactory(
    kpiOracleArtifact.abi,
    kpiOracleArtifact.bytecode.object,
    signer
  );
  const kpiOracle = await kpiOracleFactory.deploy(signer.address);
  await kpiOracle.waitForDeployment();

  const policyManagerFactory = new ethers.ContractFactory(
    policyManagerArtifact.abi,
    policyManagerArtifact.bytecode.object,
    signer
  );
  const policyManager = await policyManagerFactory.deploy(signer.address);
  await policyManager.waitForDeployment();

  const strategyControllerFactory = new ethers.ContractFactory(
    strategyControllerArtifact.abi,
    strategyControllerArtifact.bytecode.object,
    signer
  );
  const strategyController = await strategyControllerFactory.deploy(signer.address);
  await strategyController.waitForDeployment();

  const deployment: DeploymentArtifacts = {
    network: process.env.WORKFLOW_CHAIN_NAME || "tenderly-vtn",
    chainId: chain.chainId.toString(),
    deployer: signer.address,
    protocolId,
    addresses: {
      kpiOracle: kpiOracle.target as string,
      policyManager: policyManager.target as string,
      strategyController: strategyController.target as string
    },
    deployedAt: new Date().toISOString()
  };

  const deploymentFile = resolveDeploymentFile();
  ensureParentDir(deploymentFile);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));

  console.log("Deployment complete:");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
