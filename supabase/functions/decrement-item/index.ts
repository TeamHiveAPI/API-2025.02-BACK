import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { corsHeaders } from "../../_shared/cors.ts"; // Asumindo a mesma pasta

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const url = new URL(req.url);
  const itemId = url.searchParams.get("id");
  const body = await req.json();
  const decrementValue = body.qnt_atual;

  if (!itemId || decrementValue === undefined) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: corsHeaders });
  }

  const { data: currentItem } = await supabase
    .from("item")
    .select("qnt_atual")
    .eq("id_item", Number(itemId))
    .single();

  if (!currentItem) {
    return new Response(JSON.stringify({ error: "Item not found" }), { status: 404, headers: corsHeaders });
  }

  const newQnt = currentItem.qnt_atual - decrementValue;
  if (newQnt < 0) {
    return new Response(JSON.stringify({ error: "Resultado negativo" }), { status: 400, headers: corsHeaders });
  }

  const { data: updatedItem } = await supabase
    .from("item")
    .update({ qnt_atual: newQnt })
    .eq("id_item", Number(itemId))
    .select()
    .single();

  return new Response(JSON.stringify(updatedItem), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});