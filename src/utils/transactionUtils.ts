
import { supabase } from "@/integrations/supabase/client";
import { ESCROW_WALLET_ADDRESS, EMOJICOIN_ADDRESS } from "./aptosConfig";
import { initializeAccount, initializeTokenStore } from "./tokenManagement";

// Transfer tokens from player to escrow (betting)
export const placeBet = async (
  amount: number, 
  tokenType: string = "APT"
): Promise<boolean> => {
  try {
    console.log(`Placing bet of ${amount} ${tokenType} on Aptos`);
    
    if (tokenType === "APT") {
      // Create a transaction payload to transfer APT
      const payload = {
        function: "0x1::coin::transfer",
        typeArguments: ["0x1::aptos_coin::AptosCoin"],
        functionArguments: [
          ESCROW_WALLET_ADDRESS, 
          Math.floor(amount * 100000000).toString() // Convert APT to octas (8 decimals)
        ]
      };
      
      // Return the transaction object for the component to handle
      return true;
    } else if (tokenType === "EMOJICOIN") {
      // For testing, we just use APT with the APT coin transfer
      const payload = {
        function: "0x1::coin::transfer",
        typeArguments: ["0x1::aptos_coin::AptosCoin"], // Use APT for testing
        functionArguments: [
          ESCROW_WALLET_ADDRESS, 
          Math.floor(amount * 100000000).toString() // Convert to smallest units (8 decimals)
        ]
      };
      
      return true;
    } else {
      console.error(`Unsupported token type: ${tokenType}`);
      return false;
    }
  } catch (error) {
    console.error("Error placing bet:", error);
    return false;
  }
};

// Withdraw winnings from player stats to wallet
export const withdrawWinnings = async (
  amount: number, 
  tokenType: string = "APT"
): Promise<{ success: boolean; message?: string; details?: string; txHash?: string; explorerUrl?: string }> => {
  try {
    if (amount <= 0) {
      console.error("Invalid withdrawal amount");
      return {
        success: false,
        message: "Invalid withdrawal amount. Please enter a positive number."
      };
    }
    
    console.log(`Initiating withdrawal of ${amount} ${tokenType}`);
    
    // Call the Supabase Edge Function to process the withdrawal
    try {
      console.log("Calling Supabase Edge Function to process withdrawal directly");
      
      // Get wallet address from the connected account
      let playerAddress = "";
      try {
        // Modern Aptos wallet adapter returns address as a property of the account object
        if (window.aptos) {
          const accountInfo = await window.aptos.account();
          if (accountInfo && accountInfo.address) {
            playerAddress = accountInfo.address;
          }
        } else {
          // Try to get address from wallet adapter
          const wallet = await window.aptos?.connect();
          if (wallet && wallet.address) {
            playerAddress = wallet.address;
          }
        }
      } catch (walletError) {
        console.error("Error getting wallet address:", walletError);
        return {
          success: false,
          message: "Could not retrieve your wallet address",
          details: "Please make sure your wallet is connected properly"
        };
      }
      
      if (!playerAddress) {
        return {
          success: false,
          message: "Wallet address not available",
          details: "Please reconnect your wallet and try again"
        };
      }
      
      const { data, error } = await supabase.functions.invoke('payout/withdraw', {
        body: {
          playerAddress,
          amount,
          tokenType
        }
      });
      
      if (error) {
        console.error("Error calling withdrawal function:", error);
        // Enhanced error handling to provide more details
        const errorDetails = error.message || "Unknown error";
        let userMessage = "Error processing withdrawal. Please try again later.";
        let technicalDetails = "The server encountered an error processing your request.";
        
        // Try to extract more detailed information
        if (error.message && error.message.includes("non-2xx")) {
          userMessage = "The server returned an error response. This might be due to service maintenance or configuration issues.";
          technicalDetails = "Edge Function returned a non-2xx status code. Check the Edge Function logs for more details.";
        }
        
        return {
          success: false,
          message: userMessage,
          details: `${errorDetails}. ${technicalDetails}`
        };
      }
      
      if (data && data.success) {
        console.log(`Successfully initiated withdrawal of ${amount} ${tokenType}`);
        console.log(`Transaction hash: ${data.transactionHash}`);
        
        return {
          success: true,
          message: `Withdrawal of ${amount} ${tokenType} successful! Tokens are on their way to your wallet.`,
          txHash: data.transactionHash,
          explorerUrl: data.explorerUrl,
          details: data.details || "Transaction submitted successfully."
        };
      } else {
        console.error(`Withdrawal failed: ${data?.error || 'Unknown error'}`);
        return {
          success: false,
          message: data?.error || "Withdrawal failed. Please try again later.",
          details: data?.details || "No additional details available."
        };
      }
    } catch (invokeError) {
      console.error("Function invocation error:", invokeError);
      return {
        success: false,
        message: "Failed to connect to the withdrawal service",
        details: `Technical details: ${invokeError.message}`
      };
    }
  } catch (error) {
    console.error("Error withdrawing winnings:", error);
    return {
      success: false,
      message: `Unexpected error: ${error.message || "Unknown error"}`,
      details: "Please check your wallet connection and try again."
    };
  }
};
