
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export const usePlayerStats = (walletAddress: string) => {
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Load stats from database when wallet changes
  useEffect(() => {
    if (walletAddress) {
      loadStats(walletAddress);
    } else {
      setStats(DEFAULT_STATS);
    }
  }, [walletAddress]);
  
  // Load stats from Supabase
  const loadStats = async (address: string) => {
    try {
      setIsLoading(true);
      
      // Query the database for this wallet's stats
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('wallet_address', address)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Map database fields to our interface
        setStats({
          gamesPlayed: data.games_played,
          wins: data.wins,
          losses: data.losses,
          winRate: data.win_rate,
          aptWon: data.apt_won,
          emojiWon: data.emoji_won,
          referrals: data.referrals
        });
      } else {
        // No stats found, create new record
        await createNewPlayerStats(address);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({
        title: "Stats Loading Error",
        description: "Could not load your game stats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create new player stats record
  const createNewPlayerStats = async (address: string) => {
    try {
      const { error } = await supabase
        .from('player_stats')
        .insert([{ wallet_address: address }]);
      
      if (error) throw error;
      
      // Set default stats since we just created a new record
      setStats(DEFAULT_STATS);
    } catch (error) {
      console.error("Error creating player stats:", error);
    }
  };
  
  // Save stats to database
  const saveStats = async (updatedStats: PlayerStats) => {
    if (!walletAddress) return;
    
    try {
      // Update state first for immediate UI feedback
      setStats(updatedStats);
      
      // Then update the database
      const { error } = await supabase
        .from('player_stats')
        .update({
          games_played: updatedStats.gamesPlayed,
          wins: updatedStats.wins,
          losses: updatedStats.losses,
          win_rate: updatedStats.winRate,
          apt_won: updatedStats.aptWon,
          emoji_won: updatedStats.emojiWon,
          referrals: updatedStats.referrals,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);
      
      if (error) throw error;
      
      console.log(`Saved stats for ${walletAddress}`, updatedStats);
    } catch (error) {
      console.error("Error saving stats:", error);
      toast({
        title: "Stats Saving Error",
        description: "Could not save your game stats to the database",
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
    isLoading,
    loadStats,
    updateStats,
    addReferral
  };
};
