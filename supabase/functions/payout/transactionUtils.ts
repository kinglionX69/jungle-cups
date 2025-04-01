
import { createAndSignTransaction } from "./aptosUtils.ts";

// Create transaction payload
export const createTransferPayload = (
  tokenType: string,
  recipientAddress: string,
  amountInOctas: number
) => {
  // Determine the token type address
  let tokenTypeAddress;
  if (tokenType === "APT") {
    tokenTypeAddress = "0x1::aptos_coin::AptosCoin";
  } else if (tokenType === "EMOJICOIN") {
    tokenTypeAddress = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";
  } else {
    throw new Error(`Unsupported token type: ${tokenType}`);
  }

  // Return transaction payload
  return {
    function: "0x1::coin::transfer",
    type_arguments: [tokenTypeAddress],
    arguments: [recipientAddress, amountInOctas.toString()]
  };
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

// Direct transaction submission without external service
export const processWithdrawalTransaction = async (
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  tokenType: string,
  privateKey: string
) => {
  try {
    console.log(`Processing withdrawal transaction of ${amount} ${tokenType} to ${recipientAddress}`);
    
    // Use the Aptos SDK (to be implemented) to create and submit transaction
    const txResult = await createAndSignTransaction(
      senderAddress,
      recipientAddress,
      amount,
      tokenType,
      privateKey
    );
    
    return {
      success: txResult.success,
      hash: txResult.hash,
      details: `Transaction submitted for ${amount} ${tokenType} to ${recipientAddress}`
    };
  } catch (error) {
    console.error("Error processing withdrawal transaction:", error);
    throw error;
  }
};
