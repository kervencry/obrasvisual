import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { callLovableAI } from '../_shared/ai-call.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { sinais } = await req.json();
    // sinais: { totalObras, semFotosRecentes: [nome...], aprovacoesPendentes: [{obra, dias}], etapasAtrasadas: [{obra, etapa, diasAtraso}], obrasAtivas }
    const s = sinais ?? {};
    const dados = [
      `Total de obras: ${s.totalObras ?? 0}`,
      `Obras ativas: ${s.obrasAtivas ?? 0}`,
      `Obras sem foto nova há mais de 5 dias: ${(s.semFotosRecentes ?? []).length} (${(s.semFotosRecentes ?? []).slice(0, 5).join(', ')})`,
      `Aprovações pendentes há mais de 2 dias: ${(s.aprovacoesPendentes ?? []).length}`,
      `Etapas atrasadas em relação ao prazo: ${(s.etapasAtrasadas ?? []).length}`,
      ...((s.etapasAtrasadas ?? []).slice(0, 5).map((x: any) => `  - ${x.obra}: etapa ${x.etapa} (${x.diasAtraso}d)`)),
    ].join('\n');

    const texto = await callLovableAI({
      system: `Você produz um briefing DIÁRIO ultracurto para um engenheiro civil que gerencia várias obras. Estilo direto, tom operacional, 2 a 4 frases, sem saudação, sem markdown, sem bullets, sem emojis. Priorize riscos e pendências (falta de fotos, aprovações paradas, atrasos). Se estiver tudo em dia, diga isso em uma frase. Não invente números fora dos sinais recebidos.`,
      user: dados,
    });
    return new Response(JSON.stringify({ briefing: texto.trim() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});