
import { useToast } from "@/components/ui/use-toast";
import { NETWORK } from "@/utils/aptosUtils";
import { 
  isMobileDevice, 
  isInPetraMobileBrowser, 
  redirectToPetraMobile 
} from "@/utils/mobileUtils";

interface UseWalletConnectorProps {
  onConnect: (wallet: string) => void;
  initializeWallet: () => Promise<boolean>;
}

export function useWalletConnector({ onConnect, initializeWallet }: UseWalletConnectorProps) {
  const { toast } = useToast();

  const connectWallet = async () => {
    // Important: If already in Petra browser, just connect directly instead of redirecting
    if (isInPetraMobileBrowser()) {
      console.log("Already in Petra mobile browser, connecting directly");
      if (!window.aptos) {
        toast({
          title: "Wallet Not Available",
          description: "Cannot find Petra wallet in this browser",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Connect to wallet
        const response = await window.aptos.connect();
        onConnect(response.address);
        
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to Petra wallet",
        });
        return;
      } catch (error) {
        console.error("Error connecting to wallet in Petra browser:", error);
        toast({
          title: "Connection Failed",
          description: "Could not connect to your wallet. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // For other mobile devices, redirect to Petra app
    if (isMobileDevice() && !isInPetraMobileBrowser()) {
      toast({
        title: "Opening Petra Wallet",
        description: "Redirecting you to the Petra mobile app...",
      });
      redirectToPetraMobile();
      return;
    }
    
    // For desktop devices
    if (!window.aptos) {
      toast({
        title: "Wallet Not Found",
        description: "Please install Petra wallet",
        variant: "destructive",
      });
      window.open("https://petra.app/", "_blank");
      return;
    }
    
    // Standard wallet connection flow
    try {
      // Connect to wallet
      const response = await window.aptos.connect();
      const account = response.address;
      
      // Check if on correct network
      const network = await window.aptos.network();
      console.log("Connected to network:", network);
      
      // Fix for network detection - check for both "testnet" and "Testnet"
      const networkMatch = network.toLowerCase() === NETWORK.toLowerCase();
      if (!networkMatch) {
        toast({
          title: "Wrong Network",
          description: `Please switch to Aptos ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)} in your wallet settings.`,
          variant: "destructive",
        });
        return;
      }
      
      onConnect(account);
      
      // Initialize the wallet if needed
      await initializeWallet();
      
      toast({
        title: "Wallet Connected",
        description: `Connected to Aptos ${NETWORK}!`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to your wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    if (window.aptos) {
      window.aptos.disconnect();
      onConnect("");
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
        variant: "default",
      });
    }
  };

  return {
    connectWallet,
    disconnectWallet
  };
}
