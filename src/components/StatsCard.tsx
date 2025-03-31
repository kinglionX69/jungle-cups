
import { useState } from "react";
import { Trophy, CreditCard, Coins, Activity, PieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import WithdrawFunds from "@/components/WithdrawFunds";
import { PlayerStats } from "@/types/gameTypes";

interface StatsCardProps {
  stats: PlayerStats;
  isLoading: boolean;
  walletAddress?: string;
}

const StatsCard = ({ stats, isLoading, walletAddress = "" }: StatsCardProps) => {
  const [showWithdraw, setShowWithdraw] = useState(false);

  const toggleWithdraw = () => {
    setShowWithdraw(!showWithdraw);
  };

  const handleWithdrawComplete = () => {
    // Hide the withdraw form after successful withdrawal
    setShowWithdraw(false);
  };

  if (isLoading) {
    return (
      <div className="stats-card space-y-4">
        <h2 className="text-xl mb-4">Your Stats</h2>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <h2 className="text-xl mb-4">Your Stats</h2>
      
      <Tabs defaultValue="performance">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-jungle-green" />
              <span className="text-sm">Games Played</span>
            </div>
            <span className="font-bold">{stats.gamesPlayed}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-jungle-yellow" />
              <span className="text-sm">Wins</span>
            </div>
            <span className="font-bold">{stats.wins}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-jungle-green" />
              <span className="text-sm">Win Rate</span>
            </div>
            <span className="font-bold">{stats.winRate}%</span>
          </div>
        </TabsContent>
        
        <TabsContent value="earnings" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-sm">APT Won</span>
            </div>
            <span className="font-bold">{stats.aptWon.toFixed(2)} APT</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Emojicoin Won</span>
            </div>
            <span className="font-bold">{stats.emojiWon.toFixed(0)} EMOJICOIN</span>
          </div>
          
          {walletAddress && (stats.aptWon > 0 || stats.emojiWon > 0) && (
            <div className="pt-2">
              {showWithdraw ? (
                <WithdrawFunds
                  walletAddress={walletAddress}
                  aptBalance={stats.aptWon}
                  emojiBalance={stats.emojiWon}
                  onWithdrawComplete={handleWithdrawComplete}
                />
              ) : (
                <Button 
                  onClick={toggleWithdraw} 
                  className="w-full bg-jungle-green hover:bg-jungle-green/80 text-white"
                >
                  Withdraw Winnings
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsCard;
