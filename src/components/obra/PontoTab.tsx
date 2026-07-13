import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserCheck, Plus, Trash2, Clock } from "lucide-react";

function calcHoras(entrada: string, saida: string): number | null {
  if (!entrada || !saida) return null;
  const [h1, m1] = entrada.split(":").map(Number);
  const [h2, m2] = saida.split(":").map(Number);
  const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (isNaN(diff) || diff <= 0) return null;
  return Math.round((diff / 60) * 100) / 100;
}

export default function PontoTab({ obraId, canEdit, userId }: { obraId: string; canEdit: boolean; userId?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colaborador, setColaborador] = useState("");
  const [funcao, setFuncao] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [entrada, setEntrada] = useState("07:00");
  const [saida, setSaida] = useState("17:00");
  const [obs, setObs] = useState("");

  async function refresh() {
    setLoading(true);
    const { data: d } = await supabase.from("ponto_registros")
      .select("*").eq("obra_id", obraId).order("data", { ascending: false }).order("created_at", { ascending: false });
    setRows(d ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [obraId]);

  async function adicionar() {
    if (!colaborador.trim()) { toast.error("Informe o colaborador"); return; }
    setSaving(true);
    const horas = calcHoras(entrada, saida);
    const { error } = await supabase.from("ponto_registros").insert({
      obra_id: obraId, user_id: userId,
      colaborador: colaborador.trim(),
      funcao: funcao.trim() || null,
      data, entrada, saida, horas,
      observacao: obs.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setColaborador(""); setFuncao(""); setObs("");
    toast.success("Ponto registrado");
    refresh();
  }

  async function remover(id: string) {
    if (!confirm("Remover registro?")) return;
    await supabase.from("ponto_registros").delete().eq("id", id);
    refresh();
  }

  const stats = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    const semanaAtras = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const hojeRows = rows.filter(r => r.data === hoje);
    const semanaRows = rows.filter(r => r.data >= semanaAtras);
    const horasSemana = semanaRows.reduce((a, b) => a + Number(b.horas || 0), 0);
    return {
      hoje: hojeRows.length,
      colaboradoresUnicos: new Set(hojeRows.map(r => r.colaborador.toLowerCase())).size,
      horasSemana: Math.round(horasSemana * 10) / 10,
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UserCheck className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-extrabold">Ponto da equipe</h2>
          <p className="text-sm text-muted-foreground">Registro simples de presença e horas trabalhadas por dia.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-extrabold">{stats.colaboradoresUnicos}</p>
          <p className="text-xs text-muted-foreground">Pessoas hoje</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-extrabold">{stats.hoje}</p>
          <p className="text-xs text-muted-foreground">Registros hoje</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-extrabold">{stats.horasSemana}h</p>
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
        </Card>
      </div>

      {canEdit && (
        <Card className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Colaborador</Label>
              <Input value={colaborador} onChange={e => setColaborador(e.target.value)} placeholder="Nome do colaborador" />
            </div>
            <div>
              <Label>Função</Label>
              <Input value={funcao} onChange={e => setFuncao(e.target.value)} placeholder="Pedreiro, servente, eletricista…" />
            </div>
            <div>
              <Label>Data</Label>
              <Input type="date" value={data} onChange={e => setData(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Entrada</Label>
                <Input type="time" value={entrada} onChange={e => setEntrada(e.target.value)} />
              </div>
              <div>
                <Label>Saída</Label>
                <Input type="time" value={saida} onChange={e => setSaida(e.target.value)} />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Observação</Label>
              <Input value={obs} onChange={e => setObs(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {calcHoras(entrada, saida) ?? 0}h calculadas
            </p>
            <Button onClick={adicionar} disabled={saving} className="gap-2">
              <Plus className="h-4 w-4" />Registrar ponto
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">Nenhum registro de ponto ainda.</Card>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <Card key={r.id} className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{r.colaborador}</p>
                  {r.funcao && <span className="text-xs text-muted-foreground">· {r.funcao}</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.data).toLocaleDateString("pt-BR")}
                  {r.entrada && r.saida && ` · ${r.entrada?.slice(0,5)} → ${r.saida?.slice(0,5)}`}
                  {r.horas && ` · ${r.horas}h`}
                </p>
                {r.observacao && <p className="text-xs text-muted-foreground mt-1 italic">{r.observacao}</p>}
              </div>
              {canEdit && (
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remover(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}