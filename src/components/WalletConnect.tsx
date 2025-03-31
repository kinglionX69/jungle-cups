
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WalletConnectProps {
  onConnect: (wallet: string) => void;
  connected: boolean;
  walletAddress: string;
}

const WalletConnect = ({ onConnect, connected, walletAddress }: WalletConnectProps) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Petra wallet is installed
    const checkWallet = async () => {
      if (window.aptos) {
        setIsInstalled(true);
      } else {
        setIsInstalled(false);
      }
    };

    checkWallet();
    window.addEventListener("load", checkWallet);
    
    return () => window.removeEventListener("load", checkWallet);
  }, []);

  const connectWallet = async () => {
    if (!window.aptos) {
      toast({
        title: "Wallet Not Found",
        description: "Please install Petra wallet extension",
        variant: "destructive",
      });
      window.open("https://petra.app/", "_blank");
      return;
    }
    
    try {
      const response = await window.aptos.connect();
      const account = response.address;
      onConnect(account);
      
      toast({
        title: "Wallet Connected",
        description: "You've successfully connected your wallet!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to your wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    if (window.aptos) {
      window.aptos.disconnect();
      onConnect("");
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
        variant: "default",
      });
    }
  };

  if (!isInstalled) {
    return (
      <Button className="jungle-btn" onClick={() => window.open("https://petra.app/", "_blank")}>
        Install Petra Wallet
      </Button>
    );
  }

  if (connected) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="flex items-center bg-jungle-green text-white px-4 py-2 rounded-full">
          <Trophy className="mr-2 h-5 w-5" />
          <span className="truncate max-w-[180px]">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
        </div>
        <Button variant="outline" className="border-2 border-jungle-orange" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button className="jungle-btn" onClick={connectWallet}>
      Connect Wallet
    </Button>
  );
};

export default WalletConnect;
