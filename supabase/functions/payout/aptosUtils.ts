
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

// Perform direct REST API call to execute a transfer function
export const createAndSignTransaction = async (
  senderAddress: string,
  recipientAddress: string, 
  amount: number,
  tokenType: string,
  privateKey: string
) => {
  try {
    console.log(`Creating mock transaction for ${amount} ${tokenType} from ${senderAddress} to ${recipientAddress}`);
    
    // For testing purposes, we'll return a mock transaction hash
    // In production, this would be implemented with the Aptos SDK
    
    // Mock successful transaction - this will be replaced with actual SDK implementation
    const mockTxHash = "0x" + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
      
    console.log(`Generated mock transaction hash: ${mockTxHash}`);
    
    return {
      hash: mockTxHash,
      success: true
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};
