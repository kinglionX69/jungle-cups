
import { useState, useEffect } from "react";
import { getWalletBalance } from "@/utils/tokenManagement";

interface UseWalletBalanceProps {
  walletAddress: string;
  isCorrectNetwork: boolean;
}

interface WalletBalanceData {
  aptBalance: number;
  emojiBalance: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useWalletBalance({ 
  walletAddress, 
  isCorrectNetwork 
}: UseWalletBalanceProps): WalletBalanceData {
  const [aptBalance, setAptBalance] = useState<number>(0);
  const [emojiBalance, setEmojiBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBalances = async () => {
    if (!walletAddress || !isCorrectNetwork) {
      setAptBalance(0);
      setEmojiBalance(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch APT balance
      const aptBal = await getWalletBalance(walletAddress, "APT");
      setAptBalance(aptBal);
      
      // Fetch Emojicoin balance
      const emojiBal = await getWalletBalance(walletAddress, "EMOJICOIN");
      setEmojiBalance(emojiBal);
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balances on initial load and when wallet/network changes
  useEffect(() => {
    fetchBalances();
    
    // Refresh balances every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    
    return () => clearInterval(interval);
  }, [walletAddress, isCorrectNetwork]);

  return {
    aptBalance,
    emojiBalance,
    isLoading,
    refetch: fetchBalances
  };
}
