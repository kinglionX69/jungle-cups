
import { useEffect } from "react";
import { 
  hasWalletCallbackParams, 
  getWalletAddressFromURL, 
  cleanWalletParamsFromURL 
} from "@/utils/mobileUtils";
import { useToast } from "@/components/ui/use-toast";

interface UseWalletUrlCallbackProps {
  onConnect: (wallet: string) => void;
  walletAddress: string;
}

export function useWalletUrlCallback({ onConnect, walletAddress }: UseWalletUrlCallbackProps) {
  const { toast } = useToast();
  
  // Check for wallet callback params on mount and URL changes
  useEffect(() => {
    const checkUrlForWalletAddress = () => {
      try {
        if (hasWalletCallbackParams()) {
          const address = getWalletAddressFromURL();
          if (address && !walletAddress) {
            console.log("Detected wallet address from URL params:", address);
            onConnect(address);
            
            toast({
              title: "Wallet Connected",
              description: "Successfully connected from mobile wallet",
            });
            
            // Clean up URL parameters
            cleanWalletParamsFromURL();
          }
        }
      } catch (error) {
        console.error("Error processing wallet URL callback:", error);
      }
    };
    
    // Check immediately
    checkUrlForWalletAddress();
    
    // Also check on navigation events (popstate)
    window.addEventListener('popstate', checkUrlForWalletAddress);
    
    // Check on hash change (for apps using hash-based routing)
    window.addEventListener('hashchange', checkUrlForWalletAddress);
    
    return () => {
      window.removeEventListener('popstate', checkUrlForWalletAddress);
      window.removeEventListener('hashchange', checkUrlForWalletAddress);
    };
  }, [onConnect, walletAddress, toast]);
}
