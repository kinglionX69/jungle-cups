
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  NETWORK, 
  requestTestnetTokens, 
  initializeAccount 
} from "@/utils/aptosUtils";
import { 
  isMobileDevice, 
  isInPetraMobileBrowser, 
  redirectToPetraMobile 
} from "@/utils/mobileUtils";

interface UseWalletConnectionProps {
  onConnect: (wallet: string) => void;
  walletAddress: string;
}

export function useWalletConnection({ onConnect, walletAddress }: UseWalletConnectionProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Petra wallet is installed
    const checkWallet = async () => {
      if (window.aptos) {
        setIsInstalled(true);
        
        // Check if on testnet
        if (walletAddress) {
          try {
            const network = await window.aptos.network();
            console.log("Current wallet network:", network);
            
            // Fix for network detection - check for both "testnet" and "Testnet"
            const networkMatch = network.toLowerCase() === NETWORK.toLowerCase();
            setIsCorrectNetwork(networkMatch);
            
            if (!networkMatch) {
              toast({
                title: "Wrong Network",
                description: `Please switch to Aptos ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)} in your wallet.`,
                variant: "destructive",
              });
            } else {
              // Initialize account if needed when wallet connects on correct network
              await initializeWallet();
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

  const initializeWallet = async () => {
    if (!walletAddress) return;
    
    try {
      setIsInitializing(true);
      const success = await initializeAccount(walletAddress);
      
      if (success) {
        console.log("Wallet initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const connectWallet = async () => {
    // For mobile devices not in Petra browser, redirect to Petra app
    if (isMobileDevice() && !isInPetraMobileBrowser()) {
      toast({
        title: "Opening Petra Wallet",
        description: "Redirecting you to the Petra mobile app...",
      });
      redirectToPetraMobile();
      return;
    }
    
    if (!window.aptos) {
      toast({
        title: "Wallet Not Found",
        description: "Please install Petra wallet",
        variant: "destructive",
      });
      window.open("https://petra.app/", "_blank");
      return;
    }
    
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
        setIsCorrectNetwork(false);
        return;
      }
      
      setIsCorrectNetwork(true);
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
  
  const getTestnetTokens = async () => {
    if (!walletAddress) return;
    
    toast({
      title: "Requesting Tokens",
      description: "Requesting testnet tokens. Please wait...",
    });
    
    // Check if account is initialized first
    await initializeWallet();
    
    const success = await requestTestnetTokens(walletAddress);
    
    if (success) {
      toast({
        title: "Success",
        description: "Testnet tokens have been requested. Please go to https://aptoslabs.com/testnet-faucet to claim tokens.",
      });
    } else {
      toast({
        title: "Request Failed",
        description: "Failed to initialize account. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return {
    isInstalled,
    isCorrectNetwork,
    isInitializing,
    connectWallet,
    disconnectWallet,
    getTestnetTokens
  };
}
