
import { supabase } from "@/integrations/supabase/client";
import { ESCROW_WALLET_ADDRESS, EMOJICOIN_ADDRESS } from "./aptosConfig";
import { initializeAccount, initializeTokenStore } from "./tokenManagement";

// Transfer tokens from player to escrow (betting)
export const placeBet = async (
  amount: number, 
  tokenType: string = "APT"
): Promise<boolean> => {
  if (!window.aptos) return false;
  
  try {
    console.log(`Placing bet of ${amount} ${tokenType} on Aptos`);
    
    if (tokenType === "APT") {
      // Create a transaction payload to transfer APT
      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [
          ESCROW_WALLET_ADDRESS, 
          Math.floor(amount * 100000000).toString() // Convert APT to octas (8 decimals)
        ]
      };
      
      try {
        // Check if account needs initialization first
        const { address } = await window.aptos.account();
        const isInitialized = await initializeAccount(address);
        
        if (!isInitialized) {
          console.error("Could not initialize account");
          return false;
        }
        
        // Sign and submit the transaction
        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted:", response);
        
        return true;
      } catch (error: any) {
        console.error("Transaction error:", error);
        
        // Check for specific error cases
        const errorMessage = error.message || "";
        if (errorMessage.includes("CoinStore") && errorMessage.includes("not found")) {
          console.log("CoinStore not found, trying to initialize account first");
          
          const { address } = await window.aptos.account();
          await initializeAccount(address);
          
          // Try again after initialization
          const response = await window.aptos.signAndSubmitTransaction(payload);
          console.log("Transaction after initialization:", response);
          return true;
        }
        
        throw error; // Re-throw for other errors
      }
    } else if (tokenType === "EMOJICOIN") {
      // For testing purposes, we treat Emojicoin like APT
      // This will be replaced with actual Emojicoin code when moving to mainnet
      
      // Initialize Emojicoin store if needed
      const { address } = await window.aptos.account();
      await initializeTokenStore(address, tokenType);
      
      // For testing, we just use APT with the APT coin transfer
      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"], // Use APT for testing
        arguments: [
          ESCROW_WALLET_ADDRESS, 
          Math.floor(amount * 100000000).toString() // Convert to smallest units (8 decimals)
        ]
      };
      
      // Sign and submit the transaction
      const response = await window.aptos.signAndSubmitTransaction(payload);
      console.log("Emojicoin transaction submitted (using APT for testing):", response);
      
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
): Promise<{ success: boolean; message?: string; txHash?: string; explorerUrl?: string }> => {
  try {
    if (!window.aptos) {
      console.error("Wallet not connected");
      return {
        success: false,
        message: "Wallet not connected. Please connect your wallet first."
      };
    }

    if (amount <= 0) {
      console.error("Invalid withdrawal amount");
      return {
        success: false,
        message: "Invalid withdrawal amount. Please enter a positive number."
      };
    }
    
    // Get player wallet address
    const { address: playerAddress } = await window.aptos.account();
    
    if (!playerAddress) {
      console.error("Could not get player address");
      return {
        success: false,
        message: "Could not retrieve your wallet address. Please reconnect your wallet."
      };
    }
    
    console.log(`Initiating withdrawal of ${amount} ${tokenType} to ${playerAddress}`);
    
    // Call the Supabase Edge Function to process the withdrawal
    const { data, error } = await supabase.functions.invoke('payout/withdraw', {
      body: {
        playerAddress,
        amount,
        tokenType
      }
    });
    
    if (error) {
      console.error("Error calling withdrawal function:", error);
      return {
        success: false,
        message: `Error processing withdrawal: ${error.message || "Unknown error"}`
      };
    }
    
    if (data && data.success) {
      console.log(`Successfully initiated withdrawal of ${amount} ${tokenType} to ${playerAddress}`);
      console.log(`Transaction hash: ${data.transactionHash}`);
      
      return {
        success: true,
        message: `Withdrawal of ${amount} ${tokenType} successful! Tokens are on their way to your wallet.`,
        txHash: data.transactionHash,
        explorerUrl: data.explorerUrl
      };
    } else {
      console.error(`Withdrawal failed: ${data?.error || 'Unknown error'}`);
      return {
        success: false,
        message: data?.error || "Withdrawal failed. Please try again later.",
        ...(data?.details ? { details: data.details } : {})
      };
    }
  } catch (error) {
    console.error("Error withdrawing winnings:", error);
    return {
      success: false,
      message: `Unexpected error: ${error.message || "Unknown error"}`
    };
  }
};
