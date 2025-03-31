
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { 
  AptosClient, 
  AptosAccount, 
  TxnBuilderTypes, 
  BCS,
  HexString
} from "https://esm.sh/aptos@1.20.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Network settings
const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const NETWORK = "testnet";
const EMOJICOIN_ADDRESS = "0x173fcd3fda2c89d4702e3d307d4dcc8358b03d9f36189179d2bddd9585e96e27::coin_factory::Emojicoin";

// Serve the function
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

    // Initialize Aptos client using the newer approach
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
        // Initialize the escrow account using the private key
        const escrowAccount = AptosAccount.fromPrivateKeyHex(escrowPrivateKey);
        console.log("Escrow account initialized:", escrowAccount.address().hex());

        // Construct the transaction payload for transferring tokens
        let payload;
        let rawTxn;
        const amountInOctas = Math.floor(amount * 100000000); // Convert APT to octas (8 decimals)

        if (tokenType === "APT") {
          // Create a transaction payload for APT transfer
          payload = {
            function: "0x1::coin::transfer",
            type_arguments: ["0x1::aptos_coin::AptosCoin"],
            arguments: [playerAddress, amountInOctas.toString()]
          };
        } else {
          // For testing, still use APT but will be replaced with Emojicoin on mainnet
          payload = {
            function: "0x1::coin::transfer",
            type_arguments: ["0x1::aptos_coin::AptosCoin"],
            arguments: [playerAddress, amountInOctas.toString()]
          };
        }

        console.log("Transaction payload created:", payload);

        // Create signed transaction
        const rawTx = await client.generateTransaction(escrowAccount.address(), payload);
        console.log("Transaction generated");

        const signedTx = await client.signTransaction(escrowAccount, rawTx);
        console.log("Transaction signed");

        // Submit transaction
        const transactionRes = await client.submitTransaction(signedTx);
        console.log("Transaction submitted:", transactionRes.hash);
        
        // Check transaction result (can be expanded)
        const txResult = await client.waitForTransaction(transactionRes.hash);
        console.log("Transaction result:", txResult);
        
        // Early fail if the transaction failed
        if (txResult.success === false) {
          throw new Error(`Transaction failed: ${txResult.vm_status}`);
        }

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
          throw new Error(`Failed to update player stats: ${updateError.message}`);
        }

        // Update transaction with hash
        const { error: updateTxError } = await supabase
          .from('game_transactions')
          .update({
            transaction_hash: transactionRes.hash,
            status: 'completed'
          })
          .eq('id', data.id);

        if (updateTxError) {
          console.error("Error updating transaction:", updateTxError);
          throw new Error(`Failed to update transaction: ${updateTxError.message}`);
        }

        // Return success response
        return new Response(
          JSON.stringify({
            success: true,
            message: `Successfully processed withdrawal of ${amount} ${tokenType} to ${playerAddress}`,
            transactionHash: transactionRes.hash
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
    
    // Handle payout requests (when winning a game)
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

      // For payout requests, we just update the database
      // since these are virtual winnings that can be withdrawn later
      
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
        return new Response(
          JSON.stringify({ success: false, error: "Database error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully processed payout of ${amount} ${tokenType} to ${playerAddress}`,
          transactionHash: mockTxHash
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
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
