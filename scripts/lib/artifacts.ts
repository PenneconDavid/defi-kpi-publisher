import * as fs from "node:fs";
import type {InterfaceAbi} from "ethers";

type FoundryArtifact = {
  abi: InterfaceAbi;
  bytecode: {
    object: string;
  };
};

export function loadFoundryArtifact(contractName: string): FoundryArtifact {
  const artifactPath = `out/${contractName}.sol/${contractName}.json`;
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Missing artifact at ${artifactPath}. Run "npm run build" first.`);
  }
  const raw = fs.readFileSync(artifactPath, "utf8");
  return JSON.parse(raw) as FoundryArtifact;
}
