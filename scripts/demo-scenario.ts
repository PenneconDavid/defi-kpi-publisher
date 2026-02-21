import {ethers} from "ethers";
import * as fs from "node:fs";
import * as dotenv from "dotenv";
import {defaultConfig} from "../workflows/src/config.js";
import {handleProactiveCron} from "../workflows/src/handlers/proactiveCron.js";
import {handleReactiveLog} from "../workflows/src/handlers/reactiveLog.js";
import {getSigner} from "./lib/runtime.js";

dotenv.config();

type DeploymentArtifacts = {
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
  "function setRequester(address requester, bool allowed) external",
  "function requestUpdate(bytes32 protocolId, string reason) external"
];

function loadDeployment(): DeploymentArtifacts {
  const deploymentFile = process.env.DEPLOYMENT_FILE || "deployments/latest.json";
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Missing deployment file: ${deploymentFile}. Run deploy first.`);
  }
  return JSON.parse(fs.readFileSync(deploymentFile, "utf8")) as DeploymentArtifacts;
}

async function main(): Promise<void> {
  const deployment = loadDeployment();
  const signer = getSigner();
  const protocolId = deployment.protocolId || defaultConfig.protocolId;
  const protocolIdBytes = ethers.encodeBytes32String(protocolId);

  const policyManager = new ethers.Contract(deployment.addresses.policyManager, policyManagerAbi, signer);
  const strategyController = new ethers.Contract(
    deployment.addresses.strategyController,
    strategyControllerAbi,
    signer
  );

  const configureTx = await policyManager.configurePolicy(protocolIdBytes, {
    minChange1dBps: BigInt(defaultConfig.policyThresholds.minChange1dBps),
    minChange7dBps: BigInt(defaultConfig.policyThresholds.minChange7dBps),
    minTvlUsd: BigInt(defaultConfig.policyThresholds.minTvlUsd),
    cooldownSeconds: BigInt(process.env.COOLDOWN_SECONDS || "600"),
    enabled: true
  });
  const configureReceipt = await configureTx.wait();

  const requesterTx = await strategyController.setRequester(signer.address, true);
  const requesterReceipt = await requesterTx.wait();

  const proactive = await handleProactiveCron();

  const requestReason = "demo-reactive-request";
  const requestTx = await strategyController.requestUpdate(protocolIdBytes, requestReason);
  const requestReceipt = await requestTx.wait();

  const reactive = await handleReactiveLog({protocolId, reason: requestReason});

  const explorerBase = process.env.TENDERLY_EXPLORER_BASE_URL || "";
  const toLink = (hash: string | undefined): string | undefined =>
    hash && explorerBase ? `${explorerBase}/tx/${hash}` : hash;

  console.log("Demo scenario complete.");
  console.log(
    JSON.stringify(
      {
        setupTx: {
          configurePolicy: toLink(configureReceipt?.hash),
          setRequester: toLink(requesterReceipt?.hash)
        },
        proactive,
        reactiveTriggerTx: toLink(requestReceipt?.hash),
        reactive
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
