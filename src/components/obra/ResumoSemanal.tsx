import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Send, Copy, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ResumoSemanal({ obra, userId }: { obra: any; userId: string }) {
  const [historico, setHistorico] = useState<any[]>([]);
  const [gerando, setGerando] = useState(false);
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function loadHist() {
    const { data } = await (supabase as any).from("resumos_semanais")
      .select("*").eq("obra_id", obra.id).order("created_at", { ascending: false }).limit(10);
    setHistorico(data ?? []);
  }
  useEffect(() => { loadHist(); }, [obra.id]);

  async function gerar() {
    setGerando(true);
    try {
      const fim = new Date();
      const inicio = subDays(fim, 7);
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const [fotos, diario, etapas, financeiro] = await Promise.all([
        supabase.from("fotos").select("etapa, legenda, created_at").eq("obra_id", obra.id).gte("created_at", inicio.toISOString()),
        supabase.from("diario_obra").select("data, titulo, conteudo, clima, trabalhadores").eq("obra_id", obra.id).gte("data", iso(inicio)),
        supabase.from("etapas").select("etapa, percentual, status").eq("obra_id", obra.id).order("ordem"),
        supabase.from("financeiro").select("tipo, valor, descricao").eq("obra_id", obra.id).gte("data", iso(inicio)),
      ]);
      const { data, error } = await supabase.functions.invoke("resumo-semanal", {
        body: {
          obraNome: obra.nome,
          periodo: { inicio: iso(inicio), fim: iso(fim) },
          fotos: fotos.data ?? [],
          diario: diario.data ?? [],
          etapas: etapas.data ?? [],
          financeiro: financeiro.data ?? [],
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const resumo = (data as any).resumo as string;
      setRascunho(resumo);
      await (supabase as any).from("resumos_semanais").insert({
        obra_id: obra.id, user_id: userId,
        periodo_inicio: iso(inicio), periodo_fim: iso(fim),
        conteudo: resumo,
      });
      loadHist();
    } catch (e: any) {
      toast.error(e.message || "Falha ao gerar resumo");
    } finally {
      setGerando(false);
    }
  }

  async function enviarChat(txt: string) {
    setEnviando(true);
    const { error } = await supabase.from("mensagens").insert({
      obra_id: obra.id, user_id: userId,
      conteudo: `📋 Resumo da semana\n\n${txt}`,
    });
    setEnviando(false);
    if (error) return toast.error(error.message);
    toast.success("Resumo enviado no chat da obra!");
  }

  function copiar(txt: string) {
    navigator.clipboard.writeText(txt);
    toast.success("Resumo copiado");
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este resumo?")) return;
    await (supabase as any).from("resumos_semanais").delete().eq("id", id);
    loadHist();
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 border-primary/30 bg-primary/[0.03]">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-1 shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold">Resumo semanal para o cliente</h3>
            <p className="text-sm text-muted-foreground">
              Cruza fotos, diário, etapas e financeiro dos últimos 7 dias e gera um texto pronto para revisar e enviar.
            </p>
          </div>
          <Button onClick={gerar} disabled={gerando}>
            {gerando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Gerar resumo da semana
          </Button>
        </div>
      </Card>

      {rascunho !== null && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Rascunho gerado — revise antes de enviar</p>
            <Button size="sm" variant="ghost" onClick={() => setRascunho(null)}>Fechar</Button>
          </div>
          <Textarea rows={10} value={rascunho} onChange={(e) => setRascunho(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => enviarChat(rascunho)} disabled={enviando}>
              {enviando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Enviar no chat da obra
            </Button>
            <Button variant="outline" onClick={() => copiar(rascunho)}>
              <Copy className="h-4 w-4 mr-1" />Copiar
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">Histórico de resumos</h4>
        {historico.length === 0 && <p className="text-sm text-muted-foreground">Nenhum resumo gerado ainda.</p>}
        {historico.map((r) => (
          <Card key={r.id} className="p-4 group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(r.periodo_inicio), "dd/MM", { locale: ptBR })} — {format(new Date(r.periodo_fim), "dd/MM/yyyy", { locale: ptBR })}
                <span>· gerado {format(new Date(r.created_at), "dd/MM HH:mm")}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Button size="icon" variant="ghost" onClick={() => copiar(r.conteudo)}><Copy className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => enviarChat(r.conteudo)}><Send className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => excluir(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap">{r.conteudo}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}