
import { useWalletStatus } from "./wallet/useWalletStatus";
import { useWalletInitialization } from "./wallet/useWalletInitialization";
import { useWalletUrlCallback } from "./wallet/useWalletUrlCallback";
import { useTestnetTokens } from "./wallet/useTestnetTokens";
import { useWalletConnector } from "./wallet/useWalletConnector";

interface UseWalletConnectionProps {
  onConnect: (wallet: string) => void;
  walletAddress: string;
}

export function useWalletConnection({ onConnect, walletAddress }: UseWalletConnectionProps) {
  // Use smaller, focused hooks
  const { isInstalled, isCorrectNetwork } = useWalletStatus({ 
    walletAddress 
  });
  
  const { isInitializing, initializeWallet } = useWalletInitialization({ 
    walletAddress 
  });
  
  // Handle URL callbacks for mobile wallet connections
  useWalletUrlCallback({ 
    onConnect, 
    walletAddress 
  });
  
  const { getTestnetTokens } = useTestnetTokens({ 
    walletAddress, 
    initializeWallet 
  });
  
  const { connectWallet, disconnectWallet } = useWalletConnector({ 
    onConnect, 
    initializeWallet 
  });

  return {
    isInstalled,
    isCorrectNetwork,
    isInitializing,
    connectWallet,
    disconnectWallet,
    getTestnetTokens
  };
}
