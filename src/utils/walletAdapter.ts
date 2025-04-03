
import { useCallback, useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { NETWORK } from './aptosConfig';

// This is a placeholder for the actual Aptos Wallet Standard package
// In a real implementation, you would install and import from '@aptos-labs/wallet-standard'
type AptosWallet = {
  name: string;
  icon: string;
  features: {
    [key: string]: any;
    "aptos:connect": {
      connect: () => Promise<{ address: string }>;
    };
    "aptos:network": {
      network: () => Promise<string>;
    };
    "aptos:signAndSubmitTransaction": {
      signAndSubmitTransaction: (transaction: any) => Promise<{ hash: string }>;
    };
    "aptos:disconnect": {
      disconnect: () => Promise<void>;
    };
  };
};

// Simulated function to mimic the behavior of getAptosWallets
// In a real implementation, this would come from the actual package
const mockGetAptosWallets = () => {
  const aptosWallets: AptosWallet[] = [
    {
      name: "Petra",
      icon: "petra-icon",
      features: {
        "aptos:connect": {
          connect: async () => {
            // This is just a placeholder that mimics what the actual implementation would do
            // It checks if the global aptos object exists (provided by Petra extension)
            if (typeof window !== 'undefined' && window.aptos) {
              return await window.aptos.connect();
            }
            throw new Error("Petra wallet not installed");
          }
        },
        "aptos:network": {
          network: async () => {
            if (typeof window !== 'undefined' && window.aptos) {
              return await window.aptos.network();
            }
            throw new Error("Petra wallet not installed");
          }
        },
        "aptos:signAndSubmitTransaction": {
          signAndSubmitTransaction: async (transaction) => {
            if (typeof window !== 'undefined' && window.aptos) {
              return await window.aptos.signAndSubmitTransaction(transaction);
            }
            throw new Error("Petra wallet not installed");
          }
        },
        "aptos:disconnect": {
          disconnect: async () => {
            if (typeof window !== 'undefined' && window.aptos) {
              await window.aptos.disconnect();
            }
          }
        }
      }
    }
  ];

  // Mock event listener
  const listeners: { [key: string]: Function[] } = {
    register: [],
    unregister: []
  };

  const on = (event: 'register' | 'unregister', callback: Function) => {
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  };

  return { aptosWallets, on };
};

// This hook would use the actual getAptosWallets in a real implementation
export const useAptosWallets = () => {
  const [wallets, setWallets] = useState<AptosWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<AptosWallet | null>(null);
  const { toast } = useToast();

  const updateWallets = useCallback(() => {
    const { aptosWallets } = mockGetAptosWallets();
    setWallets(aptosWallets);
  }, []);

  useEffect(() => {
    updateWallets();
    
    // In a real implementation, this would use the actual on function
    const { on } = mockGetAptosWallets();
    
    const removeRegisterListener = on("register", updateWallets);
    const removeUnregisterListener = on("unregister", updateWallets);
    
    return () => {
      removeRegisterListener();
      removeUnregisterListener();
    };
  }, [updateWallets]);

  const connectWallet = async (wallet: AptosWallet) => {
    try {
      const response = await wallet.features["aptos:connect"].connect();
      
      // Check if wallet is on the correct network
      const network = await wallet.features["aptos:network"].network();
      const isCorrectNetwork = network.toLowerCase() === NETWORK.toLowerCase();
      
      if (!isCorrectNetwork) {
        toast({
          title: "Wrong Network",
          description: `Please switch to Aptos ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)} in your wallet settings.`,
          variant: "destructive",
        });
        return { success: false, address: "" };
      }
      
      setSelectedWallet(wallet);
      return { success: true, address: response.address };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      
      let errorMessage = "Could not connect to wallet. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("User denied")) {
          errorMessage = "Connection was rejected. Please approve the connection request in your wallet.";
        } else if (error.message.includes("not found") || error.message.includes("not installed")) {
          errorMessage = "Wallet not detected. Please install the wallet.";
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, address: "" };
    }
  };

  const disconnectWallet = async () => {
    if (selectedWallet) {
      try {
        await selectedWallet.features["aptos:disconnect"].disconnect();
        setSelectedWallet(null);
        return true;
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
        return false;
      }
    }
    return true;
  };

  const signAndSubmitTransaction = async (transaction: any) => {
    if (!selectedWallet) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit transactions.",
        variant: "destructive",
      });
      return { success: false };
    }
    
    try {
      const response = await selectedWallet.features["aptos:signAndSubmitTransaction"].signAndSubmitTransaction(transaction);
      return { success: true, hash: response.hash };
    } catch (error) {
      console.error("Transaction error:", error);
      
      let errorMessage = "Transaction failed. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("User denied")) {
          errorMessage = "Transaction was rejected. Please approve the transaction in your wallet.";
        }
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false };
    }
  };

  return {
    wallets,
    selectedWallet,
    connectWallet,
    disconnectWallet,
    signAndSubmitTransaction
  };
};
