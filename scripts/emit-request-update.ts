import {ethers} from "ethers";
import * as fs from "node:fs";
import {getSigner} from "./lib/runtime.js";

type DeploymentArtifacts = {
  protocolId: string;
  addresses: {
    strategyController: string;
  };
};

const strategyControllerAbi = [
  "function requestUpdate(bytes32 protocolId, string reason) external",
  "event UpdateRequested(bytes32 indexed protocolId, address indexed requester, string reason)"
];

function loadDeployment(): DeploymentArtifacts {
  const deploymentFile = process.env.DEPLOYMENT_FILE || "deployments/latest.json";
  const raw = fs.readFileSync(deploymentFile, "utf8");
  return JSON.parse(raw) as DeploymentArtifacts;
}

async function main(): Promise<void> {
  const signer = getSigner();
  const deployment = loadDeployment();

  const strategyController = new ethers.Contract(
    deployment.addresses.strategyController,
    strategyControllerAbi,
    signer
  );

  const protocolId = ethers.encodeBytes32String(deployment.protocolId);
  const reason = process.env.UPDATE_REASON || "manual-demo-request";
  const tx = await strategyController.requestUpdate(protocolId, reason);
  const receipt = await tx.wait();

  console.log(`requestUpdate tx: ${receipt?.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
