
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { withdrawWinnings } from "@/utils/transactionUtils";
import { PlayerStats } from "@/types/gameTypes";

export const useStatsWithdrawal = (
  walletAddress: string, 
  stats: PlayerStats, 
  setStats: (stats: PlayerStats) => void
) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();
  
  // Withdraw winnings to player's wallet
  const withdrawFunds = async (amount: number, tokenType: string) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }
    
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsWithdrawing(true);
      
      // Check if player has enough balance
      const currentBalance = tokenType === "APT" ? stats.aptWon : stats.emojiWon;
      if (currentBalance < amount) {
        toast({
          title: "Insufficient Balance",
          description: `You only have ${currentBalance} ${tokenType} available to withdraw`,
          variant: "destructive",
        });
        return false;
      }
      
      // Call the withdraw function from transactionUtils
      const success = await withdrawWinnings(amount, tokenType);
      
      if (success) {
        // Update local stats (the database is updated in the edge function)
        const newStats = { ...stats };
        if (tokenType === "APT") {
          newStats.aptWon -= amount;
        } else {
          newStats.emojiWon -= amount;
        }
        
        setStats(newStats);
        
        toast({
          title: "Withdrawal Successful",
          description: `${amount} ${tokenType} has been sent to your wallet. Check your wallet for the transaction!`,
        });
        
        return true;
      } else {
        toast({
          title: "Withdrawal Failed",
          description: "There was an error processing your withdrawal. Please try again later.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast({
        title: "Withdrawal Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  return {
    isWithdrawing,
    withdrawFunds
  };
};
