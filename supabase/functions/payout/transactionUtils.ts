
import { callAptosService } from "./aptosUtils.ts";

// Create transaction payload via external service
export const createTransferPayload = (
  tokenType: string,
  recipientAddress: string,
  amountInOctas: number
) => {
  // This function now just returns the parameters to be sent to the external service
  return {
    tokenType,
    recipientAddress,
    amountInOctas
  };
};

// Prepare raw transaction via external service
export const createRawTransaction = async (
  senderAddress: string,
  entryFunctionPayload: any
) => {
  // This function now just returns the parameters to be sent to the external service
  return {
    senderAddress,
    payload: entryFunctionPayload
  };
};

// Sign and submit transaction via external service
export const signAndSubmitTransaction = async (
  rawTxn: any,
  escrowAccount: any
) => {
  // Call the external Node.js service to process the transaction
  return await callAptosService("signAndSubmitTransaction", {
    rawTransaction: rawTxn,
    privateKey: Deno.env.get("ESCROW_PRIVATE_KEY")
  });
};

// Wait for transaction with timeout
export const waitForTransactionWithTimeout = async (
  transactionHash: string,
  timeoutMs: number = 30000
) => {
  try {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        // Call the Aptos fullnode REST API directly for transaction status
        const response = await fetch(`${Deno.env.get("NODE_URL") || "https://fullnode.testnet.aptoslabs.com/v1"}/transactions/by_hash/${transactionHash}`);
        
        if (response.ok) {
          const txData = await response.json();
          
          // Check if the transaction is confirmed
          if (txData.success !== undefined) {
            return txData;
          }
        }
        
        // Wait a bit before the next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error checking transaction status:", error);
        // Continue the loop to retry
      }
    }
    
    throw new Error("Transaction confirmation timeout");
  } catch (error) {
    console.error("Error in waitForTransactionWithTimeout:", error);
    throw error;
  }
};
