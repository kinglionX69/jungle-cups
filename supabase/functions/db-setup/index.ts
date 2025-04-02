
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Enable realtime for game_transactions table
    const { error } = await supabase
      .rpc('supabase_functions.http_request', {
        "method": 'POST',
        "url": `${supabaseUrl}/rest/v1/`,
        "headers": { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
        "body": {
          "command": "ALTER TABLE game_transactions REPLICA IDENTITY FULL;",
          "type": "sql"
        }
      })
    
    if (error) {
      console.error("Error setting REPLICA IDENTITY:", error)
      throw error
    }
    
    // Add game_transactions to the realtime publication
    const { error: pubError } = await supabase
      .rpc('supabase_functions.http_request', {
        "method": 'POST',
        "url": `${supabaseUrl}/rest/v1/`,
        "headers": { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
        "body": {
          "command": "ALTER PUBLICATION supabase_realtime ADD TABLE game_transactions;",
          "type": "sql"
        }
      })
    
    if (pubError) {
      console.error("Error adding table to publication:", pubError)
      throw pubError
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Realtime configuration for game_transactions completed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error configuring realtime:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
