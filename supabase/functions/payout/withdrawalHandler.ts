
import { corsHeaders } from "./cors.ts";
import { callAptosService } from "./aptosUtils.ts";
import { waitForTransactionWithTimeout } from "./transactionUtils.ts";
import { verifyPlayerBalance, createTransactionRecord, updateTransactionStatus, updatePlayerBalance } from "./dbOperations.ts";
import { createSuccessResponse, createErrorResponse } from "./responseHelpers.ts";

// Process withdrawal transactions
export const handleWithdrawalTransaction = async (
  supabase: any,
  playerAddress: string, 
  amount: number, 
  tokenType: string,
  escrowPrivateKey: string
) => {
  try {
    // Generate a unique withdrawal ID
    const withdrawalId = `withdrawal_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Step 1: Verify player has enough balance
    const { availableBalance } = await verifyPlayerBalance(supabase, playerAddress, amount, tokenType);
    
    // Step 2: Create initial transaction record
    const transactionRecord = await createTransactionRecord(
      supabase, 
      playerAddress, 
      amount, 
      tokenType, 
      withdrawalId
    );

    try {
      // Step 3: Convert amount to octas (8 decimals)
      const amountInOctas = Math.floor(amount * 100000000);

      // Step 4: Call external Node.js service to handle the Aptos transaction
      if (tokenType === "APT" || tokenType === "EMOJICOIN") {
        console.log(`Requesting withdrawal of ${amount} ${tokenType} (${amountInOctas} octas) to ${playerAddress}`);
        
        // Prepare the request to the external service
        const aptosServiceRequest = {
          operation: "withdraw",
          tokenType: tokenType,
          amount: amountInOctas,
          recipientAddress: playerAddress,
          privateKey: escrowPrivateKey
        };
        
        // Call the external service
        const transactionRes = await callAptosService("processTransaction", aptosServiceRequest);
        console.log("Transaction submitted via external service:", transactionRes);

        if (!transactionRes.hash) {
          throw new Error("External service did not return a transaction hash");
        }

        // Wait for transaction completion
        try {
          const txResult = await waitForTransactionWithTimeout(transactionRes.hash);
          console.log("Transaction confirmed:", txResult);
          
          // Check if transaction succeeded
          if (txResult.success === false) {
            await updateTransactionStatus(
              supabase, 
              transactionRecord.id, 
              'failed', 
              transactionRes.hash
            );
            
            throw new Error(`Transaction failed on chain: ${txResult.vm_status}`);
          }

          // Update player balance
          await updatePlayerBalance(
            supabase, 
            playerAddress, 
            tokenType, 
            availableBalance, 
            amount
          );

          // Update transaction status to completed
          await updateTransactionStatus(
            supabase, 
            transactionRecord.id, 
            'completed', 
            transactionRes.hash
          );

          // Return success response
          return createSuccessResponse(
            amount, 
            tokenType, 
            playerAddress, 
            transactionRes.hash
          );
        } catch (waitError) {
          console.error("Error waiting for transaction:", waitError);
          
          // Update transaction as pending since we don't know if it went through
          await updateTransactionStatus(
            supabase, 
            transactionRecord.id, 
            'pending', 
            transactionRes.hash
          );
            
          throw new Error(`Waiting for transaction timed out or failed: ${waitError.message}`);
        }
      } else {
        throw new Error(`Unsupported token type: ${tokenType}`);
      }
    } catch (txError) {
      console.error("Transaction error:", txError);
      
      // Update transaction status to failed
      await updateTransactionStatus(
        supabase, 
        transactionRecord.id, 
        'failed', 
        `error: ${txError.message}`
      );

      return createErrorResponse(
        500,
        `Transaction failed: ${txError.message}`,
        "The blockchain transaction could not be completed, but your balance has not been affected. Try again later."
      );
    }
  } catch (error) {
    console.error("Error in handleWithdrawalTransaction:", error);
    
    // Determine appropriate status code
    const statusCode = error.message === "Insufficient balance" ? 400 : 500;
    
    return createErrorResponse(
      statusCode,
      error.message,
      "An unexpected error occurred in the withdrawal process."
    );
  }
};
