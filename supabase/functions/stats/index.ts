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

    const { playerAddress, gamesDelta = 0, winsDelta = 0, lossesDelta = 0 } = await req.json();

    if (!playerAddress) {
      return new Response(JSON.stringify({ success: false, error: "Missing playerAddress" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch existing stats
    const { data: existing, error: fetchErr } = await supabase
      .from("player_stats")
      .select("games_played, wins, losses")
      .eq("wallet_address", playerAddress)
      .maybeSingle();

    if (fetchErr) {
      console.error("stats fetch error:", fetchErr);
      return new Response(JSON.stringify({ success: false, error: "Failed to fetch stats" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentGames = existing?.games_played ?? 0;
    const currentWins = existing?.wins ?? 0;
    const currentLosses = existing?.losses ?? 0;

    const newGames = currentGames + Number(gamesDelta || 0);
    const newWins = currentWins + Number(winsDelta || 0);
    const newLosses = currentLosses + Number(lossesDelta || 0);
    const newWinRate = newGames > 0 ? Math.round((newWins / newGames) * 100) : 0;

    if (existing) {
      const { error: updateErr } = await supabase
        .from("player_stats")
        .update({
          games_played: newGames,
          wins: newWins,
          losses: newLosses,
          win_rate: newWinRate,
          updated_at: new Date().toISOString(),
        })
        .eq("wallet_address", playerAddress);

      if (updateErr) {
        console.error("stats update error:", updateErr);
        return new Response(JSON.stringify({ success: false, error: "Failed to update stats" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: insertErr } = await supabase.from("player_stats").insert({
        wallet_address: playerAddress,
        games_played: newGames,
        wins: newWins,
        losses: newLosses,
        win_rate: newWinRate,
        apt_won: 0,
        emoji_won: 0,
        referrals: 0,
      });

      if (insertErr) {
        console.error("stats insert error:", insertErr);
        return new Response(JSON.stringify({ success: false, error: "Failed to create stats" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stats function error:", e);
    return new Response(JSON.stringify({ success: false, error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});