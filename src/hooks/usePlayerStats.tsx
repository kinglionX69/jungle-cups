
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

// Define the PlayerStats interface
export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  aptWon: number;
  emojiWon: number;
  referrals: number;
}

// Default stats for new players
const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  aptWon: 0,
  emojiWon: 0,
  referrals: 0,
};

// Key for storing stats in localStorage
const STATS_STORAGE_KEY = "shell-game-player-stats";

export const usePlayerStats = (walletAddress: string) => {
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const { toast } = useToast();
  
  // Load stats from storage when wallet changes
  useEffect(() => {
    if (walletAddress) {
      loadStats(walletAddress);
    } else {
      setStats(DEFAULT_STATS);
    }
  }, [walletAddress]);
  
  // Load stats from localStorage or blockchain
  const loadStats = async (address: string) => {
    try {
      // First check localStorage (for quicker loading)
      const storedStats = localStorage.getItem(`${STATS_STORAGE_KEY}-${address}`);
      
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      } else {
        // If not in localStorage, try to load from blockchain
        // For now, we're using mock data
        const newStats = DEFAULT_STATS;
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({
        title: "Stats Loading Error",
        description: "Could not load your game stats",
        variant: "destructive",
      });
    }
  };
  
  // Save stats to localStorage and blockchain
  const saveStats = async (updatedStats: PlayerStats) => {
    if (!walletAddress) return;
    
    try {
      // Update state
      setStats(updatedStats);
      
      // Save to localStorage
      localStorage.setItem(
        `${STATS_STORAGE_KEY}-${walletAddress}`, 
        JSON.stringify(updatedStats)
      );
      
      // In a real implementation, would also save to blockchain
      // This would involve calling a smart contract function
      console.log(`Saved stats for ${walletAddress}`, updatedStats);
    } catch (error) {
      console.error("Error saving stats:", error);
      toast({
        title: "Stats Saving Error",
        description: "Could not save your game stats",
        variant: "destructive",
      });
    }
  };
  
  // Update stats after a game
  const updateStats = async (won: boolean, betAmount: number, tokenType: string) => {
    if (!walletAddress) return;
    
    // Calculate new stats
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    
    if (won) {
      newStats.wins += 1;
      // When player wins, they get double their bet amount
      if (tokenType === "APT") {
        newStats.aptWon += betAmount * 2;
      } else {
        newStats.emojiWon += betAmount * 2;
      }
    } else {
      newStats.losses += 1;
    }
    
    // Recalculate win rate
    if (newStats.gamesPlayed > 0) {
      newStats.winRate = Math.round((newStats.wins / newStats.gamesPlayed) * 100);
    }
    
    // Save updated stats
    await saveStats(newStats);
    
    return newStats;
  };
  
  // Track a new referral
  const addReferral = async () => {
    if (!walletAddress) return;
    
    const newStats = { ...stats };
    newStats.referrals += 1;
    
    await saveStats(newStats);
    
    return newStats;
  };
  
  return {
    stats,
    loadStats,
    updateStats,
    addReferral
  };
};
