
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAptosWallet } from "@/hooks/useAptosWallet";
import WalletConnected from "@/components/wallet/WalletConnected";
import { useEffect } from "react";

interface WalletConnectProps {
  onConnect: (wallet: string) => void;
  connected: boolean;
  walletAddress: string;
}

const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const isMobile = useIsMobile();
  
  const {
    isCorrectNetwork,
    isConnecting,
    connectWallet,
    disconnectWallet,
    walletAddress,
    connected
  } = useAptosWallet();

  // Update the parent component when connection status changes
  useEffect(() => {
    if (connected && walletAddress) {
      // Convert AccountAddress to string if needed
      const addressString = typeof walletAddress === 'string' 
        ? walletAddress 
        : walletAddress.toString();
      onConnect(addressString);
    } else if (!connected) {
      onConnect("");
    }
  }, [connected, walletAddress, onConnect]);

  // Button styling based on device
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  // If connected, show wallet info
  if (connected) {
    // Convert AccountAddress to string if needed
    const addressString = typeof walletAddress === 'string' 
      ? walletAddress 
      : walletAddress.toString();
      
    return (
      <WalletConnected
        walletAddress={addressString}
        isCorrectNetwork={isCorrectNetwork}
        isInitializing={false}
        onGetTestTokens={() => window.open("https://aptoslabs.com/testnet-faucet", "_blank")}
        onDisconnect={disconnectWallet}
        isRequestingTokens={false}
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
