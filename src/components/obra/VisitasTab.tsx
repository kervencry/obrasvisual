import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarClock, Plus, X, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { notificar, notificarMembros } from "@/lib/notificar";

export default function VisitasTab({ obraId, userId, isEditor, ownerId }: { obraId: string; userId: string; isEditor: boolean; ownerId: string }) {
  const [visitas, setVisitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState({ data_hora: "", duracao_minutos: 60, observacoes: "" });

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("visitas_obra").select("*").eq("obra_id", obraId).order("data_hora");
    setVisitas(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [obraId]);

  async function criarHorario(e: React.FormEvent) {
    e.preventDefault();
    if (!novo.data_hora) { toast.error("Escolha data e hora."); return; }
    const { error } = await supabase.from("visitas_obra").insert({
      obra_id: obraId, criado_por: userId,
      data_hora: new Date(novo.data_hora).toISOString(),
      duracao_minutos: novo.duracao_minutos, observacoes: novo.observacoes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Horário disponibilizado.");
    setNovo({ data_hora: "", duracao_minutos: 60, observacoes: "" });
    load();
  }

  async function agendar(v: any) {
    const { error } = await supabase.from("visitas_obra")
      .update({ status: "agendado", agendado_por: userId }).eq("id", v.id).eq("status", "disponivel");
    if (error) { toast.error(error.message); return; }
    toast.success("Visita agendada!");
    await notificar(v.criado_por, obraId, "Nova visita agendada", `Visita marcada para ${format(new Date(v.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}`, "info", `/app/obras/${obraId}`);
    load();
  }

  async function cancelar(v: any) {
    const { error } = await supabase.from("visitas_obra").update({ status: "cancelado" }).eq("id", v.id);
    if (error) { toast.error(error.message); return; }
    if (v.agendado_por) await notificar(v.agendado_por, obraId, "Visita cancelada", `A visita de ${format(new Date(v.data_hora), "dd/MM HH:mm")} foi cancelada.`, "alerta", `/app/obras/${obraId}`);
    load();
  }

  async function reabrir(v: any) {
    await supabase.from("visitas_obra").update({ status: "disponivel", agendado_por: null }).eq("id", v.id);
    load();
  }

  const disponiveis = visitas.filter(v => v.status === "disponivel");
  const agendadas = visitas.filter(v => v.status === "agendado");
  const outras = visitas.filter(v => v.status === "cancelado" || v.status === "realizado");

  return (
    <div className="space-y-4">
      {isEditor && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" />Disponibilizar novo horário</h3>
          <form onSubmit={criarHorario} className="grid sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <Label>Data e hora</Label>
              <Input type="datetime-local" value={novo.data_hora} onChange={e => setNovo({ ...novo, data_hora: e.target.value })} />
            </div>
            <div>
              <Label>Duração (min)</Label>
              <Input type="number" min={15} step={15} value={novo.duracao_minutos} onChange={e => setNovo({ ...novo, duracao_minutos: Number(e.target.value) })} />
            </div>
            <Button type="submit">Adicionar</Button>
            <div className="sm:col-span-4">
              <Label>Observações</Label>
              <Textarea rows={2} value={novo.observacoes} onChange={e => setNovo({ ...novo, observacoes: e.target.value })} placeholder="Ex: Entrada pela portaria principal" />
            </div>
          </form>
        </Card>
      )}

      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><CalendarClock className="h-4 w-4" />Horários disponíveis</h3>
        {loading ? <p className="text-sm text-muted-foreground">Carregando...</p> :
          disponiveis.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum horário disponível no momento.</p> :
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {disponiveis.map(v => (
              <Card key={v.id} className="p-3">
                <p className="font-semibold">{format(new Date(v.data_hora), "EEE, dd/MM 'às' HH:mm", { locale: ptBR })}</p>
                <p className="text-xs text-muted-foreground">{v.duracao_minutos} min</p>
                {v.observacoes && <p className="text-xs mt-1">{v.observacoes}</p>}
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => agendar(v)}>Marcar visita</Button>
                  {isEditor && <Button size="sm" variant="ghost" onClick={() => cancelar(v)}><X className="h-3 w-3" /></Button>}
                </div>
              </Card>
            ))}
          </div>
        }
      </div>

      {agendadas.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Visitas agendadas</h3>
          <div className="space-y-2">
            {agendadas.map(v => (
              <Card key={v.id} className="p-3 flex justify-between items-center gap-2">
                <div>
                  <p className="font-semibold">{format(new Date(v.data_hora), "EEE, dd/MM 'às' HH:mm", { locale: ptBR })} <Badge variant="secondary" className="ml-2">Agendada</Badge></p>
                  {v.observacoes && <p className="text-xs mt-1">{v.observacoes}</p>}
                </div>
                {isEditor && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => reabrir(v)}>Liberar</Button>
                    <Button size="sm" variant="ghost" onClick={() => cancelar(v)}>Cancelar</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {outras.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-muted-foreground text-sm">Histórico</h3>
          <div className="space-y-1 text-sm">
            {outras.map(v => (
              <div key={v.id} className="flex justify-between text-muted-foreground">
                <span>{format(new Date(v.data_hora), "dd/MM HH:mm")} — {v.status}</span>
                {v.status === "realizado" && <CheckCircle2 className="h-3 w-3 text-primary" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}