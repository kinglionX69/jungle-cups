
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NETWORK } from "@/utils/aptosUtils";

interface UseWalletStatusProps {
  walletAddress: string;
}

export function useWalletStatus({ walletAddress }: UseWalletStatusProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Petra wallet is installed
    const checkWallet = async () => {
      if (window.aptos) {
        setIsInstalled(true);
        
        // Check if on correct network when wallet is connected
        if (walletAddress) {
          try {
            const network = await window.aptos.network();
            console.log("Current wallet network:", network);
            
            // Check for both "testnet" and "Testnet"
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
          }
        }
      } else {
        setIsInstalled(false);
      }
    };

    checkWallet();
    window.addEventListener("load", checkWallet);
    
    return () => window.removeEventListener("load", checkWallet);
  }, [walletAddress, toast]);

  return {
    isInstalled,
    isCorrectNetwork
  };
}
