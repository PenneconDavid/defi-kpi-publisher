import {ethers} from "ethers";
import * as fs from "node:fs";
import {getSigner} from "./lib/runtime.js";

type DeploymentArtifacts = {
  deployer: string;
  protocolId: string;
  addresses: {
    policyManager: string;
    strategyController: string;
  };
};

const policyManagerAbi = [
  "function configurePolicy(bytes32 protocolId, tuple(int256 minChange1dBps, int256 minChange7dBps, uint256 minTvlUsd, uint256 cooldownSeconds, bool enabled) policy) external"
];

const strategyControllerAbi = [
  "function setRequester(address requester, bool allowed) external"
];

function loadDeployment(): DeploymentArtifacts {
  const deploymentFile = process.env.DEPLOYMENT_FILE || "deployments/latest.json";
  const raw = fs.readFileSync(deploymentFile, "utf8");
  return JSON.parse(raw) as DeploymentArtifacts;
}

async function main(): Promise<void> {
  const signer = getSigner();
  const deployment = loadDeployment();
  const protocolId = ethers.encodeBytes32String(deployment.protocolId);

  const policyManager = new ethers.Contract(
    deployment.addresses.policyManager,
    policyManagerAbi,
    signer
  );
  const strategyController = new ethers.Contract(
    deployment.addresses.strategyController,
    strategyControllerAbi,
    signer
  );

  const minChange1dBps = BigInt(process.env.MIN_CHANGE_1D_BPS || "-500");
  const minChange7dBps = BigInt(process.env.MIN_CHANGE_7D_BPS || "-1200");
  const minTvlUsd = BigInt(process.env.MIN_TVL_USD || "1");
  const cooldownSeconds = BigInt(process.env.COOLDOWN_SECONDS || "600");
  const requester = process.env.REQUESTER_ADDRESS || signer.address;

  const policyTx = await policyManager.configurePolicy(protocolId, {
    minChange1dBps,
    minChange7dBps,
    minTvlUsd,
    cooldownSeconds,
    enabled: true
  });
  const policyReceipt = await policyTx.wait();

  const requesterTx = await strategyController.setRequester(requester, true);
  const requesterReceipt = await requesterTx.wait();

  console.log("Policy seeded:");
  console.log(`configurePolicy tx: ${policyReceipt?.hash}`);
  console.log(`setRequester tx:   ${requesterReceipt?.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
