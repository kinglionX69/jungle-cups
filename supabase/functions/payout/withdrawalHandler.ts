
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
    console.log(`Starting withdrawal process for ${amount} ${tokenType} to ${playerAddress}`);
    
    // Check if APTOS_SERVICE_URL is set
    const serviceUrl = Deno.env.get("APTOS_SERVICE_URL");
    if (!serviceUrl) {
      console.error("APTOS_SERVICE_URL environment variable is not set");
      return createErrorResponse(
        500,
        "Server configuration error",
        "The Aptos service URL is not configured. Please contact support."
      );
    }
    
    // Additional debug info
    console.log(`Using Aptos service URL: ${serviceUrl}`);
    console.log(`API key available: ${!!Deno.env.get("APTOS_SERVICE_API_KEY")}`);
    
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
        
        console.log("Calling external service with request:", {
          ...aptosServiceRequest,
          privateKey: "REDACTED"
        });
        
        // Call the external service
        let transactionRes;
        try {
          transactionRes = await callAptosService("processTransaction", aptosServiceRequest);
          console.log("Transaction submitted via external service:", transactionRes);
        } catch (serviceError) {
          console.error("External service error:", serviceError);
          
          // Update transaction as failed
          await updateTransactionStatus(
            supabase, 
            transactionRecord.id, 
            'failed', 
            `external service error: ${serviceError.message}`
          );
          
          return createErrorResponse(
            502,
            "External service error",
            `The Aptos transaction service encountered an error: ${serviceError.message}`
          );
        }

        if (!transactionRes.hash) {
          const errorMessage = "External service did not return a transaction hash";
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
