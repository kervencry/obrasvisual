import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pause, Play, Trash2 } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

const MOTIVOS = ["chuva", "falta_material", "falta_pagamento", "espera_aprovacao", "problema_tecnico", "outro"];

export default function ParalisacoesTab({ obraId, userId, isEditor }: { obraId: string; userId: string; isEditor: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ motivo: "chuva", data_inicio: new Date().toISOString().slice(0, 10), descricao: "" });

  async function load() {
    const { data } = await supabase.from("paralisacoes_obra").select("*").eq("obra_id", obraId).order("data_inicio", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, [obraId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.data_inicio) { toast.error("Informe a data."); return; }
    const { error } = await supabase.from("paralisacoes_obra").insert({
      obra_id: obraId, criado_por: userId,
      motivo: f.motivo, data_inicio: f.data_inicio, descricao: f.descricao || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Paralisação registrada.");
    setF({ motivo: "chuva", data_inicio: new Date().toISOString().slice(0, 10), descricao: "" });
    load();
  }

  async function retomar(row: any) {
    await supabase.from("paralisacoes_obra").update({ data_fim: new Date().toISOString().slice(0, 10) }).eq("id", row.id);
    toast.success("Obra retomada.");
    load();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este registro?")) return;
    await supabase.from("paralisacoes_obra").delete().eq("id", id);
    load();
  }

  const ativas = rows.filter(r => !r.data_fim);
  const historico = rows.filter(r => r.data_fim);

  return (
    <div className="space-y-4">
      {ativas.length > 0 && (
        <Card className="p-4 border-destructive/40 bg-destructive/5">
          <div className="flex items-center gap-2 mb-2">
            <Pause className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold text-destructive">Obra paralisada</h3>
          </div>
          {ativas.map(a => (
            <div key={a.id} className="flex justify-between items-start gap-3 py-2 border-t border-destructive/20 first:border-0">
              <div>
                <p className="text-sm"><Badge variant="destructive" className="mr-2">{a.motivo}</Badge>Desde {format(parseISO(a.data_inicio), "dd/MM/yyyy")} · {differenceInDays(new Date(), parseISO(a.data_inicio))} dias parada</p>
                {a.descricao && <p className="text-xs text-muted-foreground mt-1">{a.descricao}</p>}
              </div>
              {isEditor && (
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => retomar(a)}><Play className="h-3 w-3 mr-1" />Retomar</Button>
                  <Button size="sm" variant="ghost" onClick={() => excluir(a.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {isEditor && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Registrar paralisação</h3>
          <form onSubmit={add} className="grid sm:grid-cols-3 gap-3 items-end">
            <div>
              <Label>Motivo</Label>
              <Select value={f.motivo} onValueChange={v => setF({ ...f, motivo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MOTIVOS.map(m => <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Início</Label><Input type="date" value={f.data_inicio} onChange={e => setF({ ...f, data_inicio: e.target.value })} /></div>
            <Button type="submit">Registrar</Button>
            <div className="sm:col-span-3"><Label>Descrição</Label><Textarea rows={2} value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} /></div>
          </form>
        </Card>
      )}

      {historico.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Histórico</h3>
          <div className="space-y-2">
            {historico.map(h => (
              <Card key={h.id} className="p-3 text-sm">
                <div className="flex justify-between">
                  <span><Badge variant="outline" className="mr-2">{h.motivo}</Badge>{format(parseISO(h.data_inicio), "dd/MM/yyyy")} → {format(parseISO(h.data_fim), "dd/MM/yyyy")} ({differenceInDays(parseISO(h.data_fim), parseISO(h.data_inicio))} dias)</span>
                  {isEditor && <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => excluir(h.id)}>excluir</button>}
                </div>
                {h.descricao && <p className="text-xs text-muted-foreground mt-1">{h.descricao}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}