import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldX, FileWarning, Pause, DollarSign, CloudRain, CheckCircle2, RefreshCw } from "lucide-react";

type Alerta = {
  id: string;
  severidade: "critico" | "alerta" | "info";
  Icon: any;
  titulo: string;
  descricao: string;
};

export default function AlertasTab({ obraId }: { obraId: string }) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    const lista: Alerta[] = [];

    const [obraQ, paralisQ, docsQ, segQ, finQ, tarefasQ] = await Promise.all([
      supabase.from("obras").select("percentual, data_fim_prevista, latitude, longitude").eq("id", obraId).maybeSingle(),
      supabase.from("paralisacoes_obra").select("motivo, data_inicio").eq("obra_id", obraId).is("data_fim", null),
      supabase.from("documentos_obra").select("nome, tipo, data_validade").eq("obra_id", obraId).not("data_validade", "is", null),
      supabase.from("seguranca_registros").select("item, status, data").eq("obra_id", obraId).eq("status", "critico"),
      supabase.from("financeiro").select("tipo, valor").eq("obra_id", obraId),
      supabase.from("tarefas_obra").select("titulo, status, data_prazo").eq("obra_id", obraId).not("data_prazo", "is", null).neq("status", "concluida"),
    ]);

    const obra = obraQ.data;

    // Prazo da obra
    if (obra?.data_fim_prevista) {
      const dias = Math.round((+new Date(obra.data_fim_prevista) - Date.now()) / (1000 * 60 * 60 * 24));
      const pct = obra.percentual ?? 0;
      if (dias < 0 && pct < 100) {
        lista.push({ id: "prazo", severidade: "critico", Icon: AlertTriangle,
          titulo: "Obra passou do prazo previsto",
          descricao: `${Math.abs(dias)} dias em atraso · progresso ${pct}%` });
      } else if (dias >= 0 && dias < 30 && pct < 80) {
        lista.push({ id: "prazo", severidade: "alerta", Icon: AlertTriangle,
          titulo: "Prazo apertado",
          descricao: `Faltam ${dias} dias para entrega, progresso em ${pct}%` });
      }
    }

    // Paralisações ativas
    (paralisQ.data ?? []).forEach((p: any, i: number) =>
      lista.push({ id: `par-${i}`, severidade: "critico", Icon: Pause,
        titulo: "Obra paralisada",
        descricao: `${p.motivo ?? "Sem motivo informado"} · desde ${new Date(p.data_inicio).toLocaleDateString("pt-BR")}` }));

    // Documentos vencendo (30 dias) ou vencidos
    const hoje = Date.now();
    (docsQ.data ?? []).forEach((d: any, i: number) => {
      const dias = Math.round((+new Date(d.data_validade) - hoje) / (1000 * 60 * 60 * 24));
      if (dias < 0) {
        lista.push({ id: `doc-${i}`, severidade: "critico", Icon: FileWarning,
          titulo: `Documento vencido: ${d.nome}`,
          descricao: `${d.tipo ?? ""} · venceu há ${Math.abs(dias)} dias` });
      } else if (dias <= 30) {
        lista.push({ id: `doc-${i}`, severidade: "alerta", Icon: FileWarning,
          titulo: `Documento vencendo: ${d.nome}`,
          descricao: `${d.tipo ?? ""} · vence em ${dias} dias` });
      }
    });

    // Segurança crítica
    (segQ.data ?? []).slice(0, 5).forEach((s: any, i: number) =>
      lista.push({ id: `seg-${i}`, severidade: "critico", Icon: ShieldX,
        titulo: `Ocorrência crítica de segurança`,
        descricao: `${s.item} · ${new Date(s.data).toLocaleDateString("pt-BR")}` }));

    // Estouro de orçamento
    const fin = finQ.data ?? [];
    const orc = fin.filter((f: any) => f.tipo === "orcamento").reduce((a, b: any) => a + Number(b.valor), 0);
    const gasto = fin.filter((f: any) => f.tipo === "gasto").reduce((a, b: any) => a + Number(b.valor), 0);
    if (orc > 0) {
      const pctFin = (gasto / orc) * 100;
      if (pctFin > 100) {
        lista.push({ id: "fin", severidade: "critico", Icon: DollarSign,
          titulo: "Orçamento estourado",
          descricao: `Gasto ${pctFin.toFixed(0)}% do orçado (R$ ${gasto.toLocaleString("pt-BR")} de R$ ${orc.toLocaleString("pt-BR")})` });
      } else if (pctFin > 85) {
        lista.push({ id: "fin", severidade: "alerta", Icon: DollarSign,
          titulo: "Orçamento próximo do limite",
          descricao: `Gasto ${pctFin.toFixed(0)}% do orçado` });
      }
    }

    // Tarefas atrasadas
    const tarefasAtrasadas = (tarefasQ.data ?? []).filter((t: any) => new Date(t.data_prazo) < new Date());
    if (tarefasAtrasadas.length) {
      lista.push({ id: "tarefas", severidade: "alerta", Icon: AlertTriangle,
        titulo: `${tarefasAtrasadas.length} tarefa(s) atrasada(s)`,
        descricao: tarefasAtrasadas.slice(0, 3).map((t: any) => t.titulo).join(", ") });
    }

    // Chuva forte prevista (Open-Meteo)
    if (obra?.latitude && obra?.longitude) {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${obra.latitude}&longitude=${obra.longitude}&daily=precipitation_sum&timezone=auto&forecast_days=3`);
        const j = await r.json();
        const chuvas: number[] = j?.daily?.precipitation_sum ?? [];
        const forte = chuvas.some(v => v > 20);
        if (forte) {
          lista.push({ id: "chuva", severidade: "alerta", Icon: CloudRain,
            titulo: "Chuva forte prevista",
            descricao: `Volumes de até ${Math.max(...chuvas).toFixed(0)}mm nos próximos 3 dias. Reveja etapas expostas.` });
        }
      } catch { /* ignore */ }
    }

    // Ordena: crítico → alerta → info
    const peso = { critico: 0, alerta: 1, info: 2 } as any;
    lista.sort((a, b) => peso[a.severidade] - peso[b.severidade]);

    setAlertas(lista);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [obraId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-extrabold">Alertas inteligentes</h2>
            <p className="text-sm text-muted-foreground">Riscos e pendências detectados automaticamente na obra.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={carregar} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Recalcular
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Analisando obra…</p>
      ) : alertas.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto text-primary mb-2" />
          <p className="font-bold">Tudo sob controle</p>
          <p className="text-sm text-muted-foreground">Nenhum risco crítico detectado na obra.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {alertas.map(a => {
            const Icon = a.Icon;
            const cor = a.severidade === "critico" ? "border-destructive/40 bg-destructive/5"
                     : a.severidade === "alerta"  ? "border-accent/40 bg-accent/5"
                     : "border-border";
            const iconCor = a.severidade === "critico" ? "text-destructive"
                         : a.severidade === "alerta"  ? "text-accent"
                         : "text-primary";
            return (
              <Card key={a.id} className={`p-3 flex items-start gap-3 border-2 ${cor}`}>
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconCor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-semibold">{a.titulo}</p>
                    <Badge variant={a.severidade === "critico" ? "destructive" : "secondary"}>
                      {a.severidade}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.descricao}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}