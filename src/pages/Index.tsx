import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import WelcomeScreen from "@/components/WelcomeScreen";
import Game from "@/components/Game";
import StatsCard from "@/components/StatsCard";
import ReferralCard from "@/components/ReferralCard";
import { useToast } from "@/components/ui/use-toast";

import {
  checkEscrowFunding,
  getPlayerStats,
  getLeaderboardData,
  getReferralFromUrl,
  trackReferral,
} from "@/utils/aptosUtils";

const Index = () => {
  const { toast } = useToast();
  
  // Wallet and connection states
  const [walletAddress, setWalletAddress] = useState("");
  const [isEscrowFunded, setIsEscrowFunded] = useState(true);
  
  // Player data
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    aptWon: 0,
    emojiWon: 0,
    referrals: 0,
  });
  
  // Leaderboard data - keeping this state for later reintegration
  const [leaderboardData, setLeaderboardData] = useState({
    aptLeaders: [],
    emojiLeaders: [],
  });
  
  // Check escrow funding status on load and periodically
  useEffect(() => {
    const checkEscrowStatus = async () => {
      const isFunded = await checkEscrowFunding();
      setIsEscrowFunded(isFunded);
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
      // Check for referral code
      const referralAddress = getReferralFromUrl();
      if (referralAddress && referralAddress !== address) {
        await trackReferral(address, referralAddress);
        toast({
          title: "Referral Detected",
          description: "You've been referred by another player!",
        });
      }
      
      await updatePlayerStats(address);
      
      // Load leaderboard data (keeping this for later reintegration)
      const leaderboard = await getLeaderboardData();
      if (leaderboard) {
        setLeaderboardData(leaderboard);
      }
    }
  };
  
  // Update player stats
  const updatePlayerStats = async (address: string) => {
    const stats = await getPlayerStats(address);
    if (stats) {
      setPlayerStats(stats);
    }
  };

  // Handle game stats update
  const handleStatsUpdated = async () => {
    if (walletAddress) {
      await updatePlayerStats(walletAddress);
    }
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
              />
            </div>
            
            {/* Stats and Referral */}
            <div className="space-y-6">
              <StatsCard stats={playerStats} />
              
              <ReferralCard 
                walletAddress={walletAddress}
                referrals={playerStats.referrals}
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
