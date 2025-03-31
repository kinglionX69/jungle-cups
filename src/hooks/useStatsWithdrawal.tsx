
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { withdrawWinnings } from "@/utils/transactionUtils";
import { PlayerStats } from "@/types/gameTypes";

// Extend the withdrawal result type to include the details property
interface WithdrawalResult {
  success: boolean;
  message?: string;
  details?: string; // Adding the details property
  txHash?: string;
  explorerUrl?: string;
}

export const useStatsWithdrawal = (
  walletAddress: string, 
  stats: PlayerStats, 
  setStats: (stats: PlayerStats) => void
) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastTxExplorerUrl, setLastTxExplorerUrl] = useState<string | null>(null);
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
      const result = await withdrawWinnings(amount, tokenType) as WithdrawalResult;
      
      if (result.success) {
        // Update local stats (the database is updated in the edge function)
        const newStats = { ...stats };
        if (tokenType === "APT") {
          newStats.aptWon -= amount;
        } else {
          newStats.emojiWon -= amount;
        }
        
        setStats(newStats);
        
        // Store transaction details
        if (result.txHash) {
          setLastTxHash(result.txHash);
        }
        
        if (result.explorerUrl) {
          setLastTxExplorerUrl(result.explorerUrl);
        }
        
        // Show success message with explorer link if available
        toast({
          title: "Withdrawal Successful",
          description: result.message || `${amount} ${tokenType} has been sent to your wallet.`,
          action: result.explorerUrl ? (
            <a 
              href={result.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-jungle-green hover:bg-jungle-darkGreen rounded"
            >
              View Transaction
            </a>
          ) : undefined,
        });
        
        return true;
      } else {
        // Show error message with details if available
        toast({
          title: "Withdrawal Failed",
          description: result.message || "There was an error processing your withdrawal.",
          variant: "destructive",
        });
        
        // If there are additional details, show them in a secondary toast
        if (result.details) {
          setTimeout(() => {
            toast({
              title: "Additional Details",
              description: result.details,
              variant: "destructive",
            });
          }, 500);
        }
        
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
    withdrawFunds,
    lastTxHash,
    lastTxExplorerUrl
  };
};
