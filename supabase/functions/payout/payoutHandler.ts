
import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Process payout transactions (when winning a game)
export const handlePayoutTransaction = async (
  supabase: any,
  playerAddress: string, 
  amount: number, 
  tokenType: string,
  gameId: string
) => {
  try {
    // Save transaction to database
    const { data, error } = await supabase
      .from('game_transactions')
      .insert({
        player_address: playerAddress,
        amount: amount,
        token_type: tokenType,
        game_id: gameId,
        status: 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return {
        success: false,
        status: 500,
        error: "Database error" 
      };
    }
      
    // Update player stats
    const { data: existingStats, error: statsQueryError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('wallet_address', playerAddress)
      .maybeSingle();

    if (statsQueryError) {
      console.error("Error fetching player stats:", statsQueryError);
      throw new Error(`Failed to fetch player stats: ${statsQueryError.message}`);
    }
    
    // Update the appropriate token field
    const updateField = tokenType === "APT" ? "apt_won" : "emoji_won";
    const currentAmount = existingStats ? existingStats[updateField] || 0 : 0;
    
    if (existingStats) {
      // Update existing stats
      const { error: updateError } = await supabase
        .from('player_stats')
        .update({
          [updateField]: currentAmount + amount
        })
        .eq('wallet_address', playerAddress);
        
      if (updateError) {
        console.error("Error updating player stats:", updateError);
        throw new Error(`Failed to update player stats: ${updateError.message}`);
      }
    } else {
      // Create new stats record for this player
      const newStats = {
        wallet_address: playerAddress,
        games_played: 1,
        wins: 1,
        losses: 0,
        win_rate: 100,
        apt_won: tokenType === "APT" ? amount : 0,
        emoji_won: tokenType === "EMOJICOIN" ? amount : 0,
        referrals: 0
      };
      
      const { error: insertError } = await supabase
        .from('player_stats')
        .insert(newStats);
        
      if (insertError) {
        console.error("Error creating player stats:", insertError);
        throw new Error(`Failed to create player stats: ${insertError.message}`);
      }
    }

    // Return success response with a mock transaction hash since no actual blockchain
    // transaction occurs when recording winnings
    const mockTxHash = `payout_tx_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    return {
      success: true,
      status: 200,
      message: `Successfully processed payout of ${amount} ${tokenType} to ${playerAddress}`,
      transactionHash: mockTxHash,
      details: "Virtual balance updated. You can withdraw these funds later."
    };
  } catch (error) {
    console.error("Error in handlePayoutTransaction:", error);
    return {
      success: false,
      status: 500,
      error: error.message,
      details: "An unexpected error occurred in the payout process."
    };
  }
};
