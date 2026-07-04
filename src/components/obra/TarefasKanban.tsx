import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Check, Trash2, Calendar, Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";

type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel_id: string | null;
  prazo: string | null;
  status: "a_fazer" | "em_andamento" | "concluida";
  foto_url: string | null;
  concluida_em: string | null;
  criado_por: string;
};

const COLUNAS: { key: Tarefa["status"]; label: string; color: string }[] = [
  { key: "a_fazer", label: "A fazer", color: "border-muted-foreground/30" },
  { key: "em_andamento", label: "Em andamento", color: "border-accent/40" },
  { key: "concluida", label: "Concluída", color: "border-primary/40" },
];

export default function TarefasKanban({
  obraId, userId, membros,
}: { obraId: string; userId: string; membros: { user_id: string; nome: string }[] }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", responsavel_id: "", prazo: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await (supabase as any).from("tarefas_obra")
      .select("*").eq("obra_id", obraId).order("created_at", { ascending: false });
    setTarefas(data ?? []);
  }
  useEffect(() => { load(); }, [obraId]);

  const nomePor = (uid: string | null) =>
    membros.find((m) => m.user_id === uid)?.nome ?? (uid ? "Sem nome" : "—");

  async function criar() {
    if (!form.titulo.trim()) return toast.error("Título obrigatório");
    setSaving(true);
    const { error } = await (supabase as any).from("tarefas_obra").insert({
      obra_id: obraId, criado_por: userId,
      titulo: form.titulo, descricao: form.descricao || null,
      responsavel_id: form.responsavel_id || null,
      prazo: form.prazo || null,
      status: "a_fazer",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    setForm({ titulo: "", descricao: "", responsavel_id: "", prazo: "" });
    setOpen(false);
    toast.success("Tarefa criada");
    load();
  }

  async function mudarStatus(t: Tarefa, s: Tarefa["status"]) {
    const patch: any = { status: s };
    if (s === "concluida") patch.concluida_em = new Date().toISOString();
    else patch.concluida_em = null;
    await (supabase as any).from("tarefas_obra").update(patch).eq("id", t.id);
    load();
  }

  async function anexarFoto(t: Tarefa, file: File) {
    const path = `${userId}/${obraId}/tarefas/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("fotos-obras").upload(path, file);
    if (upErr) return toast.error(upErr.message);
    const { data: { publicUrl } } = supabase.storage.from("fotos-obras").getPublicUrl(path);
    await (supabase as any).from("tarefas_obra").update({
      foto_url: publicUrl, status: "concluida", concluida_em: new Date().toISOString(),
    }).eq("id", t.id);
    // sugerir entrada no diário
    try {
      await supabase.from("diario_obra").insert({
        obra_id: obraId, user_id: userId,
        titulo: `Tarefa concluída: ${t.titulo}`,
        conteudo: `Tarefa "${t.titulo}" foi concluída${t.descricao ? " — " + t.descricao : ""}. Comprovação anexada.`,
      });
    } catch {}
    toast.success("Tarefa concluída com foto e registrada no diário");
    load();
  }

  async function remover(id: string) {
    if (!confirm("Excluir esta tarefa?")) return;
    await (supabase as any).from("tarefas_obra").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Quadro de tarefas</h3>
          <p className="text-xs text-muted-foreground">Delegue e acompanhe atividades da equipe da obra</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova tarefa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova tarefa</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Comprar 20 sacos de cimento" /></div>
              <div><Label>Descrição (opcional)</Label><Textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Responsável</Label>
                  <Select value={form.responsavel_id} onValueChange={(v) => setForm({ ...form, responsavel_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {membros.map((m) => (
                        <SelectItem key={m.user_id} value={m.user_id}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prazo</Label>
                  <Input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={criar} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COLUNAS.map((col) => {
          const items = tarefas.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className={`rounded-2xl border-2 border-dashed ${col.color} p-3 bg-muted/20 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className="text-sm font-bold uppercase tracking-wider">{col.label}</h4>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <TarefaCard
                    key={t.id} t={t} col={col.key} nomeResponsavel={nomePor(t.responsavel_id)}
                    onStatus={(s) => mudarStatus(t, s)}
                    onFoto={(f) => anexarFoto(t, f)}
                    onRemover={() => remover(t.id)}
                    podeEditar={t.criado_por === userId || t.responsavel_id === userId}
                  />
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Vazio</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TarefaCard({
  t, col, nomeResponsavel, onStatus, onFoto, onRemover, podeEditar,
}: {
  t: Tarefa; col: Tarefa["status"]; nomeResponsavel: string;
  onStatus: (s: Tarefa["status"]) => void; onFoto: (f: File) => void;
  onRemover: () => void; podeEditar: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const atrasada = t.prazo && t.status !== "concluida" && isBefore(new Date(t.prazo), startOfDay(new Date()));
  return (
    <Card className={`p-3 space-y-2 ${atrasada ? "border-destructive/50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold flex-1">{t.titulo}</p>
        <button onClick={onRemover} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {t.descricao && <p className="text-xs text-muted-foreground">{t.descricao}</p>}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{nomeResponsavel}</span>
        {t.prazo && (
          <span className={`inline-flex items-center gap-1 ${atrasada ? "text-destructive font-medium" : ""}`}>
            <Calendar className="h-3 w-3" />{format(new Date(t.prazo), "dd/MM")}
            {atrasada && " (atrasada)"}
          </span>
        )}
      </div>
      {t.foto_url && (
        <img src={t.foto_url} alt="" className="w-full h-24 object-cover rounded" />
      )}
      {podeEditar && col !== "concluida" && (
        <div className="flex gap-1">
          {col === "a_fazer" && (
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => onStatus("em_andamento")}>Iniciar</Button>
          )}
          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => fileRef.current?.click()}>
            <Camera className="h-3 w-3 mr-1" />Concluir c/ foto
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={() => onStatus("concluida")}>
            <Check className="h-3 w-3" />
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && onFoto(e.target.files[0])} />
        </div>
      )}
      {podeEditar && col === "concluida" && (
        <Button size="sm" variant="ghost" className="w-full h-7 text-xs" onClick={() => onStatus("a_fazer")}>Reabrir</Button>
      )}
    </Card>
  );
}