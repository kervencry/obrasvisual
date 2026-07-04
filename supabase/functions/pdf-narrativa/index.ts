import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { callLovableAI, parseJsonLoose } from '../_shared/ai-call.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { obra, etapas = [], fin = [], fotosCount = 0 } = await req.json();
    const gastos = fin.filter((f: any) => f.tipo === 'gasto').reduce((a: number, b: any) => a + Number(b.valor), 0);
    const dados = [
      `Obra: ${obra?.nome} — ${obra?.endereco ?? ''}`,
      `Tipo: ${obra?.tipo} · Status: ${obra?.status} · Progresso geral: ${obra?.percentual}% · Etapa atual: ${obra?.etapa_atual}`,
      `Orçamento previsto: R$ ${Number(obra?.valor_previsto || 0).toLocaleString('pt-BR')} · Gastos: R$ ${gastos.toLocaleString('pt-BR')}`,
      `Fotos registradas: ${fotosCount}`,
      '',
      'Etapas:',
      ...etapas.map((e: any) => `- ${e.etapa}: ${e.percentual}% (${e.status})`),
    ].join('\n');

    const raw = await callLovableAI({
      system: `Você é engenheiro civil redigindo um relatório executivo de obra. Escreva DOIS textos em português profissional e sóbrio, sem markdown, sem bullets, sem emojis. Sem inventar dados fora do relato. Retorne JSON exato: {"abertura":"...","conclusao":"..."}. Cada campo deve ter 3-5 frases. A abertura contextualiza a obra e o estágio geral. A conclusão sintetiza a situação, ressalta pontos positivos ou atenção e menciona próximos passos previstos.`,
      user: dados,
      json: true,
    });
    const parsed = parseJsonLoose(raw) ?? {};
    return new Response(JSON.stringify({
      abertura: String(parsed.abertura ?? '').trim(),
      conclusao: String(parsed.conclusao ?? '').trim(),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});