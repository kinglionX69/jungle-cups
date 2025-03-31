
import { useToast } from "@/components/ui/use-toast";
import { placeBet } from "@/utils/aptosUtils";
import { playClickSound } from "@/utils/gameUtils";
import { useGameState } from "./useGameState";

export const useBetHandler = (walletAddress: string) => {
  const { toast } = useToast();
  const { setCurrentBet, canBet } = useGameState();
  
  // Handle placing a bet and participating in the game
  const handlePlaceBet = async (tokenType: string, amount: number) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (!canBet) {
      toast({
        title: "Wait for Shuffling",
        description: "Please wait for the cups to shuffle before placing a bet",
        variant: "destructive",
      });
      return;
    }
    
    playClickSound();
    
    // Place the bet transaction
    const betPlaced = await placeBet(amount, tokenType);
    if (!betPlaced) {
      toast({
        title: "Bet Failed",
        description: "Failed to place your bet. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Store current bet
    setCurrentBet({
      amount,
      tokenType,
    });
    
    toast({
      title: "Bet Placed!",
      description: "Now select a cup where you think the ball is hidden",
    });
  };
  
  return {
    handlePlaceBet
  };
};
