import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { callLovableAI } from '../_shared/ai-call.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { obraNome, periodo, fotos = [], diario = [], etapas = [], financeiro = [] } = await req.json();

    const dados = [
      `Obra: ${obraNome ?? '—'}`,
      `Período: ${periodo?.inicio ?? '—'} a ${periodo?.fim ?? '—'}`,
      '',
      `Fotos novas (${fotos.length}):`,
      ...fotos.slice(0, 20).map((f: any) => `- ${f.etapa ?? ''}${f.legenda ? ': ' + f.legenda : ''}`),
      '',
      `Registros de diário (${diario.length}):`,
      ...diario.slice(0, 20).map((d: any) => `- ${d.data} — ${d.titulo ?? ''}: ${d.conteudo?.slice(0, 300) ?? ''} ${d.clima ? '[' + d.clima + ']' : ''}${d.trabalhadores ? ' (' + d.trabalhadores + ' pessoas)' : ''}`),
      '',
      `Etapas (situação atual):`,
      ...etapas.map((e: any) => `- ${e.etapa}: ${e.percentual}% ${e.status}`),
      '',
      `Financeiro no período (${financeiro.length} lançamentos):`,
      ...financeiro.slice(0, 20).map((f: any) => `- ${f.tipo}: R$ ${f.valor} — ${f.descricao ?? ''}`),
    ].join('\n');

    const texto = await callLovableAI({
      system: `Você é engenheiro civil escrevendo um resumo semanal de obra para o cliente. Tom profissional, cordial, direto, em português brasileiro. Use 3 a 5 parágrafos curtos cobrindo: (1) o que avançou na semana, (2) etapa atual e situação do prazo, (3) ocorrências ou pontos de atenção (chuva, faltas, imprevistos) se houver, (4) próximos passos previstos. Não invente dados que não estão no relato. Se algo estiver ausente, omita elegantemente. Não use bullets nem markdown — texto corrido, pronto para colar em uma mensagem para o cliente.`,
      user: dados,
    });

    return new Response(JSON.stringify({ resumo: texto.trim() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});