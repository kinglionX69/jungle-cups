
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
  submitSignedBCSTransaction: async () => {
    throw new Error("Direct transaction submission is not supported in Deno. Use the Node.js service instead.");
  }
};

// Function to create API request to external Node.js service for Aptos operations
export const callAptosService = async (endpoint: string, data: any) => {
  try {
    // Replace this URL with your actual Node.js service URL
    const APTOS_SERVICE_URL = Deno.env.get("APTOS_SERVICE_URL");
    
    if (!APTOS_SERVICE_URL) {
      throw new Error("APTOS_SERVICE_URL environment variable is not set");
    }

    console.log(`Calling external Aptos service at ${APTOS_SERVICE_URL}/${endpoint}`);
    
    const response = await fetch(`${APTOS_SERVICE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("APTOS_SERVICE_API_KEY") || ""}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Aptos service returned ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Aptos service:", error);
    throw error;
  }
};

// No longer directly initializing Aptos accounts in Deno
export const initializeAptosAccount = (privateKeyHex: string) => {
  console.log("Account initialization will be handled by the Node.js service");
  return {
    address: () => ({ hex: "using_external_service" }),
    publicKey: () => ({ toBytes: () => new Uint8Array(0) }),
    signBuffer: () => new Uint8Array(0)
  };
};
