
import { useState } from "react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Coins, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface WalletBalanceProps {
  walletAddress: string;
  isCorrectNetwork: boolean;
}

const WalletBalance = ({ walletAddress, isCorrectNetwork }: WalletBalanceProps) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    aptBalance, 
    emojiBalance, 
    isLoading, 
    refetch 
  } = useWalletBalance({ 
    walletAddress, 
    isCorrectNetwork 
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500); // Give UI time to show spinner
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <Card className={`wallet-balance-card bg-white/80 backdrop-blur-sm ${isMobile ? 'w-full' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-jungle-darkGreen">Wallet Balance</CardTitle>
            <CardDescription>Current tokens in your wallet</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading || !isCorrectNetwork}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh balances</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isCorrectNetwork ? (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md mb-2">
            Please switch to the correct network to view your balances.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-jungle-lightGreen/20 rounded-md">
              <div className="flex items-center gap-2">
                <div className="bg-jungle-green/20 p-1.5 rounded-full">
                  <Coins className="h-4 w-4 text-jungle-green" />
                </div>
                <span className="font-medium">APT</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <span className="font-bold">{aptBalance.toFixed(4)}</span>
              )}
            </div>
            
            <div className="flex justify-between items-center p-2 bg-jungle-yellow/10 rounded-md">
              <div className="flex items-center gap-2">
                <div className="bg-jungle-yellow/20 p-1.5 rounded-full">
                  <span className="text-sm">🦁♥️</span>
                </div>
                <span className="font-medium">EMOJICOIN</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <span className="font-bold">{emojiBalance.toFixed(2)}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
