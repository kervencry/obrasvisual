import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function ChecklistEtapa({
  open, onOpenChange, etapaRow, obra, userId, onCompletar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  etapaRow: any;
  obra: any;
  userId: string;
  onCompletar?: () => void;
}) {
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [novo, setNovo] = useState("");

  async function load() {
    if (!etapaRow) return;
    setLoading(true);
    const { data } = await (supabase as any).from("checklist_etapa")
      .select("*").eq("etapa_id", etapaRow.id).order("ordem");
    setItens(data ?? []);
    setLoading(false);
  }
  useEffect(() => { if (open) load(); }, [open, etapaRow?.id]);

  async function sugerir() {
    setGerando(true);
    try {
      const { data, error } = await supabase.functions.invoke("checklist-sugerir", {
        body: { etapa: etapaRow.etapa, tipoObra: obra.tipo },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const itensIA: string[] = (data as any).itens ?? [];
      const rows = itensIA.map((item, i) => ({
        etapa_id: etapaRow.id, obra_id: obra.id, item, ordem: itens.length + i,
      }));
      if (rows.length) {
        await (supabase as any).from("checklist_etapa").insert(rows);
      }
      load();
      toast.success(`${itensIA.length} itens sugeridos pela IA`);
    } catch (e: any) {
      toast.error(e.message || "Falha ao sugerir");
    } finally {
      setGerando(false);
    }
  }

  async function adicionar() {
    if (!novo.trim()) return;
    await (supabase as any).from("checklist_etapa").insert({
      etapa_id: etapaRow.id, obra_id: obra.id, item: novo.trim(), ordem: itens.length,
    });
    setNovo("");
    load();
  }

  async function toggle(id: string, val: boolean) {
    await (supabase as any).from("checklist_etapa").update({
      concluido: val,
      concluido_por: val ? userId : null,
      concluido_em: val ? new Date().toISOString() : null,
    }).eq("id", id);
    load();
  }

  async function remover(id: string) {
    await (supabase as any).from("checklist_etapa").delete().eq("id", id);
    load();
  }

  const total = itens.length;
  const feitos = itens.filter((i) => i.concluido).length;
  const todosOk = total > 0 && feitos === total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="capitalize">Checklist técnico — {etapaRow?.etapa}</DialogTitle>
        </DialogHeader>

        {itens.length === 0 && !loading && (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">Nenhum item ainda. Gere sugestões de qualidade e segurança com IA para esta etapa.</p>
            <Button onClick={sugerir} disabled={gerando}>
              {gerando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
              Sugerir itens com IA
            </Button>
          </div>
        )}

        {itens.length > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{feitos} de {total} itens conferidos</span>
              <Button size="sm" variant="ghost" onClick={sugerir} disabled={gerando}>
                {gerando ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Sugerir mais
              </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {itens.map((it) => (
                <div key={it.id} className="flex items-start gap-2 group">
                  <Checkbox checked={it.concluido} onCheckedChange={(v) => toggle(it.id, !!v)} className="mt-0.5" />
                  <span className={`text-sm flex-1 ${it.concluido ? "line-through text-muted-foreground" : ""}`}>{it.item}</span>
                  <button onClick={() => remover(it.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Input placeholder="Adicionar item manualmente..." value={novo} onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()} />
          <Button size="icon" variant="secondary" onClick={adicionar}><Plus className="h-4 w-4" /></Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          {onCompletar && (
            <Button onClick={() => { onCompletar(); onOpenChange(false); }} disabled={!todosOk}>
              {todosOk ? "Concluir etapa" : `Marcar todos para concluir (${feitos}/${total})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}