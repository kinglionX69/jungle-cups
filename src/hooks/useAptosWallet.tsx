
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NETWORK } from "@/utils/aptosConfig";

export function useAptosWallet() {
  const { 
    connect, 
    disconnect, 
    account, 
    connected, 
    network,
    wallet,
    signAndSubmitTransaction
  } = useWallet();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const { toast } = useToast();

  // Check if we're on the correct network
  useEffect(() => {
    if (connected && network) {
      const currentNetwork = network.name.toLowerCase();
      const targetNetwork = NETWORK.toLowerCase();
      setIsCorrectNetwork(currentNetwork === targetNetwork);
      
      if (currentNetwork !== targetNetwork) {
        toast({
          title: "Wrong Network",
          description: `Please switch to ${NETWORK} network in your wallet settings`,
          variant: "destructive"
        });
      }
    }
  }, [connected, network, toast]);

  // Connect to wallet with error handling
  const connectWallet = useCallback(async () => {
    if (isConnecting || connected) return false;
    
    try {
      setIsConnecting(true);
      
      await connect("Petra");
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
      
      return true;
    } catch (error) {
      console.error("🔧 WALLET: Connection error:", error);
      
      let errorMessage = "Could not connect to wallet. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Connection rejected. Please approve the connection request.";
        } else if (error.message.includes("not found") || error.message.includes("not installed")) {
          errorMessage = "Petra wallet not detected. Please install it.";
          window.open("https://petra.app/", "_blank");
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connected, isConnecting, toast]);

  // Disconnect from wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
      
      return true;
    } catch (error) {
      console.error("🔧 WALLET: Disconnection error:", error);
      return false;
    }
  }, [disconnect, toast]);

  // Submit transaction - simplified and direct
  const submitTransaction = useCallback(async (payload: any) => {
    console.log("🔧 WALLET: submitTransaction called with payload:", payload);
    
    if (!connected) {
      console.error("❌ WALLET: Wallet not connected");
      throw new Error("Wallet not connected");
    }
    
    if (!account?.address) {
      console.error("❌ WALLET: No account address");
      throw new Error("No wallet address available");
    }

    if (!signAndSubmitTransaction) {
      console.error("❌ WALLET: signAndSubmitTransaction not available");
      throw new Error("Transaction function not available");
    }

    if (!isCorrectNetwork) {
      console.error("❌ WALLET: Wrong network");
      throw new Error("Please switch to the correct network");
    }

    try {
      console.log("📤 WALLET: Submitting transaction to wallet...");
      console.log("📤 WALLET: Account address:", account.address);
      console.log("📤 WALLET: Payload:", JSON.stringify(payload, null, 2));
      
      // Call the wallet adapter directly - this should trigger the popup
      const result = await signAndSubmitTransaction(payload);
      
      console.log("✅ WALLET: Transaction result:", result);
      return result;
    } catch (error) {
      console.error("❌ WALLET: Transaction failed:", error);
      throw error;
    }
  }, [connected, account, signAndSubmitTransaction, isCorrectNetwork]);

  return {
    account,
    connected,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    submitTransaction,
    isPetraInstalled: () => true,
    wallet: wallet?.name || "",
    walletAddress: account?.address?.toString() || ""
  };
}
