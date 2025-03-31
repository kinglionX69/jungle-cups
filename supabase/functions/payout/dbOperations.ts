
// Update transaction status in database
export const updateTransactionStatus = async (
  supabase: any,
  transactionId: string,
  status: string,
  hash?: string
) => {
  const updateData: any = { status };
  if (hash) {
    updateData.transaction_hash = hash;
  }

  const { error } = await supabase
    .from('game_transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (error) {
    console.error("Error updating transaction:", error);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }
  
  return { success: true };
};

// Update player balance after successful withdrawal
export const updatePlayerBalance = async (
  supabase: any,
  playerAddress: string,
  tokenType: string,
  currentBalance: number,
  withdrawalAmount: number
) => {
  const updateField = tokenType === "APT" ? "apt_won" : "emoji_won";
  
  const { error } = await supabase
    .from('player_stats')
    .update({
      [updateField]: currentBalance - withdrawalAmount
    })
    .eq('wallet_address', playerAddress);

  if (error) {
    console.error("Error updating player stats:", error);
    throw new Error(`Failed to update player stats: ${error.message}`);
  }
  
  return { success: true };
};

// Check if the player has enough balance to withdraw
export const verifyPlayerBalance = async (
  supabase: any,
  playerAddress: string,
  amount: number,
  tokenType: string
) => {
  const { data: stats, error: statsError } = await supabase
    .from('player_stats')
    .select('apt_won, emoji_won')
    .eq('wallet_address', playerAddress)
    .single();

  if (statsError) {
    console.error("Error fetching player stats:", statsError);
    throw new Error("Could not verify player balance");
  }

  // Check available balance
  let availableBalance = 0;
  if (tokenType === "APT") {
    availableBalance = stats.apt_won;
  } else if (tokenType === "EMOJICOIN") {
    availableBalance = stats.emoji_won;
  }

  if (availableBalance < amount) {
    throw new Error("Insufficient balance");
  }
  
  return { availableBalance, stats };
};

// Create initial transaction record
export const createTransactionRecord = async (
  supabase: any,
  playerAddress: string,
  amount: number,
  tokenType: string,
  withdrawalId: string
) => {
  const { data, error } = await supabase
    .from('game_transactions')
    .insert({
      player_address: playerAddress,
      amount: amount,
      token_type: tokenType,
      game_id: withdrawalId,
      status: 'processing'
    })
    .select()
    .single();

  if (error) {
    console.error("Database error:", error);
    throw new Error("Database error when creating transaction");
  }
  
  return data;
};
