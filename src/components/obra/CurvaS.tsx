import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { STAGES } from "@/components/obra/AnimatedHouse";
import { TrendingUp } from "lucide-react";

export default function CurvaS({ obraId, userId, fin, isEditor }: { obraId: string; userId: string; fin: any[]; isEditor: boolean }) {
  const [plan, setPlan] = useState<any[]>([]);
  const [f, setF] = useState({ etapa: "fundacao", mes_referencia: "", valor_planejado: "" });

  async function load() {
    const { data } = await supabase.from("orcamento_planejado").select("*").eq("obra_id", obraId).order("mes_referencia");
    setPlan(data ?? []);
  }
  useEffect(() => { load(); }, [obraId]);

  async function addPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!f.mes_referencia || !f.valor_planejado) { toast.error("Preencha mês e valor."); return; }
    const mes = f.mes_referencia.length === 7 ? `${f.mes_referencia}-01` : f.mes_referencia;
    const { error } = await supabase.from("orcamento_planejado").insert({
      obra_id: obraId, criado_por: userId,
      etapa: f.etapa as any, mes_referencia: mes, valor_planejado: Number(f.valor_planejado),
    });
    if (error) { toast.error(error.message); return; }
    setF({ etapa: "fundacao", mes_referencia: "", valor_planejado: "" });
    load();
  }

  async function excluir(id: string) {
    await supabase.from("orcamento_planejado").delete().eq("id", id);
    load();
  }

  const data = useMemo(() => {
    const bucket: Record<string, { mes: string; planejado: number; realizado: number }> = {};
    plan.forEach(p => {
      const k = p.mes_referencia.slice(0, 7);
      (bucket[k] ||= { mes: k, planejado: 0, realizado: 0 }).planejado += Number(p.valor_planejado);
    });
    fin.filter((x: any) => x.tipo === "gasto").forEach((x: any) => {
      const k = String(x.data).slice(0, 7);
      (bucket[k] ||= { mes: k, planejado: 0, realizado: 0 }).realizado += Number(x.valor);
    });
    const meses = Object.keys(bucket).sort();
    let accP = 0, accR = 0;
    return meses.map(k => {
      accP += bucket[k].planejado; accR += bucket[k].realizado;
      return { mes: format(parseISO(`${k}-01`), "MMM/yy"), Planejado: Number(accP.toFixed(2)), Realizado: Number(accR.toFixed(2)) };
    });
  }, [plan, fin]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" />Curva S — Planejado vs Realizado</h3>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Cadastre o orçamento planejado por mês para ver a curva.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => `R$ ${Number(v).toLocaleString("pt-BR")}`} />
                <Legend />
                <Line type="monotone" dataKey="Planejado" strokeWidth={2} stroke="hsl(var(--muted-foreground))" />
                <Line type="monotone" dataKey="Realizado" strokeWidth={2} stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {isEditor && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Adicionar planejamento mensal</h4>
          <form onSubmit={addPlan} className="grid sm:grid-cols-4 gap-2 items-end">
            <div>
              <Label>Etapa</Label>
              <Select value={f.etapa} onValueChange={v => setF({ ...f, etapa: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Mês</Label><Input type="month" value={f.mes_referencia} onChange={e => setF({ ...f, mes_referencia: e.target.value })} /></div>
            <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={f.valor_planejado} onChange={e => setF({ ...f, valor_planejado: e.target.value })} /></div>
            <Button type="submit">Adicionar</Button>
          </form>

          {plan.length > 0 && (
            <div className="mt-4 space-y-1">
              {plan.map(p => (
                <div key={p.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span className="capitalize">{p.etapa} — {p.mes_referencia.slice(0, 7)}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono">R$ {Number(p.valor_planejado).toLocaleString("pt-BR")}</span>
                    <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => excluir(p.id)}>excluir</button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}