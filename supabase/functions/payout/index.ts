
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In a real implementation, this would connect to a wallet service
// that has access to the escrow wallet's private key
const ESCROW_WALLET_ADDRESS = "0x2afbb09094a37b84d14bc9aaf7deb6dd586acc20b0e3ba8c8c5a7cafd9eb5a0d";

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

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // In a real implementation, this would initiate a blockchain transaction
    // using the escrow wallet's private key, which would be securely stored
    // and accessed only by this backend service
    const transactionHash = `sim_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    // Update transaction with hash
    const { error: updateError } = await supabase
      .from('game_transactions')
      .update({
        transaction_hash: transactionHash,
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
        transactionHash: transactionHash
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Payout error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
