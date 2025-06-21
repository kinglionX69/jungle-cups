
import { useToast } from "@/components/ui/use-toast";
import { placeBet } from "@/utils/transactionUtils";
import { playClickSound } from "@/utils/gameUtils";
import { useGameState } from "./useGameState";
import { useAptosWallet } from "./useAptosWallet";

// Define minimum bet constants
const MIN_APT_BET = 0.01;
const MIN_EMOJICOIN_BET = 1000;

export const useBetHandler = (walletAddress: string) => {
  const { toast } = useToast();
  const { setCurrentBet, canBet } = useGameState();
  const { submitTransaction } = useAptosWallet();
  
  // Handle placing a bet and participating in the game
  const handlePlaceBet = async (tokenType: string, amount: number) => {
    console.log(`🎯 BET HANDLER: Starting bet placement: ${amount} ${tokenType}`);
    console.log(`🎯 BET HANDLER: Wallet address: ${walletAddress}`);
    console.log(`🎯 BET HANDLER: Can bet: ${canBet}`);
    
    try {
      if (!walletAddress) {
        console.log("❌ BET HANDLER: No wallet address available");
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }
      
      if (!canBet) {
        console.log("❌ BET HANDLER: Cannot bet at this time");
        toast({
          title: "Wait for Shuffling",
          description: "Please wait for the cups to shuffle before placing a bet",
          variant: "destructive",
        });
        return;
      }
      
      // Check minimum bet amount
      const minBet = tokenType === "APT" ? MIN_APT_BET : MIN_EMOJICOIN_BET;
      if (amount < minBet) {
        console.log(`❌ BET HANDLER: Bet amount ${amount} is below minimum ${minBet}`);
        toast({
          title: "Bet Too Small",
          description: `Minimum bet is ${minBet} ${tokenType}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("🔊 BET HANDLER: Playing click sound");
      playClickSound();
      
      console.log("💰 BET HANDLER: Creating transaction payload");
      
      // Create transaction payload
      const payload = {
        function: "0x1::coin::transfer",
        typeArguments: ["0x1::aptos_coin::AptosCoin"],
        functionArguments: [
          "0x2afbb09094a37b84d14bc9aaf7deb6dd586acc20b0e3ba8c8c5a7cafd9eb5a0d", // Escrow address
          Math.floor(amount * 100000000).toString() // Convert to octas
        ]
      };
      
      console.log("📤 BET HANDLER: Submitting transaction via wallet adapter", payload);
      
      // Add a try-catch specifically around the transaction submission
      let response;
      try {
        response = await submitTransaction(payload);
        console.log("✅ BET HANDLER: Transaction response received:", response);
      } catch (submitError) {
        console.error("❌ BET HANDLER: Transaction submission failed:", submitError);
        throw submitError;
      }
      
      // Type guard to check if response has hash property
      if (response && typeof response === 'object' && 'hash' in response && response.hash) {
        console.log("🎉 BET HANDLER: Transaction successful with hash:", response.hash);
        
        // Store current bet
        console.log("💾 BET HANDLER: Storing current bet");
        setCurrentBet({
          amount,
          tokenType,
        });
        
        console.log("📢 BET HANDLER: Showing success toast");
        toast({
          title: "Bet Placed!",
          description: `${amount} ${tokenType} has been deducted from your wallet. Now select a cup where you think the ball is hidden.`,
        });
      } else {
        console.error("❌ BET HANDLER: No transaction hash in response:", response);
        throw new Error("No transaction hash received");
      }
    } catch (error: any) {
      console.error("💥 BET HANDLER: Critical error in handlePlaceBet:", error);
      console.error("💥 BET HANDLER: Error stack:", error?.stack);
      
      let errorMessage = "Failed to place your bet. Please try again.";
      
      if (error?.message?.includes("User rejected")) {
        errorMessage = "Transaction was rejected. Please approve the transaction to place your bet.";
      } else if (error?.message?.includes("timeout")) {
        errorMessage = "Transaction timed out. Please check your wallet and try again.";
      } else if (error?.message?.includes("insufficient")) {
        errorMessage = "Insufficient balance. Please check your wallet balance.";
      }
      
      console.log("📢 BET HANDLER: Showing error toast:", errorMessage);
      toast({
        title: "Bet Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  return {
    handlePlaceBet
  };
};
