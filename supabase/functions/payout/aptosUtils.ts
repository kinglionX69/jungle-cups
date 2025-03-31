
import { AptosClient, TxnBuilderTypes, HexString, BCS } from "https://esm.sh/aptos@1.37.1";

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
    
    console.log("Creating account with Aptos SDK version 1.37.1");
    
    // Convert the hex string to a Uint8Array for the private key
    const privateKeyBytes = HexString.ensure(privateKeyHex).toUint8Array();
    
    // Create an Ed25519 keypair using the SDK's compatible approach for Deno
    const secretKey = new Uint8Array([...privateKeyBytes, ...new Uint8Array(32)]);
    const keypair = TxnBuilderTypes.Ed25519PrivateKey.fromSecretKey(secretKey);
    
    // Get the account address from the public key
    const publicKey = keypair.publicKey();
    const authKey = TxnBuilderTypes.AuthenticationKey.ed25519(publicKey);
    const accountAddress = authKey.derivedAddress();
    
    console.log("Account initialized with address:", HexString.fromUint8Array(accountAddress.address).hex());
    
    return {
      address: () => HexString.fromUint8Array(accountAddress.address),
      publicKey: () => publicKey,
      signBuffer: (data: Uint8Array) => {
        const signature = keypair.sign(data);
        return signature.toUint8Array();
      }
    };
  } catch (error) {
    console.error("Error initializing Aptos account:", error);
    throw new Error(`Failed to initialize Aptos account: ${error.message}`);
  }
};
