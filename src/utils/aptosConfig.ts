
import { Aptos, Network, AptosConfig } from "@aptos-labs/ts-sdk";

// Configuration for Aptos network
export const NETWORK = "testnet";
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const EXPLORER_URL = "https://explorer.aptoslabs.com/txn/";
export const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";

// Application constants
export const ESCROW_WALLET_ADDRESS = "0x2afbb09094a37b84d14bc9aaf7deb6dd586acc20b0e3ba8c8c5a7cafd9eb5a0d";
export const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

export const MIN_APT_BALANCE = 1; // 1 APT
export const MIN_EMOJICOIN_BALANCE = 1000; // 1000 Emojicoin

// Initialize Aptos client with new SDK
const config = new AptosConfig({ network: Network.TESTNET });
export const client = new Aptos(config);

// Helper function to handle API errors with clear error messages
export const handleApiError = (error: any): string => {
  return error?.message || "Unknown error";
};

// Perform API request with retry logic using multiple nodes
export const retryRequest = async <T>(
  requestFn: (client: Aptos) => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  // Try with the primary node first
  try {
    return await requestFn(client);
  } catch (error) {
    console.log(`Primary node request failed: ${handleApiError(error)}`);
    throw error; // Re-throw since we're not implementing retries in this version
  }
};
