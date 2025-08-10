
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerStats } from "@/types/gameTypes";

export const useStatsUpdater = (
  walletAddress: string, 
  stats: PlayerStats, 
  setStats: (stats: PlayerStats) => void
) => {
  const { toast } = useToast();
  
  // Save stats to local state only (server updates via Edge Functions)
  const saveStats = async (updatedStats: PlayerStats): Promise<boolean> => {
    try {
      setStats(updatedStats);
      console.log("Updated local stats", updatedStats);
      return true;
    } catch (error) {
      console.error("Error updating local stats:", error);
      toast({
        title: "Stats Update Error",
        description: "Could not update your local game stats",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Update stats after a game
  const updateStats = async (won: boolean, betAmount: number, tokenType: string): Promise<boolean> => {
    if (!walletAddress) return false;

    // Calculate new stats locally for instant UI feedback
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

    try {
      // 1) Sync counters on the server via Edge Function (no direct client DB writes)
      const { error: statsError } = await supabase.functions.invoke('stats', {
        body: {
          playerAddress: walletAddress,
          gamesDelta: 1,
          winsDelta: won ? 1 : 0,
          lossesDelta: won ? 0 : 1,
        },
      });
      if (statsError) throw statsError;

      // 2) If win, record payout on server (credits virtual balance securely)
      if (won) {
        const { error: payoutError } = await supabase.functions.invoke('payout', {
          body: {
            playerAddress: walletAddress,
            amount: betAmount * 2,
            tokenType,
            gameId: `game-${Date.now()}`,
          },
        });
        if (payoutError) throw payoutError;
      }

      // Update local state
      await saveStats(newStats);
      return true;
    } catch (error) {
      console.error("Error syncing stats/payout:", error);
      toast({
        title: "Sync Error",
        description: "Could not sync your game result. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Track a new referral
  const addReferral = async (referrerAddress: string): Promise<boolean> => {
    if (!walletAddress) return false;
    
    const newStats = { ...stats };
    newStats.referrals += 1;
    
    return await saveStats(newStats);
  };
  
  return {
    updateStats,
    addReferral
  };
};
