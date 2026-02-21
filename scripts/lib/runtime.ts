import {ethers} from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

export function getRpcUrl(): string {
  const rpcUrl = process.env.WORKFLOW_RPC_URL || process.env.TENDERLY_VTN_RPC_URL || process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("Missing RPC URL: set WORKFLOW_RPC_URL or TENDERLY_VTN_RPC_URL");
  }
  return rpcUrl;
}

export function getSigner(): ethers.Wallet {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing PRIVATE_KEY in environment");
  }
  return new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(getRpcUrl()));
}
