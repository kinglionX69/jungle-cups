
import { useState } from "react";
import { initializeAccount } from "@/utils/aptosUtils";

interface UseWalletInitializationProps {
  walletAddress: string;
}

export function useWalletInitialization({ walletAddress }: UseWalletInitializationProps) {
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeWallet = async () => {
    if (!walletAddress) return false;
    
    try {
      setIsInitializing(true);
      const success = await initializeAccount(walletAddress);
      
      if (success) {
        console.log("Wallet initialized successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error initializing wallet:", error);
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    isInitializing,
    initializeWallet
  };
}
