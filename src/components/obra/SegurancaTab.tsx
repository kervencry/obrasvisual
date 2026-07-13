import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { HardHat, Plus, Trash2, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const ITENS_NR18 = [
  "EPIs disponíveis e em uso (capacete, luva, botina, óculos)",
  "Proteção coletiva instalada (guarda-corpo, telas, redes)",
  "Área de vivência (sanitário, refeitório, água potável)",
  "Instalações elétricas provisórias protegidas",
  "Sinalização de segurança visível",
  "Andaimes montados e travados corretamente",
  "Escadas e rampas em boas condições",
  "Extintores de incêndio no prazo",
  "Ferramentas e máquinas em boas condições",
  "Descarte adequado de entulho",
];

const STATUS_META: Record<string, { label: string; badge: any; Icon: any }> = {
  ok:      { label: "Conforme",  badge: "default",     Icon: ShieldCheck },
  atencao: { label: "Atenção",   badge: "secondary",   Icon: ShieldAlert },
  critico: { label: "Crítico",   badge: "destructive", Icon: ShieldX },
};

export default function SegurancaTab({ obraId, canEdit, userId }: { obraId: string; canEdit: boolean; userId?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [item, setItem] = useState(ITENS_NR18[0]);
  const [status, setStatus] = useState("ok");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase.from("seguranca_registros")
      .select("*").eq("obra_id", obraId).order("data", { ascending: false }).order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [obraId]);

  async function adicionar() {
    if (!item.trim()) { toast.error("Informe o item"); return; }
    setSaving(true);
    const { error } = await supabase.from("seguranca_registros").insert({
      obra_id: obraId, user_id: userId, item, status, descricao: descricao.trim() || null,
      tipo: status === "ok" ? "checklist" : "ocorrencia",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setDescricao(""); setStatus("ok");
    toast.success("Registro adicionado");
    refresh();
  }

  async function remover(id: string) {
    if (!confirm("Remover registro?")) return;
    await supabase.from("seguranca_registros").delete().eq("id", id);
    refresh();
  }

  const contadores = {
    ok: rows.filter(r => r.status === "ok").length,
    atencao: rows.filter(r => r.status === "atencao").length,
    critico: rows.filter(r => r.status === "critico").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HardHat className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-extrabold">Segurança da obra (NR-18)</h2>
          <p className="text-sm text-muted-foreground">Checklist e ocorrências de segurança no canteiro.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <ShieldCheck className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-extrabold">{contadores.ok}</p>
          <p className="text-xs text-muted-foreground">Conformes</p>
        </Card>
        <Card className="p-3 text-center">
          <ShieldAlert className="h-5 w-5 mx-auto text-accent mb-1" />
          <p className="text-2xl font-extrabold">{contadores.atencao}</p>
          <p className="text-xs text-muted-foreground">Atenção</p>
        </Card>
        <Card className="p-3 text-center">
          <ShieldX className="h-5 w-5 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-extrabold">{contadores.critico}</p>
          <p className="text-xs text-muted-foreground">Críticos</p>
        </Card>
      </div>

      {canEdit && (
        <Card className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Item / verificação</Label>
              <Select value={item} onValueChange={setItem}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ITENS_NR18.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  <SelectItem value="__custom__">Outro (personalizado)…</SelectItem>
                </SelectContent>
              </Select>
              {item === "__custom__" && (
                <Input className="mt-2" placeholder="Descreva o item"
                  onChange={e => setItem(e.target.value)} />
              )}
            </div>
            <div>
              <Label>Situação</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">Conforme</SelectItem>
                  <SelectItem value="atencao">Atenção</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Observação (opcional)</Label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)}
              placeholder="Detalhes, providências, responsável…" rows={2} />
          </div>
          <Button onClick={adicionar} disabled={saving} className="gap-2">
            <Plus className="h-4 w-4" />Registrar
          </Button>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">Nenhum registro de segurança ainda.</Card>
      ) : (
        <div className="space-y-2">
          {rows.map(r => {
            const meta = STATUS_META[r.status] ?? STATUS_META.ok;
            const Icon = meta.Icon;
            return (
              <Card key={r.id} className="p-3 flex items-start gap-3">
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${
                  r.status === "critico" ? "text-destructive" :
                  r.status === "atencao" ? "text-accent" : "text-primary"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-semibold">{r.item}</p>
                    <Badge variant={meta.badge}>{meta.label}</Badge>
                  </div>
                  {r.descricao && <p className="text-sm text-muted-foreground mt-1">{r.descricao}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(r.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {canEdit && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remover(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}