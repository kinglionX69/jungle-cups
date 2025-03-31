
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders, handleCors } from "./cors.ts";
import { handleWithdrawalTransaction } from "./withdrawalHandler.ts";
import { handlePayoutTransaction } from "./payoutHandler.ts";

// Serve the function
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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

      // Process the withdrawal transaction
      const result = await handleWithdrawalTransaction(
        supabase,
        playerAddress,
        amount,
        tokenType,
        escrowPrivateKey
      );

      return new Response(
        JSON.stringify(result),
        { 
          status: result.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
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

      // Process the payout transaction
      const result = await handlePayoutTransaction(
        supabase,
        playerAddress,
        amount,
        tokenType,
        gameId
      );

      return new Response(
        JSON.stringify(result),
        { 
          status: result.status, 
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
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: "An unexpected error occurred in the edge function." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
