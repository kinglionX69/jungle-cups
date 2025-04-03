
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

// Initialize Aptos client with error handling and timeouts
import { AptosClient, ApiError } from "aptos";

// Create client with timeout and retry logic
export const client = new AptosClient(NODE_URL, {
  HEADERS: { 'Accept': 'application/json' },
  WITH_CREDENTIALS: false,
  TIMEOUT: 10000, // 10 second timeout
  MAX_RETRIES: 3,
});

// Helper function to handle API errors with clear error messages
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return `API Error (${error.status}): ${error.message}`;
  }
  
  return error?.message || "Unknown error";
};
