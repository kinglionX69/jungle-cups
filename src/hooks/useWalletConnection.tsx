
import { useWalletStatus } from "./wallet/useWalletStatus";
import { useWalletInitialization } from "./wallet/useWalletInitialization";
import { useWalletUrlCallback } from "./wallet/useWalletUrlCallback";
import { useTestnetTokens } from "./wallet/useTestnetTokens";
import { useWalletConnector } from "./wallet/useWalletConnector";
import { useState } from "react";

interface UseWalletConnectionProps {
  onConnect: (wallet: string) => void;
  walletAddress: string;
}

export function useWalletConnection({ onConnect, walletAddress }: UseWalletConnectionProps) {
  const [connecting, setConnecting] = useState(false);
  
  // Wallet status - checks if wallet is installed and on correct network
  const { isInstalled, isCorrectNetwork } = useWalletStatus({ 
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
  const { getTestnetTokens } = useTestnetTokens({ 
    walletAddress, 
    initializeWallet 
  });
  
  // Wallet connection and disconnection
  const { connectWallet, disconnectWallet, isConnecting } = useWalletConnector({ 
    onConnect, 
    initializeWallet 
  });
  
  // Wrapped connect function to handle state
  const handleConnect = async () => {
    if (connecting || isConnecting) return;
    setConnecting(true);
    try {
      await connectWallet();
    } finally {
      setConnecting(false);
    }
  };

  return {
    isInstalled,
    isCorrectNetwork,
    isInitializing,
    connectWallet: handleConnect,
    disconnectWallet,
    getTestnetTokens,
    isConnecting: connecting || isConnecting
  };
}
