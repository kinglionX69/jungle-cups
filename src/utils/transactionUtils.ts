
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
        
        // For testing, we would wait for transaction confirmation
        // In production, you'd implement proper transaction tracking
        
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
      // Initialize Emojicoin store if needed
      const { address } = await window.aptos.account();
      await initializeTokenStore(address, tokenType);
      
      // Create transaction payload for Emojicoin transfer
      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: [EMOJICOIN_ADDRESS],
        arguments: [
          ESCROW_WALLET_ADDRESS, 
          Math.floor(amount * 100000000).toString() // Convert to smallest units (8 decimals)
        ]
      };
      
      // Sign and submit the transaction
      const response = await window.aptos.signAndSubmitTransaction(payload);
      console.log("Emojicoin transaction submitted:", response);
      
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
): Promise<boolean> => {
  try {
    if (!window.aptos) {
      console.error("Wallet not connected");
      return false;
    }

    if (amount <= 0) {
      console.error("Invalid withdrawal amount");
      return false;
    }
    
    // Get player wallet address
    const { address: playerAddress } = await window.aptos.account();
    
    if (!playerAddress) {
      console.error("Could not get player address");
      return false;
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
      return false;
    }
    
    if (data && data.success) {
      console.log(`Successfully initiated withdrawal of ${amount} ${tokenType} to ${playerAddress}`);
      console.log(`Transaction hash: ${data.transactionHash}`);
      return true;
    } else {
      console.error(`Withdrawal failed: ${data?.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error("Error withdrawing winnings:", error);
    return false;
  }
};
