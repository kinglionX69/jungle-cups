
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
    // Get the Aptos service URL from environment
    const APTOS_SERVICE_URL = Deno.env.get("APTOS_SERVICE_URL");
    
    if (!APTOS_SERVICE_URL) {
      throw new Error("APTOS_SERVICE_URL environment variable is not set");
    }

    // Fix the URL path to ensure there are no double slashes
    let serviceUrl = APTOS_SERVICE_URL;
    if (serviceUrl.endsWith('/')) {
      serviceUrl = serviceUrl.slice(0, -1);
    }
    
    const fullUrl = `${serviceUrl}/${endpoint}`;
    console.log(`Calling external Aptos service at ${fullUrl}`);
    
    // Prepare API key for authorization if available
    const apiKey = Deno.env.get("APTOS_SERVICE_API_KEY") || "";
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // Make the request to the external service
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    // Check for HTTP errors with detailed logging
    if (!response.ok) {
      let errorText = await response.text();
      let errorDetails = "";
      
      try {
        // Try to parse as JSON for more detailed error information
        const errorJson = JSON.parse(errorText);
        errorText = errorJson.error || errorJson.message || errorText;
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch (e) {
        // If parsing fails, use the raw error text
        errorDetails = errorText;
      }
      
      console.error(`Service response error (${response.status}):`, errorDetails);
      throw new Error(`Aptos service returned ${response.status}: ${errorText}`);
    }

    // Parse and return the response
    const responseData = await response.json();
    console.log("Service response success:", JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error("Error calling Aptos service:", error);
    throw error;
  }
};

// No longer directly initializing Aptos account in Deno
export const initializeAptosAccount = (privateKeyHex: string) => {
  console.log("Account initialization will be handled by the Node.js service");
  return {
    address: () => ({ hex: "using_external_service" }),
    publicKey: () => ({ toBytes: () => new Uint8Array(0) }),
    signBuffer: () => new Uint8Array(0)
  };
};
