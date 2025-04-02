
import { Button } from "@/components/ui/button";
import { Trophy, Coins } from "lucide-react";
import { NETWORK } from "@/utils/aptosUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WalletConnectedProps {
  walletAddress: string;
  isCorrectNetwork: boolean;
  isInitializing: boolean;
  onGetTestTokens: () => void;
  onDisconnect: () => void;
}

const WalletConnected = ({
  walletAddress,
  isCorrectNetwork,
  isInitializing,
  onGetTestTokens,
  onDisconnect
}: WalletConnectedProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col ${isMobile ? 'w-full gap-2' : 'sm:flex-row gap-2 items-center'}`}>
      <div className={`flex items-center ${isCorrectNetwork ? "bg-jungle-green" : "bg-red-500"} text-white px-4 py-2 rounded-full ${isMobile ? 'w-full justify-center' : ''}`}>
        <Trophy className="mr-2 h-5 w-5" />
        <span className="truncate max-w-[180px]">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
      </div>
      {!isCorrectNetwork ? (
        <span className="text-red-500 text-sm font-bold">Wrong Network!</span>
      ) : (
        <span className="text-xs font-bold text-jungle-green bg-jungle-green/10 px-2 py-1 rounded">
          {NETWORK.toUpperCase()}
        </span>
      )}
      <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
        {isCorrectNetwork && NETWORK === "testnet" && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-2 border-jungle-green ${isMobile ? 'flex-1' : ''}`}
            onClick={onGetTestTokens}
            disabled={isInitializing}
          >
            <Coins className="mr-1 h-4 w-4" /> 
            {isInitializing ? "Initializing..." : "Get Test Tokens"}
          </Button>
        )}
        <Button 
          variant="outline" 
          className={`border-2 border-jungle-orange ${isMobile ? 'flex-1' : ''}`} 
          onClick={onDisconnect}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default WalletConnected;
