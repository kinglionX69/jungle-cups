import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { playerAddress, code } = await req.json();

    if (!playerAddress || !code) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Derive last 5 characters from code
    const lastFive = String(code).slice(-5);

    // Lookup referrer wallet by suffix
    const { data: referrer, error: refLookupErr } = await supabase
      .from("player_stats")
      .select("wallet_address")
      .ilike("wallet_address", `%${lastFive}`)
      .maybeSingle();

    if (refLookupErr || !referrer?.wallet_address) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid referral code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const referrerAddress = referrer.wallet_address as string;

    // Prevent self-referrals
    if (referrerAddress === playerAddress) {
      return new Response(
        JSON.stringify({ success: false, message: "You cannot use your own referral code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already referred
    const { data: existing, error: checkErr } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_address", playerAddress)
      .maybeSingle();

    if (checkErr) {
      console.error("referral check error:", checkErr);
      return new Response(JSON.stringify({ success: false, message: "Referral check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing) {
      return new Response(
        JSON.stringify({ success: false, message: "You have already been referred" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create referral record
    const { error: insertErr } = await supabase.from("referrals").insert({
      referrer_address: referrerAddress,
      referred_address: playerAddress,
    });

    if (insertErr) {
      console.error("referral insert error:", insertErr);
      return new Response(JSON.stringify({ success: false, message: "Failed to apply referral" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("referral function error:", e);
    return new Response(JSON.stringify({ success: false, error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});