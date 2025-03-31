
import { AptosClient, Types, HexString } from "https://esm.sh/aptos@1.20.0";

// Network settings
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const NETWORK = "testnet";
export const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

// Initialize Aptos client
export const client = new AptosClient(NODE_URL);

// Function to create and initialize the Aptos account from a private key
export const initializeAptosAccount = (privateKeyHex: string) => {
  try {
    // Ensure privateKeyHex is properly formatted (remove 0x prefix if present)
    if (privateKeyHex.startsWith('0x')) {
      privateKeyHex = privateKeyHex.slice(2);
    }
    
    console.log("Creating account with Aptos SDK version 1.20.0");
    
    // Convert the hex string to a Uint8Array
    const privateKeyBytes = new HexString(privateKeyHex).toUint8Array();
    
    // Create the account using SDK version 1.20.0
    const account = new Types.AccountKey(privateKeyBytes);
    
    console.log("Account initialized with address:", account.address().hex());
    
    return account;
  } catch (error) {
    console.error("Error initializing Aptos account:", error);
    throw new Error(`Failed to initialize Aptos account: ${error.message}`);
  }
};
