
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerStats } from "@/types/gameTypes";
import { DEFAULT_STATS } from "./usePlayerStatsTypes";

export const useStatsLoader = () => {
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Load stats from database
  const loadStats = async (address: string) => {
    if (!address) {
      setStats(DEFAULT_STATS);
      return;
    }
    
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
  
  return {
    stats,
    setStats,
    isLoading,
    loadStats
  };
};
