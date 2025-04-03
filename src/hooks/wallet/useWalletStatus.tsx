
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NETWORK } from "@/utils/aptosUtils";
import { isInPetraMobileBrowser } from "@/utils/mobileUtils";

interface UseWalletStatusProps {
  walletAddress: string;
}

export function useWalletStatus({ walletAddress }: UseWalletStatusProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Check wallet installation and network
  const checkWalletStatus = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      // For Petra mobile browser, always consider wallet installed
      if (isInPetraMobileBrowser()) {
        setIsInstalled(true);
        // Network check will be performed during connection in mobile
        setIsCorrectNetwork(true);
        return;
      }
      
      // For other environments, check for window.aptos
      const walletDetected = typeof window !== 'undefined' && !!window.aptos;
      setIsInstalled(walletDetected);
      
      // Check network when connected
      if (walletDetected && walletAddress) {
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
    } catch (error) {
      console.error("Error checking wallet status:", error);
    } finally {
      setIsChecking(false);
    }
  }, [walletAddress, toast, isChecking]);

  useEffect(() => {
    checkWalletStatus();
    
    // Also check when the window loads fully
    const handleLoad = () => {
      checkWalletStatus();
    };
    
    window.addEventListener("load", handleLoad);
    
    // Set up periodic checks (every 30 seconds)
    const checkInterval = setInterval(checkWalletStatus, 30000);
    
    return () => {
      window.removeEventListener("load", handleLoad);
      clearInterval(checkInterval);
    };
  }, [walletAddress, checkWalletStatus]);

  return {
    isInstalled,
    isCorrectNetwork,
    checkWalletStatus
  };
}
