
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from "https://esm.sh/aptos@1.20.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Network settings
const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const NETWORK = "testnet";

// Token settings
const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the escrow wallet private key from secrets
    const escrowPrivateKey = Deno.env.get("ESCROW_PRIVATE_KEY");
    if (!escrowPrivateKey) {
      throw new Error("Escrow private key not configured");
    }

    // Initialize Aptos client
    const client = new AptosClient(NODE_URL);

    // Parse request URL to determine operation type
    const url = new URL(req.url);
    const operation = url.pathname.split('/').pop();

    // Handle withdrawal requests
    if (operation === "withdraw" && req.method === "POST") {
      // Parse request body
      const { playerAddress, amount, tokenType } = await req.json();

      // Validate request data
      if (!playerAddress || !amount || !tokenType) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log the withdrawal request
      console.log(`Processing withdrawal: ${amount} ${tokenType} to ${playerAddress}`);

      // Check if the player has enough balance to withdraw
      const { data: stats, error: statsError } = await supabase
        .from('player_stats')
        .select('apt_won, emoji_won')
        .eq('wallet_address', playerAddress)
        .single();

      if (statsError) {
        console.error("Error fetching player stats:", statsError);
        return new Response(
          JSON.stringify({ success: false, error: "Could not verify player balance" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check available balance
      let availableBalance = 0;
      if (tokenType === "APT") {
        availableBalance = stats.apt_won;
      } else if (tokenType === "EMOJICOIN") {
        availableBalance = stats.emoji_won;
      }

      if (availableBalance < amount) {
        return new Response(
          JSON.stringify({ success: false, error: "Insufficient balance" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate a unique withdrawal ID
      const withdrawalId = `withdrawal_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

      // Save transaction to database
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
        return new Response(
          JSON.stringify({ success: false, error: "Database error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        // Process the blockchain transaction
        const transactionResult = await processBlockchainTransaction(
          client, 
          escrowPrivateKey, 
          playerAddress, 
          amount, 
          tokenType
        );

        // Update the player's stats to reduce their balance
        const updateField = tokenType === "APT" ? "apt_won" : "emoji_won";
        const { error: updateError } = await supabase
          .from('player_stats')
          .update({
            [updateField]: availableBalance - amount
          })
          .eq('wallet_address', playerAddress);

        if (updateError) {
          console.error("Error updating player stats:", updateError);
        }

        // Update transaction with hash
        const { error: updateTxError } = await supabase
          .from('game_transactions')
          .update({
            transaction_hash: transactionResult.hash,
            status: 'completed'
          })
          .eq('id', data.id);

        if (updateTxError) {
          console.error("Error updating transaction:", updateTxError);
        }

        // Return success response
        return new Response(
          JSON.stringify({
            success: true,
            message: `Successfully processed withdrawal of ${amount} ${tokenType} to ${playerAddress}`,
            transactionHash: transactionResult.hash
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (txError) {
        console.error("Transaction error:", txError);
        
        // Update transaction status to failed
        await supabase
          .from('game_transactions')
          .update({
            status: 'failed',
            transaction_hash: `error: ${txError.message}`
          })
          .eq('id', data.id);

        return new Response(
          JSON.stringify({ success: false, error: `Transaction failed: ${txError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Handle payout requests (original functionality)
    else if (req.method === "POST") {
      // Parse request body
      const { playerAddress, amount, tokenType, gameId } = await req.json();

      // Validate request data
      if (!playerAddress || !amount || !tokenType || !gameId) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log the payout request
      console.log(`Processing payout: ${amount} ${tokenType} to ${playerAddress} for game ${gameId}`);

      // Save transaction to database
      const { data, error } = await supabase
        .from('game_transactions')
        .insert({
          player_address: playerAddress,
          amount: amount,
          token_type: tokenType,
          game_id: gameId,
          status: 'processing'
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Database error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        // Process the blockchain transaction
        const transactionResult = await processBlockchainTransaction(
          client, 
          escrowPrivateKey, 
          playerAddress, 
          amount, 
          tokenType
        );
        
        // Update player stats
        const { data: existingStats, error: statsQueryError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('wallet_address', playerAddress)
          .maybeSingle();

        if (statsQueryError) {
          console.error("Error fetching player stats:", statsQueryError);
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
          }
        }

        // Update transaction with hash
        const { error: updateError } = await supabase
          .from('game_transactions')
          .update({
            transaction_hash: transactionResult.hash,
            status: 'completed'
          })
          .eq('id', data.id);

        if (updateError) {
          console.error("Error updating transaction:", updateError);
        }

        // Return success response
        return new Response(
          JSON.stringify({
            success: true,
            message: `Successfully processed payout of ${amount} ${tokenType} to ${playerAddress}`,
            transactionHash: transactionResult.hash
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (txError) {
        console.error("Transaction error:", txError);
        
        // Update transaction status to failed
        await supabase
          .from('game_transactions')
          .update({
            status: 'failed',
            transaction_hash: `error: ${txError.message}`
          })
          .eq('id', data.id);

        return new Response(
          JSON.stringify({ success: false, error: `Transaction failed: ${txError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to process blockchain transactions
async function processBlockchainTransaction(
  client: AptosClient,
  privateKeyHex: string,
  recipientAddress: string,
  amount: number,
  tokenType: string
) {
  try {
    // Create escrow account from private key
    const escrowAccount = AptosAccount.fromAptosAccountObject({
      privateKeyHex: privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex
    });
    
    // Convert amount to the smallest unit (assuming 8 decimals)
    const rawAmount = BigInt(Math.floor(amount * 100000000));
    
    // Prepare the transaction payload based on token type
    let payload;
    
    if (tokenType === "APT") {
      // Native APT transfer
      payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [recipientAddress, rawAmount.toString()]
      };
    } else if (tokenType === "EMOJICOIN") {
      // Emojicoin transfer
      payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: [EMOJICOIN_ADDRESS],
        arguments: [recipientAddress, rawAmount.toString()]
      };
    } else {
      throw new Error(`Unsupported token type: ${tokenType}`);
    }
    
    // Create and sign the transaction
    const rawTxn = await client.generateTransaction(escrowAccount.address(), payload);
    const signedTxn = await client.signTransaction(escrowAccount, rawTxn);
    const pendingTxn = await client.submitTransaction(signedTxn);
    
    // Wait for transaction to be confirmed
    const txnResult = await client.waitForTransactionWithResult(pendingTxn.hash);
    
    return {
      hash: pendingTxn.hash,
      result: txnResult
    };
  } catch (error) {
    console.error("Error in blockchain transaction:", error);
    throw error;
  }
}
