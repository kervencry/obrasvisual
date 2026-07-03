import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Building2, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

export default function DashboardEngenheiro() {
  const [obras, setObras] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [fatTotal, setFatTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase.from("obras").select("*").order("created_at", { ascending: false });
      setObras(o ?? []);
      const { data: tl } = await supabase.from("timeline_eventos").select("*").order("created_at", { ascending: false }).limit(10);
      setEventos(tl ?? []);
      const { data: fin } = await supabase.from("financeiro").select("valor, tipo");
      const total = (fin ?? []).filter((f:any)=>f.tipo==="orcamento").reduce((a:number,b:any)=>a+Number(b.valor),0);
      setFatTotal(total);
    })();
  }, []);

  const emAndamento = obras.filter(o => o.status === "em_andamento").length;
  const atrasadas = obras.filter(o => o.data_fim_prevista && new Date(o.data_fim_prevista) < new Date() && o.percentual < 100).length;
  const precisamAtencao = obras.filter(o => {
    const atrasada = o.data_fim_prevista && new Date(o.data_fim_prevista) < new Date() && o.percentual < 100;
    const lenta = o.data_inicio && o.percentual < 30 && (Date.now() - new Date(o.data_inicio).getTime()) > 60*86400000;
    return atrasada || lenta;
  });

  // obras por mês (últimos 6)
  const meses: { mes: string; total: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short" });
    const total = obras.filter(o => {
      const od = new Date(o.created_at);
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
    }).length;
    meses.push({ mes: label, total });
  }

  const statusData = ["planejamento","em_andamento","pausada","concluida"].map(s => ({
    name: s, value: obras.filter(o => o.status === s).length,
  })).filter(x => x.value > 0);

  const metricas = [
    { label: "Total de obras", value: obras.length, icon: Building2 },
    { label: "Em andamento", value: emAndamento, icon: Activity },
    { label: "Atrasadas", value: atrasadas, icon: AlertTriangle },
    { label: "Orçamento total", value: `R$ ${fatTotal.toLocaleString("pt-BR")}`, icon: DollarSign },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-muted-foreground">Visão consolidada das suas obras</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricas.map(m => (
          <Card key={m.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <m.icon className="h-4 w-4 text-muted-foreground"/>
            </div>
            <p className="text-2xl font-extrabold">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Obras por mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meses}>
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false}/>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Distribuição por status</h3>
          <div className="h-64">
            {statusData.length === 0 ? <p className="text-muted-foreground text-sm">Sem dados</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {statusData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive"/>Obras que precisam de atenção</h3>
        {precisamAtencao.length === 0 ? <p className="text-sm text-muted-foreground">Tudo em dia.</p> : (
          <div className="space-y-2">
            {precisamAtencao.map(o => (
              <Link key={o.id} to={`/app/obras/${o.id}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{o.nome}</p>
                    <Progress value={o.percentual} className="h-1.5 mt-1"/>
                  </div>
                  <Badge variant="destructive" className="ml-3">{o.percentual}%</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Atividade recente</h3>
        {eventos.length === 0 ? <p className="text-sm text-muted-foreground">Sem atividade</p> : (
          <div className="space-y-1">
            {eventos.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">{e.tipo}</Badge><span>{e.descricao}</span></div>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: ptBR })}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
