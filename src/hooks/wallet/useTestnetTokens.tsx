
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { requestTestnetTokens } from "@/utils/aptosUtils";

interface UseTestnetTokensProps {
  walletAddress: string;
  initializeWallet: () => Promise<boolean>;
}

export function useTestnetTokens({ walletAddress, initializeWallet }: UseTestnetTokensProps) {
  const [isRequestingTokens, setIsRequestingTokens] = useState(false);
  const { toast } = useToast();
  
  const getTestnetTokens = async () => {
    if (!walletAddress || isRequestingTokens) return;
    
    setIsRequestingTokens(true);
    
    try {
      toast({
        title: "Requesting Tokens",
        description: "Initializing wallet and requesting testnet tokens...",
      });
      
      // First ensure account is initialized
      await initializeWallet();
      
      // Request testnet tokens
      const success = await requestTestnetTokens(walletAddress);
      
      if (success) {
        toast({
          title: "Success",
          description: "Your tokens are on the way! It may take a few moments to appear in your wallet.",
        });
      } else {
        toast({
          title: "Request Failed",
          description: "Failed to request testnet tokens. Please try again or visit the Aptos Faucet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting testnet tokens:", error);
      toast({
        title: "Request Error",
        description: "An error occurred while requesting tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingTokens(false);
    }
  };
  
  return {
    getTestnetTokens,
    isRequestingTokens
  };
}
