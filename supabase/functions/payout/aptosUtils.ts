
// Network settings
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const NETWORK = "testnet";
export const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

// Initialize Aptos client for REST API calls
export const client = {
  nodeUrl: NODE_URL,
  getChainId: async () => {
    const response = await fetch(`${NODE_URL}/chain_id`);
    const data = await response.json();
    return data.toString();
  },
  getAccount: async (address: string) => {
    const response = await fetch(`${NODE_URL}/accounts/${address}`);
    return await response.json();
  },
  waitForTransaction: async (txHash: string) => {
    const response = await fetch(`${NODE_URL}/transactions/by_hash/${txHash}`);
    return await response.json();
  },
  // We'll rely on the Aptos SDK for Deno to handle these operations
  submitSignedBCSTransaction: async (signedTx: Uint8Array) => {
    const response = await fetch(`${NODE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x.aptos.signed_transaction+bcs",
      },
      body: signedTx,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transaction submission failed: ${errorText}`);
    }
    
    return await response.json();
  }
};

// Direct initialization for Aptos account using SDK
export const initializeAptosAccount = (privateKeyHex: string) => {
  try {
    // This is a placeholder function - when using the Aptos SDK for Deno,
    // we'll create an account directly with the privateKey
    console.log("Initializing Aptos account");
    
    // Remove '0x' prefix if present
    if (privateKeyHex.startsWith('0x')) {
      privateKeyHex = privateKeyHex.slice(2);
    }
    
    // This would be implemented with the Aptos SDK in Deno
    // For now, we'll return a mock object
    return {
      address: () => ({ hex: "using_aptos_sdk_for_deno" }),
      publicKey: () => ({ toBytes: () => new Uint8Array(0) }),
      signBuffer: (buffer: Uint8Array) => new Uint8Array(0)
    };
  } catch (error) {
    console.error("Error initializing Aptos account:", error);
    throw error;
  }
};

// Create and sign a transaction directly in the Edge Function
export const createAndSignTransaction = async (
  senderAddress: string,
  recipientAddress: string, 
  amount: number,
  tokenType: string,
  privateKey: string
) => {
  try {
    console.log(`Creating transaction for ${amount} ${tokenType} from ${senderAddress} to ${recipientAddress}`);
    
    // This would be implemented with the Aptos SDK in Deno
    // The implementation would create, sign, and submit a transaction directly
    
    // Mock response for now - this would be replaced with actual SDK implementation
    return {
      hash: "transaction_hash_placeholder",
      success: true
    };
  } catch (error) {
    console.error("Error creating and signing transaction:", error);
    throw error;
  }
};
