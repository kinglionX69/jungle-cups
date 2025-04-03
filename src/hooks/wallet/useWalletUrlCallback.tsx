
import { useEffect } from "react";
import { hasWalletCallbackParams, getWalletAddressFromURL } from "@/utils/mobileUtils";

interface UseWalletUrlCallbackProps {
  onConnect: (wallet: string) => void;
  walletAddress: string;
}

export function useWalletUrlCallback({ onConnect, walletAddress }: UseWalletUrlCallbackProps) {
  // Check for wallet callback params on component mount
  useEffect(() => {
    if (hasWalletCallbackParams()) {
      const address = getWalletAddressFromURL();
      if (address && !walletAddress) {
        console.log("Detected wallet address from URL params:", address);
        onConnect(address);
        
        // Clean up URL parameters
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.href.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    }
  }, [onConnect, walletAddress]);
}
