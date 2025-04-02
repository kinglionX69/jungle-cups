import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import WelcomeScreen from "@/components/WelcomeScreen";
import Game from "@/components/Game";
import StatsCard from "@/components/StatsCard";
import ReferralCard from "@/components/ReferralCard";
import { useToast } from "@/components/ui/use-toast";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useReferralSystem } from "@/hooks/useReferralSystem";

import {
  checkEscrowFunding,
  getLeaderboardData,
} from "@/utils/aptosUtils";

const Index = () => {
  const { toast } = useToast();
  
  // Wallet and connection states
  const [walletAddress, setWalletAddress] = useState("");
  const [isEscrowFunded, setIsEscrowFunded] = useState(true);
  
  // Use player stats hook
  const { stats, isLoading, isWithdrawing, updateStats, addReferral, withdrawFunds } = usePlayerStats(walletAddress);
  
  // Use referral system hook
  const { isProcessing } = useReferralSystem(walletAddress);
  
  // Leaderboard data - keeping this state for later reintegration
  const [leaderboardData, setLeaderboardData] = useState({
    aptLeaders: [],
    emojiLeaders: [],
  });
  
  // Check escrow funding status on load and periodically
  useEffect(() => {
    const checkEscrowStatus = async () => {
      const { funded } = await checkEscrowFunding();
      setIsEscrowFunded(funded);
    };
    
    checkEscrowStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkEscrowStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle wallet connection
  const handleWalletConnect = async (address: string) => {
    setWalletAddress(address);
    
    if (address) {
      // Load leaderboard data (keeping this for later reintegration)
      const leaderboard = await getLeaderboardData();
      if (leaderboard) {
        setLeaderboardData(leaderboard);
      }
    }
  };

  // Handle game stats update
  const handleStatsUpdated = async () => {
    // Stats are now automatically updated by our hook system
    console.log("Game stats updated");
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative">
      {/* Header with Logo and Wallet Connection */}
      <PageHeader 
        onConnect={handleWalletConnect}
        connected={!!walletAddress}
        walletAddress={walletAddress}
      />
      
      <main className="max-w-7xl mx-auto">
        {!walletAddress ? (
          <WelcomeScreen onConnect={handleWalletConnect} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-2">
              <Game 
                walletAddress={walletAddress}
                isEscrowFunded={isEscrowFunded}
                onStatsUpdated={handleStatsUpdated}
                updatePlayerStats={updateStats}
              />
            </div>
            
            {/* Stats and Referral */}
            <div className="space-y-6">
              <StatsCard 
                stats={stats} 
                isLoading={isLoading}
                walletAddress={walletAddress}
                withdrawFunds={withdrawFunds}
                isWithdrawing={isWithdrawing}
              />
              
              <ReferralCard 
                walletAddress={walletAddress}
                referrals={stats.referrals}
              />
            </div>
          </div>
        )}
      </main>
      
      <PageFooter />
    </div>
  );
};

export default Index;
