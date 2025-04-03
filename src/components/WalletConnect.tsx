
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import WalletNotInstalled from "@/components/wallet/WalletNotInstalled";
import WalletConnected from "@/components/wallet/WalletConnected";
import { useEffect } from "react";

interface WalletConnectProps {
  onConnect: (wallet: string) => void;
  connected: boolean;
  walletAddress: string;
}

const WalletConnect = ({ onConnect, connected, walletAddress }: WalletConnectProps) => {
  const isMobile = useIsMobile();
  
  const {
    isInstalled,
    isCorrectNetwork,
    isInitializing,
    connectWallet,
    disconnectWallet,
    getTestnetTokens,
    isConnecting,
    isRequestingTokens,
    checkWalletStatus
  } = useWalletConnection({
    onConnect,
    walletAddress
  });

  // Periodically check wallet status when connected
  useEffect(() => {
    if (connected) {
      // Initial check
      checkWalletStatus();
      
      // Check every 15 seconds
      const interval = setInterval(() => {
        checkWalletStatus();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [connected, checkWalletStatus]);

  // Button styling based on device
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  // If wallet not installed, show installation button
  if (!isInstalled) {
    return <WalletNotInstalled onClick={connectWallet} />;
  }

  // If connected, show wallet info
  if (connected) {
    return (
      <WalletConnected
        walletAddress={walletAddress}
        isCorrectNetwork={isCorrectNetwork}
        isInitializing={isInitializing}
        onGetTestTokens={getTestnetTokens}
        onDisconnect={disconnectWallet}
        isRequestingTokens={isRequestingTokens}
      />
    );
  }

  // Otherwise, show connect button
  return (
    <Button 
      className={`jungle-btn ${buttonClasses}`} 
      onClick={connectWallet}
      disabled={isConnecting}
    >
      {isMobile && <Smartphone className="mr-2 h-5 w-5" />}
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnect;
