import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import WalletNotInstalled from "@/components/wallet/WalletNotInstalled";
import WalletConnected from "@/components/wallet/WalletConnected";
import { useState } from "react";

interface WalletConnectProps {
  onConnect: (wallet: string) => void;
  connected: boolean;
  walletAddress: string;
}

const WalletConnect = ({ onConnect, connected, walletAddress }: WalletConnectProps) => {
  const isMobile = useIsMobile();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const {
    isInstalled,
    isCorrectNetwork,
    isInitializing,
    connectWallet,
    disconnectWallet,
    getTestnetTokens
  } = useWalletConnection({
    onConnect,
    walletAddress
  });

  // Button styling based on device
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  const handleConnectClick = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    try {
      await connectWallet();
    } finally {
      // Add a short delay before allowing another click
      setTimeout(() => setIsConnecting(false), 1000);
    }
  };

  // If wallet not installed, show installation button
  if (!isInstalled) {
    return <WalletNotInstalled onClick={handleConnectClick} />;
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
      />
    );
  }

  // Otherwise, show connect button
  return (
    <Button 
      className={`jungle-btn ${buttonClasses}`} 
      onClick={handleConnectClick}
      disabled={isConnecting}
    >
      {isMobile && <Smartphone className="mr-2 h-5 w-5" />}
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnect;
