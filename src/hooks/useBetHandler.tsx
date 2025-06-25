
import { useToast } from "@/components/ui/use-toast";
import { playClickSoundSafe } from "@/utils/safeAudio";
import { useGameState } from "./useGameState";
import { useAptosWallet } from "./useAptosWallet";

// Define minimum bet constants
const MIN_APT_BET = 0.01;
const MIN_EMOJICOIN_BET = 1000;

export const useBetHandler = (walletAddress: string) => {
  const { toast } = useToast();
  const { setCurrentBet, canBet } = useGameState();
  const { submitTransaction, connected, account } = useAptosWallet();
  
  // Handle placing a bet and participating in the game
  const handlePlaceBet = async (tokenType: string, amount: number) => {
    console.log("🎯 BET HANDLER: ===============================");
    console.log("🎯 BET HANDLER: Starting bet placement");
    console.log("🎯 BET HANDLER: Token type:", tokenType);
    console.log("🎯 BET HANDLER: Amount:", amount);
    console.log("🎯 BET HANDLER: Wallet address:", walletAddress);
    console.log("🎯 BET HANDLER: Connected:", connected);
    console.log("🎯 BET HANDLER: Account:", account);
    console.log("🎯 BET HANDLER: Can bet:", canBet);
    console.log("🎯 BET HANDLER: submitTransaction function:", typeof submitTransaction);
    
    try {
      // Pre-flight checks with detailed logging
      console.log("🔍 BET HANDLER: Starting pre-flight checks...");
      
      if (!connected || !walletAddress) {
        console.log("❌ BET HANDLER: FAILED - Wallet not connected");
        console.log("❌ BET HANDLER: Connected:", connected);
        console.log("❌ BET HANDLER: Wallet address:", walletAddress);
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }
      console.log("✅ BET HANDLER: Wallet connection check passed");
      
      if (!canBet) {
        console.log("❌ BET HANDLER: FAILED - Cannot bet at this time");
        console.log("❌ BET HANDLER: canBet state:", canBet);
        toast({
          title: "Wait for Shuffling",
          description: "Please wait for the cups to shuffle before placing a bet",
          variant: "destructive",
        });
        return;
      }
      console.log("✅ BET HANDLER: canBet check passed");
      
      // Check minimum bet amount
      const minBet = tokenType === "APT" ? MIN_APT_BET : MIN_EMOJICOIN_BET;
      if (amount < minBet) {
        console.log("❌ BET HANDLER: FAILED - Bet amount too small");
        console.log("❌ BET HANDLER: Amount:", amount, "Min bet:", minBet);
        toast({
          title: "Bet Too Small",
          description: `Minimum bet is ${minBet} ${tokenType}`,
          variant: "destructive",
        });
        return;
      }
      console.log("✅ BET HANDLER: Minimum bet check passed");
      
      console.log("🔊 BET HANDLER: Playing click sound...");
      await playClickSoundSafe();
      console.log("✅ BET HANDLER: Click sound played");
      
      console.log("💰 BET HANDLER: Creating transaction payload...");
      
      // Create proper transaction payload for APT transfer
      const amountInOctas = Math.floor(amount * 100000000); // Convert APT to octas
      const payload = {
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [
          "0x2afbb09094a37b84d14bc9aaf7deb6dd586acc20b0e3ba8c8c5a7cafd9eb5a0d", // Escrow address
          amountInOctas.toString()
        ]
      };
      
      console.log("📦 BET HANDLER: Transaction payload created:");
      console.log("📦 BET HANDLER: Function:", payload.function);
      console.log("📦 BET HANDLER: Type arguments:", payload.type_arguments);
      console.log("📦 BET HANDLER: Arguments:", payload.arguments);
      console.log("📦 BET HANDLER: Amount in octas:", amountInOctas);
      
      if (!submitTransaction) {
        console.error("❌ BET HANDLER: CRITICAL - submitTransaction function not available");
        toast({
          title: "Wallet Error",
          description: "Wallet transaction function not available. Please reconnect your wallet.",
          variant: "destructive",
        });
        return;
      }
      console.log("✅ BET HANDLER: submitTransaction function available");
      
      console.log("📤 BET HANDLER: About to call submitTransaction...");
      console.log("📤 BET HANDLER: This should trigger the Petra wallet popup");
      
      // Submit transaction directly without circuit breaker wrapper for debugging
      const response = await submitTransaction(payload);
      
      console.log("📨 BET HANDLER: Transaction response received:");
      console.log("📨 BET HANDLER: Response type:", typeof response);
      console.log("📨 BET HANDLER: Response:", response);
      console.log("📨 BET HANDLER: Response keys:", response ? Object.keys(response) : "null/undefined");
      
      // Check if transaction was successful
      if (response && response.hash) {
        console.log("🎉 BET HANDLER: Transaction successful!");
        console.log("🎉 BET HANDLER: Transaction hash:", response.hash);
        
        // Store current bet immediately after successful transaction
        console.log("💾 BET HANDLER: Storing current bet...");
        setCurrentBet({
          amount,
          tokenType,
        });
        console.log("✅ BET HANDLER: Current bet stored");
        
        console.log("📢 BET HANDLER: Showing success toast");
        toast({
          title: "Bet Placed Successfully!",
          description: `${amount} ${tokenType} has been deducted from your wallet. Now select a cup!`,
        });
        
        console.log("🎯 BET HANDLER: Bet placement completed successfully!");
        return true;
      } else {
        console.error("❌ BET HANDLER: Transaction failed - invalid response");
        console.error("❌ BET HANDLER: Expected hash property, got:", response);
        throw new Error("Transaction failed - invalid response from wallet");
      }
    } catch (error: any) {
      console.error("💥 BET HANDLER: ===============================");
      console.error("💥 BET HANDLER: ERROR CAUGHT:");
      console.error("💥 BET HANDLER: Error type:", typeof error);  
      console.error("💥 BET HANDLER: Error message:", error?.message);
      console.error("💥 BET HANDLER: Error name:", error?.name);
      console.error("💥 BET HANDLER: Full error object:", error);
      console.error("💥 BET HANDLER: Error stack:", error?.stack);
      
      let errorMessage = "Failed to place your bet. Please try again.";
      
      if (error?.message?.includes("User rejected") || error?.message?.includes("rejected")) {
        errorMessage = "Transaction was rejected. Please approve the transaction to place your bet.";
        console.log("📝 BET HANDLER: User rejected transaction");
      } else if (error?.message?.includes("insufficient")) {
        errorMessage = "Insufficient balance. Please check your wallet balance.";
        console.log("📝 BET HANDLER: Insufficient balance");
      } else if (error?.message?.includes("Wallet not connected")) {
        errorMessage = "Please connect your wallet first.";
        console.log("📝 BET HANDLER: Wallet not connected");
      } else if (error?.message?.includes("not available")) {
        errorMessage = "Wallet function not available. Please reconnect your wallet.";
        console.log("📝 BET HANDLER: Wallet function not available");
      } else {
        console.log("📝 BET HANDLER: Generic error, using default message");
      }
      
      console.log("📢 BET HANDLER: Showing error toast:", errorMessage);
      toast({
        title: "Bet Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.log("🎯 BET HANDLER: Bet placement failed!");
    }
  };
  
  return {
    handlePlaceBet
  };
};
