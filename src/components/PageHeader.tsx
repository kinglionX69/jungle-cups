
import Logo from "@/components/Logo";
import WalletConnect from "@/components/WalletConnect";
import WalletInfoPanel from "@/components/wallet/WalletInfoPanel";
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageHeaderProps {
  onConnect: (wallet: string) => void;
  connected: boolean;
  walletAddress: string;
}

const PageHeader = ({
  onConnect,
  connected,
  walletAddress
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  const toggleWalletInfo = () => {
    setShowWalletInfo(!showWalletInfo);
  };

  return (
    <header className="max-w-7xl mx-auto mb-6 flex flex-col backdrop-blur-sm bg-white/30 p-4 rounded-lg border border-jungle-green/30">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <Logo />
          <p className="text-jungle-darkGreen font-bungee ml-1 mx-0 my-[16px] text-shadow">Find the ball, win the prize!</p>
        </div>
        
        <div className="flex gap-2 items-center">
          {connected && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center border-jungle-green"
              onClick={toggleWalletInfo}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isMobile ? "" : "Wallet Info"}
            </Button>
          )}
          
          <WalletConnect 
            onConnect={onConnect} 
            connected={connected} 
            walletAddress={walletAddress} 
          />
        </div>
      </div>
      
      {connected && showWalletInfo && (
        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-jungle-green/20">
          <WalletInfoPanel
            walletAddress={walletAddress}
            onConnect={onConnect}
          />
        </div>
      )}
    </header>
  );
};

export default PageHeader;
