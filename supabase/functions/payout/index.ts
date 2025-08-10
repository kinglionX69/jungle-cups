
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

    // Handle test transfer requests (admin/manual testing)
    if (operation === "test" && req.method === "POST") {
      try {
        const { playerAddress, amount = 0.0001, tokenType = "APT" } = await req.json();

        if (!playerAddress) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing playerAddress" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Safety: only allow tiny test amounts and APT
        if (tokenType !== "APT" || amount <= 0 || amount > 0.001) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid test parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`TEST transfer: ${amount} ${tokenType} to ${playerAddress}`);

        // Reuse withdrawal handler's on-chain logic without DB side-effects
        const { createAptosAccount, client } = await import("./aptosUtils.ts");
        const { processWithdrawalTransaction } = await import("./transactionUtils.ts");
        const { createSuccessResponse, createErrorResponse } = await import("./responseHelpers.ts");

        // Derive escrow sender address from private key
        const escrowAccount = createAptosAccount(escrowPrivateKey);
        const senderAddress = escrowAccount.accountAddress.toString();

        // Convert to base units (octas)
        const amountBaseUnits = Math.round(amount * 1e8);

        const tx = await processWithdrawalTransaction(
          senderAddress,
          playerAddress,
          amountBaseUnits,
          tokenType,
          escrowPrivateKey
        );

        await client.waitForTransaction({ transactionHash: tx.hash });

        const success = createSuccessResponse(amount, tokenType, playerAddress, tx.hash);
        return new Response(JSON.stringify(success), {
          status: success.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        console.error("Test transfer error:", e);
        return new Response(
          JSON.stringify({ success: false, error: e?.message || "Test transfer failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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
