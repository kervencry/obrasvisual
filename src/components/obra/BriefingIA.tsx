import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { differenceInDays } from "date-fns";

export default function BriefingIA({ obras, userId }: { obras: any[]; userId: string }) {
  const [texto, setTexto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    if (obras.length === 0) return;
    setLoading(true); setErro(null);
    try {
      const ids = obras.map((o) => o.id);
      const hoje = new Date();
      const dias5 = new Date(hoje); dias5.setDate(dias5.getDate() - 5);
      const dias2 = new Date(hoje); dias2.setDate(dias2.getDate() - 2);

      const [{ data: fotos }, { data: aprov }, { data: etapas }] = await Promise.all([
        supabase.from("fotos").select("obra_id, created_at").in("obra_id", ids),
        supabase.from("aprovacoes").select("obra_id, created_at").in("obra_id", ids),
        supabase.from("etapas").select("obra_id, etapa, status, data_fim_prevista").in("obra_id", ids),
      ]);

      const semFotosRecentes: string[] = [];
      const aprovacoesPendentes: any[] = [];
      const etapasAtrasadas: any[] = [];

      for (const o of obras) {
        if (o.status === "concluida" || o.status === "cancelada") continue;
        const fotosObra = (fotos ?? []).filter((f) => f.obra_id === o.id);
        const ultima = fotosObra.reduce((max, f) => (f.created_at > max ? f.created_at : max), "");
        if (!ultima || new Date(ultima) < dias5) semFotosRecentes.push(o.nome);

        const aprovObra = (aprov ?? []).filter((a) => a.obra_id === o.id);
        const ultimaAprov = aprovObra.reduce((max, a) => (a.created_at > max ? a.created_at : max), "");
        const pendencia = etapas?.some((e) => e.obra_id === o.id && e.status === "em_andamento");
        if (pendencia && (!ultimaAprov || new Date(ultimaAprov) < dias2)) {
          aprovacoesPendentes.push({ obra: o.nome });
        }

        for (const e of etapas ?? []) {
          if (e.obra_id !== o.id) continue;
          if (e.status === "concluido" || e.status === "aprovado") continue;
          if (!e.data_fim_prevista) continue;
          const dias = differenceInDays(hoje, new Date(e.data_fim_prevista));
          if (dias > 0) etapasAtrasadas.push({ obra: o.nome, etapa: e.etapa, diasAtraso: dias });
        }
      }

      const sinais = {
        totalObras: obras.length,
        obrasAtivas: obras.filter((o) => o.status === "em_andamento").length,
        semFotosRecentes, aprovacoesPendentes, etapasAtrasadas,
      };

      const { data, error } = await supabase.functions.invoke("briefing-diario", { body: { sinais } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setTexto(((data as any).briefing ?? "").trim());
    } catch (e: any) {
      setErro(e.message || "Falha ao gerar briefing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (obras.length > 1) gerar(); /* eslint-disable-next-line */ }, [obras.length]);

  if (obras.length <= 1) return null;

  return (
    <Card className="p-4 border-primary/30 bg-primary/[0.03] mb-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold">Briefing do dia</h3>
            <Button size="sm" variant="ghost" onClick={gerar} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          {loading && !texto && <p className="text-sm text-muted-foreground">Analisando suas obras...</p>}
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          {texto && <p className="text-sm">{texto}</p>}
        </div>
      </div>
    </Card>
  );
}