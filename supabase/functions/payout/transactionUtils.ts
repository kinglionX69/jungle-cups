
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
  try {
    // Call the external Node.js service to process the transaction
    console.log("Calling external service for signAndSubmitTransaction with:", {
      rawTransaction: rawTxn,
      privateKeyProvided: !!Deno.env.get("ESCROW_PRIVATE_KEY")
    });
    
    const result = await callAptosService("signAndSubmitTransaction", {
      rawTransaction: rawTxn,
      privateKey: Deno.env.get("ESCROW_PRIVATE_KEY")
    });
    
    console.log("External service response:", result);
    return result;
  } catch (error) {
    console.error("Error in signAndSubmitTransaction:", error);
    throw error;
  }
};

// Wait for transaction with timeout and better error handling
export const waitForTransactionWithTimeout = async (
  transactionHash: string,
  timeoutMs: number = 30000
) => {
  try {
    console.log(`Waiting for transaction ${transactionHash} with timeout ${timeoutMs}ms`);
    const startTime = Date.now();
    
    const nodeUrl = Deno.env.get("NODE_URL") || "https://fullnode.testnet.aptoslabs.com/v1";
    console.log(`Using node URL: ${nodeUrl}`);
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        // Call the Aptos fullnode REST API directly for transaction status
        const response = await fetch(`${nodeUrl}/transactions/by_hash/${transactionHash}`);
        
        if (response.ok) {
          const txData = await response.json();
          console.log(`Transaction status check result:`, txData);
          
          // Check if the transaction is confirmed
          if (txData.success !== undefined) {
            return txData;
          }
        } else {
          const errorText = await response.text();
          console.error(`Error response from node: ${response.status}`, errorText);
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
