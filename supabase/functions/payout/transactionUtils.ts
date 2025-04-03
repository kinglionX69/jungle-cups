import { createAndSignTransaction, client } from "./aptosUtils.ts";

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
    typeArguments: [tokenTypeAddress],
    arguments: [recipientAddress, amountInOctas.toString()]
  };
};

// Improved function to wait for transaction with better error handling and real blockchain checking
export const waitForTransactionWithTimeout = async (
  transactionHash: string,
  timeoutMs: number = 30000
) => {
  try {
    console.log(`Waiting for transaction ${transactionHash} with timeout ${timeoutMs}ms`);
    
    const startTime = Date.now();
    let transactionPending = true;
    let txResult = null;
    
    while (transactionPending && Date.now() - startTime < timeoutMs) {
      try {
        // Poll the transaction status from the blockchain using new SDK
        txResult = await client.getTransactionByHash(transactionHash);
        
        if (txResult && txResult.type === "user_transaction") {
          // Check if transaction is completed
          transactionPending = false;
          console.log("Transaction confirmed:", txResult);
          return txResult;
        }
        
        // Wait a bit before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (pollError) {
        if (pollError.status === 404) {
          // Transaction not found yet, keep waiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw pollError;
        }
      }
    }
    
    if (transactionPending) {
      throw new Error(`Transaction timed out after ${timeoutMs}ms`);
    }
    
    return txResult;
  } catch (error) {
    console.error("Error in waitForTransactionWithTimeout:", error);
    throw error;
  }
};

// Direct transaction submission
export const processWithdrawalTransaction = async (
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  tokenType: string,
  privateKey: string
) => {
  try {
    console.log(`Processing withdrawal transaction of ${amount} ${tokenType} to ${recipientAddress}`);
    
    // Use the transaction function to create and sign transaction
    const txResult = await createAndSignTransaction(
      senderAddress,
      recipientAddress,
      amount,
      tokenType,
      privateKey
    );
    
    console.log(`Transaction created with hash: ${txResult.hash}`);
    
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
