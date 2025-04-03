
import { useState, useEffect } from "react";
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

  // Check if Petra wallet is loaded and available
  const isPetraAvailable = () => {
    return typeof window !== 'undefined' && window.aptos !== undefined;
  };

  // Handle connection errors
  const handleConnectionError = (error: any) => {
    console.error("Wallet connection error:", error);
    const errorMessage = error.message || "Unknown error";
    
    let userMessage = "Could not connect to your wallet. Please try again.";
    
    if (errorMessage.includes("User denied")) {
      userMessage = "Connection was rejected. Please approve the connection request in your wallet.";
    } else if (errorMessage.includes("not found") || errorMessage.includes("not installed")) {
      userMessage = "Wallet not detected. Please install Petra wallet.";
    }
    
    toast({
      title: "Connection Failed",
      description: userMessage,
      variant: "destructive",
    });
    
    setIsConnecting(false);
  };

  // Connect to wallet
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
          // Ensure the wallet interface is available
          if (!isPetraAvailable()) {
            // Wait a short time for the wallet interface to initialize if needed
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (!isPetraAvailable()) {
              throw new Error("Wallet interface not available in Petra browser");
            }
          }
          
          // Connect to wallet
          const response = await window.aptos.connect();
          console.log("Connected to Petra mobile wallet:", response);
          
          if (response && response.address) {
            onConnect(response.address);
            
            toast({
              title: "Wallet Connected",
              description: "Successfully connected to Petra wallet",
            });
            
            await initializeWallet();
            return true;
          } else {
            throw new Error("Invalid response from wallet");
          }
        } catch (error) {
          console.error("Error connecting in Petra browser:", error);
          handleConnectionError(error);
          return false;
        }
      }
      
      // Case 2: Mobile device but not in Petra browser
      if (isMobileDevice() && !isInPetraMobileBrowser()) {
        console.log("On mobile device, redirecting to Petra app");
        
        toast({
          title: "Opening Petra Wallet",
          description: "Redirecting to the Petra mobile app...",
        });
        
        // Redirect to Petra mobile app with deep link
        redirectToPetraMobile();
        setIsConnecting(false);
        return false;
      }
      
      // Case 3: Desktop device - connect to extension
      console.log("On desktop, connecting to extension");
      
      if (!isPetraAvailable()) {
        console.log("Petra extension not found");
        toast({
          title: "Wallet Not Found",
          description: "Please install Petra wallet extension",
          variant: "destructive",
        });
        window.open("https://petra.app/", "_blank");
        setIsConnecting(false);
        return false;
      }
      
      // Connect to extension with error handling
      try {
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
          setIsConnecting(false);
          return false;
        }
        
        // Everything is good, connect!
        onConnect(response.address);
        await initializeWallet();
        
        toast({
          title: "Wallet Connected",
          description: `Connected to Aptos ${NETWORK}!`,
        });
        
        return true;
      } catch (error) {
        handleConnectionError(error);
        return false;
      }
    } catch (error) {
      handleConnectionError(error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (isPetraAvailable()) {
      try {
        window.aptos.disconnect();
        onConnect("");
        
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
      }
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    isConnecting
  };
}
