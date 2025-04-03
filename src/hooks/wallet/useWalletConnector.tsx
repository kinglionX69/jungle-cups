
import { useState } from "react";
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
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    // Prevent multiple connection attempts
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      console.log("Starting wallet connection process");
      
      // Case 1: Already in Petra mobile browser
      if (isInPetraMobileBrowser()) {
        console.log("In Petra mobile browser, connecting directly");
        
        try {
          // Check if wallet object exists
          if (!window.aptos) {
            throw new Error("Wallet object not found in Petra browser");
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
            throw new Error("Invalid response from wallet");
          }
        } catch (error) {
          console.error("Error connecting in Petra browser:", error);
          toast({
            title: "Connection Failed",
            description: "Error connecting to wallet. Please try again or restart the app.",
            variant: "destructive",
          });
        }
        return;
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
      
      // Case 3: Desktop device - connect to extension
      console.log("On desktop, connecting to extension");
      
      if (!window.aptos) {
        console.log("Petra extension not found");
        toast({
          title: "Wallet Not Found",
          description: "Please install Petra wallet extension",
          variant: "destructive",
        });
        window.open("https://petra.app/", "_blank");
        return;
      }
      
      // Connect to extension
      const response = await window.aptos.connect();
      console.log("Extension connection response:", response);
      
      if (!response || !response.address) {
        throw new Error("Invalid response from wallet extension");
      }
      
      // Check network
      const network = await window.aptos.network();
      console.log("Connected to network:", network);
      
      const networkMatch = network.toLowerCase() === NETWORK.toLowerCase();
      if (!networkMatch) {
        toast({
          title: "Wrong Network",
          description: `Please switch to Aptos ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)} in your wallet settings.`,
          variant: "destructive",
        });
        return;
      }
      
      // Everything is good, connect!
      onConnect(response.address);
      await initializeWallet();
      
      toast({
        title: "Wallet Connected",
        description: `Connected to Aptos ${NETWORK}!`,
      });
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (window.aptos) {
      window.aptos.disconnect();
      onConnect("");
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    isConnecting
  };
}
