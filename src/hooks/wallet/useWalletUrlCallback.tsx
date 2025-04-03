
import { useEffect } from "react";
import { hasWalletCallbackParams, getWalletAddressFromURL } from "@/utils/mobileUtils";
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
          if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.href.split('?')[0];
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      }
    };
    
    // Check immediately and on popstate events
    checkUrlForWalletAddress();
    window.addEventListener('popstate', checkUrlForWalletAddress);
    
    return () => window.removeEventListener('popstate', checkUrlForWalletAddress);
  }, [onConnect, walletAddress, toast]);
}
