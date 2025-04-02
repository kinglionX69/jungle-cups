
import WalletBalance from "./WalletBalance";
import TransactionHistory from "./TransactionHistory";
import { useWalletConnection } from "@/hooks/useWalletConnection";

interface WalletInfoPanelProps {
  walletAddress: string;
  onConnect: (wallet: string) => void;
}

const WalletInfoPanel = ({ 
  walletAddress, 
  onConnect 
}: WalletInfoPanelProps) => {
  const { isCorrectNetwork } = useWalletConnection({
    onConnect,
    walletAddress
  });

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="wallet-info-panel">
      <WalletBalance 
        walletAddress={walletAddress} 
        isCorrectNetwork={isCorrectNetwork}
      />
      <TransactionHistory 
        walletAddress={walletAddress} 
        limit={5}
      />
    </div>
  );
};

export default WalletInfoPanel;
