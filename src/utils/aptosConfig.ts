
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

// Create client with resilient request configuration
export const client = new AptosClient(NODE_URL);

// Backup API endpoints in case the primary one fails
const BACKUP_NODES = [
  "https://aptos-testnet.pontem.network/v1",
  "https://testnet.aptoslabs.com/v1",
];

// Function to create a client with a specific URL
const createClient = (url: string) => new AptosClient(url);

// Helper function to handle API errors with clear error messages
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return `API Error (${error.status}): ${error.message}`;
  }
  
  return error?.message || "Unknown error";
};

// Perform API request with retry logic using multiple nodes
export const retryRequest = async <T>(
  requestFn: (client: AptosClient) => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  // Try with the primary node first
  try {
    return await requestFn(client);
  } catch (error) {
    console.log(`Primary node request failed: ${handleApiError(error)}`);
    
    // If primary node fails, try backup nodes
    for (let i = 0; i < BACKUP_NODES.length; i++) {
      try {
        console.log(`Trying backup node ${i + 1}: ${BACKUP_NODES[i]}`);
        const backupClient = createClient(BACKUP_NODES[i]);
        return await requestFn(backupClient);
      } catch (backupError) {
        console.log(`Backup node ${i + 1} request failed: ${handleApiError(backupError)}`);
      }
    }
    
    // If we reached here, all attempts have failed
    throw new Error("All API nodes failed, please try again later");
  }
};
