
import { supabase } from "@/integrations/supabase/client";

// Admin action to update player stats (for testing or corrections)
export const updatePlayerStats = async (
  walletAddress: string,
  updates: {
    games_played?: number;
    wins?: number;
    losses?: number;
    apt_won?: number;
    emoji_won?: number;
    referrals?: number;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .update({
        ...updates,
        win_rate: updates.games_played ? Math.round((updates.wins || 0) / updates.games_played * 100) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating player stats:", error);
    return { success: false, error };
  }
};

// Admin action to reset player stats
export const resetPlayerStats = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .update({
        games_played: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        apt_won: 0,
        emoji_won: 0,
        referrals: 0,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error resetting player stats:", error);
    return { success: false, error };
  }
};

// Admin action to ban/unban a player
export const togglePlayerBan = async (walletAddress: string, banned: boolean) => {
  try {
    // This would require a banned_players table or a banned field in player_stats
    // For now, we'll use localStorage to track banned players
    const bannedPlayers = JSON.parse(localStorage.getItem('bannedPlayers') || '[]');
    
    if (banned) {
      if (!bannedPlayers.includes(walletAddress)) {
        bannedPlayers.push(walletAddress);
      }
    } else {
      const index = bannedPlayers.indexOf(walletAddress);
      if (index > -1) {
        bannedPlayers.splice(index, 1);
      }
    }
    
    localStorage.setItem('bannedPlayers', JSON.stringify(bannedPlayers));
    return { success: true };
  } catch (error) {
    console.error("Error toggling player ban:", error);
    return { success: false, error };
  }
};

// Check if a player is banned
export const isPlayerBanned = (walletAddress: string): boolean => {
  try {
    const bannedPlayers = JSON.parse(localStorage.getItem('bannedPlayers') || '[]');
    return bannedPlayers.includes(walletAddress);
  } catch (error) {
    console.error("Error checking if player is banned:", error);
    return false;
  }
};

// Admin action to manually process a transaction
export const manuallyProcessTransaction = async (transactionId: string, action: 'complete' | 'fail') => {
  try {
    const { data, error } = await supabase
      .from('game_transactions')
      .update({
        status: action === 'complete' ? 'completed' : 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error manually processing transaction:", error);
    return { success: false, error };
  }
};

// Get system statistics for admin dashboard
export const getSystemStats = async () => {
  try {
    const [playerStatsResult, transactionsResult] = await Promise.all([
      supabase.from('player_stats').select('*'),
      supabase.from('game_transactions').select('*')
    ]);

    const playerStats = playerStatsResult.data || [];
    const transactions = transactionsResult.data || [];

    const stats = {
      totalPlayers: playerStats.length,
      totalGames: playerStats.reduce((sum, player) => sum + player.games_played, 0),
      totalWinnings: playerStats.reduce((sum, player) => sum + player.apt_won + (player.emoji_won * 0.001), 0),
      totalTransactions: transactions.length,
      pendingTransactions: transactions.filter(tx => tx.status === 'pending').length,
      completedTransactions: transactions.filter(tx => tx.status === 'completed').length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length,
      totalVolume: transactions.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting system stats:", error);
    return { success: false, error };
  }
};
