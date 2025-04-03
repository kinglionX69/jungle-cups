
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NETWORK } from "@/utils/aptosUtils";
import { isInPetraMobileBrowser } from "@/utils/mobileUtils";

interface UseWalletStatusProps {
  walletAddress: string;
}

export function useWalletStatus({ walletAddress }: UseWalletStatusProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const { toast } = useToast();

  // Check wallet installation and network
  useEffect(() => {
    const checkWallet = async () => {
      // For Petra mobile browser, always consider wallet installed
      if (isInPetraMobileBrowser()) {
        setIsInstalled(true);
        return;
      }
      
      // For other environments, check for window.aptos
      setIsInstalled(!!window.aptos);
      
      // Check network when connected
      if (window.aptos && walletAddress) {
        try {
          const network = await window.aptos.network();
          const networkMatch = network.toLowerCase() === NETWORK.toLowerCase();
          setIsCorrectNetwork(networkMatch);
          
          if (!networkMatch) {
            toast({
              title: "Wrong Network",
              description: `Please switch to Aptos ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)} in your wallet.`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking network:", error);
          setIsCorrectNetwork(false);
        }
      }
    };

    checkWallet();
    
    // Also check when the window loads fully
    window.addEventListener("load", checkWallet);
    return () => window.removeEventListener("load", checkWallet);
  }, [walletAddress, toast]);

  return {
    isInstalled,
    isCorrectNetwork
  };
}
