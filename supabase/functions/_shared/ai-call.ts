// Helper compartilhado para chamar Lovable AI Gateway em edge functions.
// Retorna sempre o texto do modelo ou lança erro com mensagem HTTP.

export async function callLovableAI(opts: {
  system: string;
  user: string;
  model?: string;
  json?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY não configurada');

  const body: any = {
    model: opts.model ?? 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user.slice(0, 12000) },
    ],
  };
  if (opts.json) body.response_format = { type: 'json_object' };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    if (resp.status === 429) throw new Error('Muitas requisições. Tente em instantes.');
    if (resp.status === 402) throw new Error('Créditos de IA esgotados. Adicione créditos no workspace.');
    throw new Error(`Gateway ${resp.status}: ${txt.slice(0, 200)}`);
  }

  const data = await resp.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export function parseJsonLoose(raw: string): any {
  try { return JSON.parse(raw); } catch {}
  const m = String(raw).match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}