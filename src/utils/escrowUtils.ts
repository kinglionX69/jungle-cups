
import { supabase } from "@/integrations/supabase/client";
import { 
  ESCROW_WALLET_ADDRESS, 
  MIN_APT_BALANCE, 
  MIN_EMOJICOIN_BALANCE,
  EMOJICOIN_ADDRESS
} from "./aptosConfig";
import { getWalletBalance } from "./tokenManagement";

// Get escrow wallet balances
export const getEscrowWalletBalances = async (): Promise<{
  apt: number;
  emojicoin: number;
  availableTokens: string[];
}> => {
  try {
    console.log("Checking escrow wallet balances");
    
    // Default return value
    const defaultReturn = {
      apt: 0,
      emojicoin: 0,
      availableTokens: []
    };
    
    if (!ESCROW_WALLET_ADDRESS) {
      console.error("No escrow wallet address configured");
      return defaultReturn;
    }
    
    // Get APT balance
    const aptBalance = await getWalletBalance(ESCROW_WALLET_ADDRESS, "APT");
    console.log("Escrow APT balance:", aptBalance);
    
    // For testing purposes, we're using the APT balance for Emojicoin too
    // This will be replaced with actual Emojicoin balance when moving to mainnet
    const emojiBalance = aptBalance;
    console.log("Escrow Emojicoin balance (simulated):", emojiBalance);
    
    // Determine which tokens are available for betting
    const availableTokens: string[] = [];
    
    if (aptBalance >= MIN_APT_BALANCE) {
      availableTokens.push("APT");
    }
    
    if (emojiBalance >= MIN_EMOJICOIN_BALANCE / 100000) { // Lower threshold for testing
      availableTokens.push("EMOJICOIN");
    }
    
    return {
      apt: aptBalance,
      emojicoin: emojiBalance,
      availableTokens
    };
  } catch (error) {
    console.error("Error checking escrow funding:", error);
    return {
      apt: 0,
      emojicoin: 0,
      availableTokens: []
    };
  }
};

// Check if escrow wallet is sufficiently funded
export const checkEscrowFunding = async (): Promise<{
  funded: boolean;
  availableTokens: string[];
}> => {
  try {
    const { apt, emojicoin, availableTokens } = await getEscrowWalletBalances();
    
    // Escrow is considered funded if at least one token type is available
    const funded = availableTokens.length > 0;
    
    return {
      funded,
      availableTokens
    };
  } catch (error) {
    console.error("Error checking escrow funding:", error);
    return {
      funded: false,
      availableTokens: []
    };
  }
};

// Transfer tokens from escrow to player (winning) - Backend API version
export const transferWinnings = async (
  playerAddress: string,
  amount: number, 
  tokenType: string = "APT"
): Promise<boolean> => {
  try {
    if (!playerAddress || amount <= 0) {
      console.error("Invalid parameters for transferring winnings");
      return false;
    }
    
    console.log(`Initiating transfer of ${amount} ${tokenType} to ${playerAddress}`);
    
    // Generate a unique game ID for tracking
    const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Call the Supabase Edge Function to process the payout
    const { data, error } = await supabase.functions.invoke('payout', {
      body: {
        playerAddress,
        amount,
        tokenType,
        gameId
      }
    });
    
    if (error) {
      console.error("Error calling payout function:", error);
      return false;
    }
    
    if (data && data.success) {
      console.log(`Successfully initiated payout of ${amount} ${tokenType} to ${playerAddress}`);
      console.log(`Transaction hash: ${data.transactionHash}`);
      return true;
    } else {
      console.error(`Payout failed: ${data?.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error("Error transferring winnings:", error);
    return false;
  }
};
