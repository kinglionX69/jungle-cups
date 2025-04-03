
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
    console.log("Starting wallet connection process");
    
    // Case 1: Already in Petra mobile browser
    if (isInPetraMobileBrowser()) {
      console.log("In Petra mobile browser, connecting directly");
      
      try {
        // Check if the Petra wallet object is available
        if (!window.aptos) {
          console.error("Petra wallet object not found in Petra browser");
          toast({
            title: "Connection Error",
            description: "Cannot find Petra wallet in this browser. Try refreshing the page.",
            variant: "destructive",
          });
          return;
        }
        
        // Connect to wallet
        const response = await window.aptos.connect();
        console.log("Connected to Petra wallet:", response);
        
        if (response && response.address) {
          onConnect(response.address);
          
          toast({
            title: "Wallet Connected",
            description: "Successfully connected to Petra wallet",
          });
        } else {
          console.error("Invalid response from wallet connection:", response);
          toast({
            title: "Connection Failed",
            description: "Invalid response from wallet. Please try again.",
            variant: "destructive",
          });
        }
        return;
      } catch (error) {
        console.error("Error connecting to wallet in Petra browser:", error);
        toast({
          title: "Connection Failed",
          description: "Error connecting to wallet. Please try again or restart the app.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Case 2: Mobile device but not in Petra browser
    if (isMobileDevice() && !isInPetraMobileBrowser()) {
      console.log("On mobile device, redirecting to Petra app");
      
      toast({
        title: "Opening Petra Wallet",
        description: "Redirecting to the Petra mobile app...",
      });
      
      // Redirect to Petra mobile app
      redirectToPetraMobile();
      return;
    }
    
    // Case 3: Desktop device
    console.log("On desktop, checking for Petra extension");
    
    if (!window.aptos) {
      console.log("Petra extension not found on desktop");
      toast({
        title: "Wallet Not Found",
        description: "Please install Petra wallet extension",
        variant: "destructive",
      });
      window.open("https://petra.app/", "_blank");
      return;
    }
    
    // Standard desktop connection flow
    try {
      console.log("Connecting to Petra extension on desktop");
      
      // Connect to wallet
      const response = await window.aptos.connect();
      console.log("Desktop connection response:", response);
      
      if (!response || !response.address) {
        console.error("Invalid response from wallet:", response);
        toast({
          title: "Connection Failed",
          description: "Invalid response from wallet. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const account = response.address;
      
      // Check if on correct network
      const network = await window.aptos.network();
      console.log("Connected to network:", network);
      
      // Network check - case insensitive
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
      
      // Initialize the wallet
      await initializeWallet();
      
      toast({
        title: "Wallet Connected",
        description: `Connected to Aptos ${NETWORK}!`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error connecting wallet on desktop:", error);
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
