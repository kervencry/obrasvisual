import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Check, FileUp } from "lucide-react";

export default function OrcamentosTab({ obraId, userId, isEditor }: { obraId: string; userId: string; isEditor: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ item: "", fornecedor: "", valor: "", prazo_entrega: "", observacoes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("orcamentos_fornecedores").select("*").eq("obra_id", obraId).order("item").order("valor");
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, [obraId]);

  async function addOrc(e: React.FormEvent) {
    e.preventDefault();
    if (!f.item.trim() || !f.fornecedor.trim() || !f.valor) { toast.error("Preencha item, fornecedor e valor."); return; }
    setSaving(true);
    let arquivo_url: string | null = null;
    if (file) {
      const path = `${obraId}/orcamentos/${Date.now()}-${file.name}`;
      const up = await supabase.storage.from("documentos").upload(path, file);
      if (!up.error) arquivo_url = supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("orcamentos_fornecedores").insert({
      obra_id: obraId, criado_por: userId,
      item: f.item.trim(), fornecedor: f.fornecedor.trim(),
      valor: Number(f.valor), prazo_entrega: f.prazo_entrega || null,
      observacoes: f.observacoes || null, arquivo_url,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Orçamento adicionado.");
    setF({ item: "", fornecedor: "", valor: "", prazo_entrega: "", observacoes: "" });
    setFile(null);
    load();
  }

  async function selecionar(o: any) {
    await supabase.from("orcamentos_fornecedores").update({ selecionado: false }).eq("obra_id", obraId).eq("item", o.item);
    await supabase.from("orcamentos_fornecedores").update({ selecionado: true }).eq("id", o.id);
    toast.success(`${o.fornecedor} selecionado para ${o.item}.`, {
      action: {
        label: "Lançar em Financeiro",
        onClick: async () => {
          const { error } = await supabase.from("financeiro").insert({
            obra_id: obraId, user_id: userId,
            tipo: "gasto" as any, categoria: o.item, descricao: `${o.item} — ${o.fornecedor}`,
            valor: o.valor, data: new Date().toISOString().slice(0, 10),
          } as any);
          if (error) toast.error(error.message); else toast.success("Lançado no Financeiro.");
        },
      },
    });
    load();
  }

  async function excluir(id: string) {
    await supabase.from("orcamentos_fornecedores").delete().eq("id", id);
    load();
  }

  const grupos: Record<string, any[]> = {};
  rows.forEach(r => { (grupos[r.item] ||= []).push(r); });

  return (
    <div className="space-y-4">
      {isEditor && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" />Novo orçamento</h3>
          <form onSubmit={addOrc} className="grid sm:grid-cols-3 gap-3">
            <div><Label>Item</Label><Input value={f.item} onChange={e => setF({ ...f, item: e.target.value })} placeholder="Esquadrias, cimento..." /></div>
            <div><Label>Fornecedor</Label><Input value={f.fornecedor} onChange={e => setF({ ...f, fornecedor: e.target.value })} /></div>
            <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={f.valor} onChange={e => setF({ ...f, valor: e.target.value })} /></div>
            <div><Label>Prazo entrega</Label><Input value={f.prazo_entrega} onChange={e => setF({ ...f, prazo_entrega: e.target.value })} placeholder="Ex: 15 dias" /></div>
            <div className="sm:col-span-2"><Label>Anexo (PDF/imagem)</Label><Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
            <div className="sm:col-span-3"><Label>Observações</Label><Textarea rows={2} value={f.observacoes} onChange={e => setF({ ...f, observacoes: e.target.value })} /></div>
            <Button type="submit" disabled={saving} className="sm:col-span-3">{saving ? "Salvando..." : "Adicionar orçamento"}</Button>
          </form>
        </Card>
      )}

      {Object.keys(grupos).length === 0 ? <p className="text-muted-foreground">Nenhum orçamento cadastrado.</p> :
        Object.entries(grupos).map(([item, arr]) => {
          const minValor = Math.min(...arr.map((x: any) => Number(x.valor)));
          return (
            <div key={item}>
              <h4 className="font-semibold mb-2">{item} <span className="text-xs text-muted-foreground">({arr.length} cotações)</span></h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {arr.map((o: any) => (
                  <Card key={o.id} className={`p-3 ${o.selecionado ? "border-primary border-2" : ""}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold">{o.fornecedor}</p>
                        <p className="text-lg font-bold text-primary">R$ {Number(o.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        {Number(o.valor) === minValor && arr.length > 1 && <Badge className="mt-1" variant="secondary">Menor preço</Badge>}
                      </div>
                      {o.selecionado && <Badge className="shrink-0"><Check className="h-3 w-3 mr-1" />Selecionado</Badge>}
                    </div>
                    {o.prazo_entrega && <p className="text-xs text-muted-foreground mt-2">Prazo: {o.prazo_entrega}</p>}
                    {o.observacoes && <p className="text-xs mt-1">{o.observacoes}</p>}
                    {o.arquivo_url && <a href={o.arquivo_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 inline-flex items-center gap-1"><FileUp className="h-3 w-3" />Ver anexo</a>}
                    {isEditor && (
                      <div className="mt-2 flex gap-2">
                        {!o.selecionado && <Button size="sm" variant="outline" onClick={() => selecionar(o)}>Selecionar</Button>}
                        <Button size="sm" variant="ghost" onClick={() => excluir(o.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}