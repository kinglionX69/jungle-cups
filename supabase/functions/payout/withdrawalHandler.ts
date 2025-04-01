
import { corsHeaders } from "./cors.ts";
import { processWithdrawalTransaction } from "./transactionUtils.ts";
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
    console.log(`Starting withdrawal process for ${amount} ${tokenType} to ${playerAddress}`);
    
    // Generate a unique withdrawal ID
    const withdrawalId = `withdrawal_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Step 1: Verify player has enough balance
    console.log("Verifying player balance");
    let availableBalance;
    try {
      const balanceResult = await verifyPlayerBalance(supabase, playerAddress, amount, tokenType);
      availableBalance = balanceResult.availableBalance;
      console.log(`Player has ${availableBalance} ${tokenType} available`);
    } catch (balanceError) {
      console.error("Balance verification error:", balanceError);
      return createErrorResponse(
        400,
        balanceError.message || "Balance verification failed",
        "Could not verify your available balance for withdrawal."
      );
    }
    
    // Step 2: Create initial transaction record
    console.log("Creating transaction record");
    let transactionRecord;
    try {
      transactionRecord = await createTransactionRecord(
        supabase, 
        playerAddress, 
        amount, 
        tokenType, 
        withdrawalId
      );
      console.log("Transaction record created with ID:", transactionRecord.id);
    } catch (dbError) {
      console.error("Database error when creating transaction record:", dbError);
      return createErrorResponse(
        500,
        "Database error",
        "Failed to create transaction record. Please try again later."
      );
    }

    try {
      // Step 3: Convert amount to octas (8 decimals)
      const amountInOctas = Math.floor(amount * 100000000);
      console.log(`Amount in octas: ${amountInOctas}`);

      // Step 4: Process the withdrawal transaction directly
      if (tokenType === "APT" || tokenType === "EMOJICOIN") {
        console.log(`Processing withdrawal of ${amount} ${tokenType} (${amountInOctas} octas) to ${playerAddress}`);
        
        // Get the escrow wallet address from the private key
        // In real implementation, this would use the Aptos SDK to derive the address
        const escrowAddress = "0x2afbb09094a37b84d14bc9aaf7deb6dd586acc20b0e3ba8c8c5a7cafd9eb5a0d";
        
        // Process the transaction directly
        let transactionRes;
        try {
          transactionRes = await processWithdrawalTransaction(
            escrowAddress,
            playerAddress,
            amountInOctas,
            tokenType,
            escrowPrivateKey
          );
          console.log("Transaction submitted:", transactionRes);
        } catch (txError) {
          console.error("Transaction error:", txError);
          
          // Update transaction as failed
          await updateTransactionStatus(
            supabase, 
            transactionRecord.id, 
            'failed', 
            `transaction error: ${txError.message}`
          );
          
          return createErrorResponse(
            500,
            "Transaction error",
            `The transaction couldn't be processed: ${txError.message}`
          );
        }

        if (!transactionRes.hash) {
          const errorMessage = "No transaction hash returned";
          console.error(errorMessage);
          
          // Update transaction as failed
          await updateTransactionStatus(
            supabase, 
            transactionRecord.id, 
            'failed', 
            errorMessage
          );
          
          return createErrorResponse(
            500,
            errorMessage,
            "The transaction could not be processed. Please try again later."
          );
        }

        // Wait for transaction completion
        try {
          console.log(`Waiting for transaction ${transactionRes.hash} to be confirmed`);
          const txResult = await waitForTransactionWithTimeout(transactionRes.hash);
          console.log("Transaction confirmed:", txResult);
          
          // Check if transaction succeeded
          if (txResult.success === false) {
            const errorMessage = `Transaction failed on chain: ${txResult.vm_status}`;
            console.error(errorMessage);
            
            await updateTransactionStatus(
              supabase, 
              transactionRecord.id, 
              'failed', 
              transactionRes.hash
            );
            
            return createErrorResponse(
              500,
              errorMessage,
              "The blockchain transaction failed. Your balance has not been affected."
            );
          }

          // Update player balance
          console.log("Updating player balance in database");
          await updatePlayerBalance(
            supabase, 
            playerAddress, 
            tokenType, 
            availableBalance, 
            amount
          );

          // Update transaction status to completed
          console.log("Updating transaction status to completed");
          await updateTransactionStatus(
            supabase, 
            transactionRecord.id, 
            'completed', 
            transactionRes.hash
          );

          // Return success response
          console.log("Withdrawal completed successfully");
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
            
          return createErrorResponse(
            504,
            `Waiting for transaction timed out: ${waitError.message}`,
            "The transaction was submitted but we couldn't confirm its completion. Please check your wallet later or contact support."
          );
        }
      } else {
        const errorMessage = `Unsupported token type: ${tokenType}`;
        console.error(errorMessage);
        
        // Update transaction as failed
        await updateTransactionStatus(
          supabase, 
          transactionRecord.id, 
          'failed', 
          errorMessage
        );
        
        return createErrorResponse(
          400,
          errorMessage,
          "This token type is not supported for withdrawals."
        );
      }
    } catch (txError) {
      console.error("Transaction error:", txError);
      
      // Update transaction status to failed
      try {
        await updateTransactionStatus(
          supabase, 
          transactionRecord.id, 
          'failed', 
          `error: ${txError.message}`
        );
      } catch (updateError) {
        console.error("Additional error when updating transaction status:", updateError);
      }

      return createErrorResponse(
        500,
        `Transaction failed: ${txError.message}`,
        "The blockchain transaction could not be completed, but your balance has not been affected. Try again later."
      );
    }
  } catch (error) {
    console.error("Unexpected error in handleWithdrawalTransaction:", error);
    
    // Determine appropriate status code
    const statusCode = error.message === "Insufficient balance" ? 400 : 500;
    
    return createErrorResponse(
      statusCode,
      error.message || "Unknown error",
      "An unexpected error occurred in the withdrawal process."
    );
  }
};
