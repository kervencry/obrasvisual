import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM = `Você é um assistente que organiza relatos livres de diário de obra (construção civil) em campos estruturados.
A partir do texto do usuário (que pode ser transcrição de voz, com português coloquial e erros), extraia:
- titulo: uma frase curta (até 60 caracteres) resumindo o dia. Se não houver informação, gere algo genérico como "Registro do dia".
- conteudo: um texto limpo, em português correto, em tom profissional e conciso, descrevendo atividades realizadas, ocorrências e pendências. Preserve TODOS os fatos do original (nada inventado, nada omitido). Use frases curtas e, quando fizer sentido, use bullets com "- ".
- clima: uma palavra ou expressão curta descrevendo o clima ("ensolarado", "chuvoso pela manhã", "nublado") — apenas se mencionado. Caso contrário, string vazia.
- trabalhadores: número inteiro de pessoas em campo, apenas se mencionado explicitamente. Caso contrário, 0.

Responda APENAS com JSON válido no formato exato:
{"titulo": "...", "conteudo": "...", "clima": "...", "trabalhadores": 0}
Sem markdown, sem comentários, sem texto fora do JSON.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY não configurada' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { texto } = await req.json().catch(() => ({ texto: '' }));
    if (!texto || typeof texto !== 'string' || texto.trim().length < 3) {
      return new Response(JSON.stringify({ error: 'Texto muito curto' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: texto.slice(0, 4000) },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: 'Muitas requisições. Tente em instantes.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA esgotados. Adicione créditos no workspace.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: `Gateway ${resp.status}: ${body.slice(0, 200)}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch {
      const m = String(raw).match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }

    const result = {
      titulo: String(parsed.titulo ?? '').slice(0, 120),
      conteudo: String(parsed.conteudo ?? texto),
      clima: String(parsed.clima ?? '').slice(0, 60),
      trabalhadores: Number.isFinite(Number(parsed.trabalhadores)) ? Number(parsed.trabalhadores) : 0,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});