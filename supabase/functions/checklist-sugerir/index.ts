import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { callLovableAI, parseJsonLoose } from '../_shared/ai-call.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { etapa, tipoObra } = await req.json();
    if (!etapa) throw new Error('etapa obrigatória');

    const raw = await callLovableAI({
      system: `Você é engenheiro civil especialista em qualidade e segurança em obras. Dado o nome de uma etapa e o tipo de obra, gere de 6 a 10 itens de verificação técnica objetivos (qualidade + segurança) que devem ser conferidos antes de encerrar essa etapa. Cada item: uma frase curta, imperativa, em português brasileiro, sem numeração, sem emojis. Retorne JSON exato: {"itens":["...","..."]}. Nada além do JSON.`,
      user: `Etapa: ${etapa}\nTipo de obra: ${tipoObra ?? 'casa'}`,
      json: true,
    });
    const parsed = parseJsonLoose(raw) ?? {};
    const itens: string[] = Array.isArray(parsed.itens)
      ? parsed.itens.map((x: any) => String(x).trim()).filter(Boolean).slice(0, 12)
      : [];
    return new Response(JSON.stringify({ itens }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});