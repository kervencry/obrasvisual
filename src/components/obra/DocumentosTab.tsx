import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileUp, Trash2, AlertTriangle, FileText, Download } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPOS = ["alvara", "art", "seguro", "licenca", "contrato", "planta", "nota_fiscal", "outro"];

export default function DocumentosTab({ obraId, userId, isEditor }: { obraId: string; userId: string; isEditor: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ nome: "", tipo: "outro", data_validade: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("documentos_obra").select("*").eq("obra_id", obraId).order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, [obraId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.nome.trim() || !file) { toast.error("Informe nome e arquivo."); return; }
    setSaving(true);
    const path = `${obraId}/docs/${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("documentos").upload(path, file);
    if (up.error) { setSaving(false); toast.error(up.error.message); return; }
    const { error } = await supabase.from("documentos_obra").insert({
      obra_id: obraId, criado_por: userId,
      nome: f.nome.trim(), tipo: f.tipo,
      data_validade: f.data_validade || null,
      arquivo_url: path,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Documento enviado.");
    setF({ nome: "", tipo: "outro", data_validade: "" });
    setFile(null);
    load();
  }

  async function baixar(path: string) {
    const { data, error } = await supabase.storage.from("documentos").createSignedUrl(path, 300);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, "_blank");
  }

  async function excluir(row: any) {
    if (!confirm("Excluir este documento?")) return;
    if (row.arquivo_url) await supabase.storage.from("documentos").remove([row.arquivo_url]);
    await supabase.from("documentos_obra").delete().eq("id", row.id);
    load();
  }

  function statusValidade(d: string | null) {
    if (!d) return null;
    const dias = differenceInDays(parseISO(d), new Date());
    if (dias < 0) return { label: "Vencido", variant: "destructive" as const };
    if (dias <= 30) return { label: `Vence em ${dias}d`, variant: "secondary" as const, warn: true };
    return { label: `Válido até ${format(parseISO(d), "dd/MM/yyyy")}`, variant: "outline" as const };
  }

  const vencendo = rows.filter(r => r.data_validade && differenceInDays(parseISO(r.data_validade), new Date()) <= 30);

  return (
    <div className="space-y-4">
      {vencendo.length > 0 && (
        <Card className="p-3 border-amber-500/40 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{vencendo.length} documento(s) vencendo ou vencido(s)</span>
          </div>
        </Card>
      )}

      {isEditor && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FileUp className="h-4 w-4" />Enviar documento</h3>
          <form onSubmit={add} className="grid sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2"><Label>Nome</Label><Input value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Alvará municipal 2026" /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={f.tipo} onValueChange={v => setF({ ...f, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Validade</Label><Input type="date" value={f.data_validade} onChange={e => setF({ ...f, data_validade: e.target.value })} /></div>
            <div className="sm:col-span-3"><Label>Arquivo</Label><Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
            <Button type="submit" disabled={saving}>{saving ? "Enviando..." : "Enviar"}</Button>
          </form>
        </Card>
      )}

      {rows.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum documento cadastrado.</p> :
        <div className="space-y-2">
          {rows.map(r => {
            const st = statusValidade(r.data_validade);
            return (
              <Card key={r.id} className="p-3 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.nome}</p>
                    <p className="text-xs text-muted-foreground">{r.tipo} · Enviado {format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {st && <Badge variant={st.variant}>{st.label}</Badge>}
                  {r.arquivo_url && <Button size="sm" variant="outline" onClick={() => baixar(r.arquivo_url)}><Download className="h-3 w-3 mr-1" />Baixar</Button>}
                  {isEditor && <Button size="sm" variant="ghost" onClick={() => excluir(r)}><Trash2 className="h-3 w-3" /></Button>}
                </div>
              </Card>
            );
          })}
        </div>
      }
    </div>
  );
}