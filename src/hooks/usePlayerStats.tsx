import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerStats } from "@/types/gameTypes";
import { withdrawWinnings } from "@/utils/aptosUtils";

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
  const [isWithdrawing, setIsWithdrawing] = useState(false);
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
  
  // Withdraw winnings to player's wallet
  const withdrawFunds = async (amount: number, tokenType: string) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }
    
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsWithdrawing(true);
      
      // Check if player has enough balance
      const currentBalance = tokenType === "APT" ? stats.aptWon : stats.emojiWon;
      if (currentBalance < amount) {
        toast({
          title: "Insufficient Balance",
          description: `You only have ${currentBalance} ${tokenType} available to withdraw`,
          variant: "destructive",
        });
        return false;
      }
      
      // Call the withdraw function from aptosUtils
      const success = await withdrawWinnings(amount, tokenType);
      
      if (success) {
        // Update local stats (the actual DB update happens in the edge function)
        const newStats = { ...stats };
        if (tokenType === "APT") {
          newStats.aptWon -= amount;
        } else {
          newStats.emojiWon -= amount;
        }
        
        setStats(newStats);
        
        toast({
          title: "Withdrawal Successful",
          description: `${amount} ${tokenType} has been sent to your wallet`,
        });
        
        return true;
      } else {
        toast({
          title: "Withdrawal Failed",
          description: "There was an error processing your withdrawal. Please try again later.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast({
        title: "Withdrawal Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  return {
    stats,
    isLoading,
    isWithdrawing,
    loadStats,
    updateStats,
    addReferral,
    withdrawFunds
  };
};
