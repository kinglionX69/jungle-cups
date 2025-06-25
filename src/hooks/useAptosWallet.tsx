
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

  // Debug wallet adapter state
  useEffect(() => {
    console.log("🔧 WALLET: Wallet adapter state updated:");
    console.log("🔧 WALLET: connected:", connected);
    console.log("🔧 WALLET: account:", account);
    console.log("🔧 WALLET: wallet:", wallet);
    console.log("🔧 WALLET: network:", network);
    console.log("🔧 WALLET: signAndSubmitTransaction available:", typeof signAndSubmitTransaction);
  }, [connected, account, wallet, network, signAndSubmitTransaction]);

  // Check if we're on the correct network
  useEffect(() => {
    if (connected && network) {
      const currentNetwork = network.name.toLowerCase();
      const targetNetwork = NETWORK.toLowerCase();
      setIsCorrectNetwork(currentNetwork === targetNetwork);
      
      console.log("🌐 WALLET: Network check:");
      console.log("🌐 WALLET: Current network:", currentNetwork);
      console.log("🌐 WALLET: Target network:", targetNetwork);
      console.log("🌐 WALLET: Is correct network:", currentNetwork === targetNetwork);
      
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
      console.log("🔧 WALLET: Attempting to connect to Petra...");
      
      await connect("Petra");
      
      console.log("✅ WALLET: Successfully connected to Petra");
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
      console.log("🔧 WALLET: Disconnecting wallet...");
      await disconnect();
      
      console.log("✅ WALLET: Wallet disconnected successfully");
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

  // Submit transaction - simplified and direct with extensive debugging
  const submitTransaction = useCallback(async (payload: any) => {
    console.log("🔧 WALLET: ===============================");
    console.log("🔧 WALLET: submitTransaction called");
    console.log("🔧 WALLET: Payload:", JSON.stringify(payload, null, 2));
    
    // Pre-flight checks with detailed logging
    if (!connected) {
      console.error("❌ WALLET: FAILED - Wallet not connected");
      console.error("❌ WALLET: connected value:", connected);
      throw new Error("Wallet not connected");
    }
    console.log("✅ WALLET: Connection check passed");
    
    if (!account?.address) {
      console.error("❌ WALLET: FAILED - No account address");
      console.error("❌ WALLET: account:", account);
      throw new Error("No wallet address available");
    }
    console.log("✅ WALLET: Account address check passed:", account.address);

    if (!signAndSubmitTransaction) {
      console.error("❌ WALLET: FAILED - signAndSubmitTransaction not available");
      console.error("❌ WALLET: signAndSubmitTransaction type:", typeof signAndSubmitTransaction);
      throw new Error("Transaction function not available");
    }
    console.log("✅ WALLET: signAndSubmitTransaction function available");

    if (!isCorrectNetwork) {
      console.error("❌ WALLET: FAILED - Wrong network");
      console.error("❌ WALLET: isCorrectNetwork:", isCorrectNetwork);
      console.error("❌ WALLET: current network:", network);
      throw new Error("Please switch to the correct network");
    }
    console.log("✅ WALLET: Network check passed");

    try {
      console.log("📤 WALLET: All pre-flight checks passed, submitting transaction...");
      console.log("📤 WALLET: This should trigger Petra wallet popup");
      console.log("📤 WALLET: Account address:", account.address);
      console.log("📤 WALLET: Wallet name:", wallet?.name);
      
      // Call the wallet adapter directly - this should trigger the popup
      const result = await signAndSubmitTransaction(payload);
      
      console.log("✅ WALLET: Transaction completed!");
      console.log("✅ WALLET: Result type:", typeof result);
      console.log("✅ WALLET: Result:", result);
      console.log("✅ WALLET: Result keys:", result ? Object.keys(result) : "null/undefined");
      
      return result;
    } catch (error) {
      console.error("❌ WALLET: Transaction submission failed:");
      console.error("❌ WALLET: Error type:", typeof error);
      console.error("❌ WALLET: Error message:", error?.message);
      console.error("❌ WALLET: Error name:", error?.name);
      console.error("❌ WALLET: Full error:", error);
      throw error;
    }
  }, [connected, account, signAndSubmitTransaction, isCorrectNetwork, wallet, network]);

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
