
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import WalletNotInstalled from "@/components/wallet/WalletNotInstalled";
import WalletConnected from "@/components/wallet/WalletConnected";

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
    getTestnetTokens
  } = useWalletConnection({
    onConnect,
    walletAddress
  });

  // Mobile-specific UI adjustments
  const buttonClasses = isMobile ? "w-full justify-center py-3 text-base" : "";

  if (!isInstalled) {
    return <WalletNotInstalled onClick={connectWallet} />;
  }

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

  return (
    <Button 
      className={`jungle-btn ${buttonClasses}`} 
      onClick={connectWallet}
    >
      {isMobile && <Smartphone className="mr-2 h-5 w-5" />}
      Connect Wallet
    </Button>
  );
};

export default WalletConnect;
