
import { useWalletStatus } from "./wallet/useWalletStatus";
import { useWalletInitialization } from "./wallet/useWalletInitialization";
import { useWalletUrlCallback } from "./wallet/useWalletUrlCallback";
import { useTestnetTokens } from "./wallet/useTestnetTokens";
import { useWalletConnector } from "./wallet/useWalletConnector";
import { useState, useEffect } from "react";

interface UseWalletConnectionProps {
  onConnect: (wallet: string) => void;
  walletAddress: string;
}

export function useWalletConnection({ onConnect, walletAddress }: UseWalletConnectionProps) {
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Wallet status - checks if wallet is installed and on correct network
  const { isInstalled, isCorrectNetwork, checkWalletStatus } = useWalletStatus({ 
    walletAddress 
  });
  
  // Wallet initialization - handles setting up the wallet after connection
  const { isInitializing, initializeWallet } = useWalletInitialization({ 
    walletAddress 
  });
  
  // Handle URL callbacks for mobile wallet connections
  useWalletUrlCallback({ 
    onConnect, 
    walletAddress 
  });
  
  // Testnet token functionality
  const { getTestnetTokens, isRequestingTokens } = useTestnetTokens({ 
    walletAddress, 
    initializeWallet 
  });
  
  // Wallet connection and disconnection
  const { connectWallet, disconnectWallet, isConnecting: connectorConnecting } = useWalletConnector({ 
    onConnect, 
    initializeWallet 
  });
  
  // Recheck wallet status when connection changes
  useEffect(() => {
    if (walletAddress) {
      checkWalletStatus();
    }
  }, [walletAddress, checkWalletStatus]);
  
  // Wrapped connect function to handle state
  const handleConnect = async () => {
    if (connecting || connectorConnecting) return;
    
    setConnecting(true);
    setConnectionError(null);
    
    try {
      const success = await connectWallet();
      if (!success) {
        setConnectionError("Could not establish connection to wallet");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionError((error as Error)?.message || "Unknown connection error");
    } finally {
      // Give a small delay before allowing another attempt
      setTimeout(() => {
        setConnecting(false);
      }, 1000);
    }
  };

  return {
    isInstalled,
    isCorrectNetwork,
    isInitializing,
    connectWallet: handleConnect,
    disconnectWallet,
    getTestnetTokens,
    isConnecting: connecting || connectorConnecting,
    isRequestingTokens,
    connectionError,
    checkWalletStatus
  };
}
