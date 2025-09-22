import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { corsHeaders } from "../../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const loteId = url.searchParams.get("id_lote");
    const { valor_incremento } = await req.json();

    if (!loteId || valor_incremento === undefined || valor_incremento < 0) {
      return new Response(JSON.stringify({ error: "ID do lote e um valor de incremento válido são obrigatórios." }), { status: 400, headers: corsHeaders });
    }

    // 1. Busca o lote e o ID do item associado
    const { data: currentLote, error: loteSelectError } = await supabase
      .from("lote")
      .select("quantidade, id_item")
      .eq("id_lote", Number(loteId))
      .single();

    if (loteSelectError || !currentLote) {
      return new Response(JSON.stringify({ error: "Lote não encontrado." }), { status: 404, headers: corsHeaders });
    }

    const newQntLote = currentLote.quantidade + valor_incremento;

    // 2. Atualiza a quantidade do lote
    const { data: updatedLote, error: loteUpdateError } = await supabase
      .from("lote")
      .update({ quantidade: newQntLote })
      .eq("id_lote", Number(loteId))
      .select()
      .single();

    if (loteUpdateError) {
      return new Response(JSON.stringify({ error: `Erro ao atualizar a quantidade do lote: ${loteUpdateError.message}` }), { status: 500, headers: corsHeaders });
    }

    // 3. Busca a quantidade atual do item
    const { data: currentItem, error: itemSelectError } = await supabase
      .from("item")
      .select("qnt_atual")
      .eq("id_item", currentLote.id_item)
      .single();

    if (itemSelectError || !currentItem) {
      return new Response(JSON.stringify({ error: "Item associado não encontrado." }), { status: 404, headers: corsHeaders });
    }

    const newQntItem = currentItem.qnt_atual + valor_incremento;

    // 4. Atualiza a quantidade total do item
    const { data: updatedItem, error: itemUpdateError } = await supabase
      .from("item")
      .update({ qnt_atual: newQntItem })
      .eq("id_item", currentLote.id_item)
      .select()
      .single();

    if (itemUpdateError) {
      return new Response(JSON.stringify({ error: `Erro ao atualizar a quantidade total do item: ${itemUpdateError.message}` }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ lote_atualizado: updatedLote, item_atualizado: updatedItem }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Corpo da requisição inválido.' }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});