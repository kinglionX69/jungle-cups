
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Coins } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NETWORK, NODE_URL, requestTestnetTokens } from "@/utils/aptosUtils";

interface WalletConnectProps {
  onConnect: (wallet: string) => void;
  connected: boolean;
  walletAddress: string;
}

const WalletConnect = ({ onConnect, connected, walletAddress }: WalletConnectProps) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Petra wallet is installed
    const checkWallet = async () => {
      if (window.aptos) {
        setIsInstalled(true);
        
        // Check if on testnet
        if (connected) {
          try {
            const network = await window.aptos.network();
            console.log("Current wallet network:", network);
            
            // Fix for network detection - check for both "testnet" and "Testnet"
            const networkMatch = network.toLowerCase() === NETWORK.toLowerCase();
            setIsCorrectNetwork(networkMatch);
            
            if (!networkMatch) {
              toast({
                title: "Wrong Network",
                description: `Please switch to Aptos ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)} in your wallet.`,
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error checking network:", error);
          }
        }
      } else {
        setIsInstalled(false);
      }
    };

    checkWallet();
    window.addEventListener("load", checkWallet);
    
    return () => window.removeEventListener("load", checkWallet);
  }, [connected, toast]);

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
      // Connect to wallet
      const response = await window.aptos.connect();
      const account = response.address;
      
      // Check if on correct network
      const network = await window.aptos.network();
      console.log("Connected to network:", network);
      
      // Fix for network detection - check for both "testnet" and "Testnet"
      const networkMatch = network.toLowerCase() === NETWORK.toLowerCase();
      if (!networkMatch) {
        toast({
          title: "Wrong Network",
          description: `Please switch to Aptos ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)} in your wallet settings.`,
          variant: "destructive",
        });
        setIsCorrectNetwork(false);
        return;
      }
      
      setIsCorrectNetwork(true);
      onConnect(account);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to Aptos ${NETWORK}!`,
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
  
  const getTestnetTokens = async () => {
    if (!walletAddress) return;
    
    toast({
      title: "Requesting Tokens",
      description: "Requesting testnet tokens. Please wait...",
    });
    
    const success = await requestTestnetTokens(walletAddress);
    
    if (success) {
      toast({
        title: "Success",
        description: "Testnet tokens have been requested. They should arrive shortly.",
      });
    } else {
      toast({
        title: "Request Failed",
        description: "Failed to request testnet tokens. Please try again later.",
        variant: "destructive",
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
        <div className={`flex items-center ${isCorrectNetwork ? "bg-jungle-green" : "bg-red-500"} text-white px-4 py-2 rounded-full`}>
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
        <div className="flex gap-2">
          {isCorrectNetwork && NETWORK === "testnet" && (
            <Button variant="outline" size="sm" className="border-2 border-jungle-green" onClick={getTestnetTokens}>
              <Coins className="mr-1 h-4 w-4" /> Get Test Tokens
            </Button>
          )}
          <Button variant="outline" className="border-2 border-jungle-orange" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button className="jungle-btn" onClick={connectWallet}>
      Connect Wallet to {NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)}
    </Button>
  );
};

export default WalletConnect;
