
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerStats } from "@/types/gameTypes";

export const useStatsUpdater = (
  walletAddress: string, 
  stats: PlayerStats, 
  setStats: (stats: PlayerStats) => void
) => {
  const { toast } = useToast();
  
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
    updateStats,
    addReferral
  };
};
