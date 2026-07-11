import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Copy, Check, Trash2, Building, Home, ExternalLink } from "lucide-react";
import { STAGES } from "./AnimatedHouse";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  obraId: string;
  canEdit: boolean;
}

export default function UnidadesTab({ obraId, canEdit }: Props) {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState("apartamento");
  const [novoIdent, setNovoIdent] = useState("");
  const [criando, setCriando] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [etapasSel, setEtapasSel] = useState<any[]>([]);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase.from("unidades").select("*").eq("obra_id", obraId).order("ordem").order("nome");
    setUnidades(data ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [obraId]);

  async function criar() {
    if (!novoNome.trim()) { toast.error("Informe o nome da unidade"); return; }
    setCriando(true);
    const { error } = await supabase.from("unidades").insert({
      obra_id: obraId, nome: novoNome.trim(), tipo: novoTipo,
      identificador: novoIdent.trim() || null, ordem: unidades.length,
    });
    setCriando(false);
    if (error) { toast.error(error.message); return; }
    setNovoNome(""); setNovoIdent("");
    toast.success("Unidade criada");
    refresh();
  }

  async function remover(u: any) {
    if (!confirm(`Remover ${u.nome}? Todos os dados da unidade serão perdidos.`)) return;
    await supabase.from("unidades").delete().eq("id", u.id);
    toast.success("Unidade removida");
    refresh();
  }

  function copiar(txt: string) {
    navigator.clipboard.writeText(txt);
    toast.success("Copiado");
  }

  async function abrirDetalhe(u: any) {
    setSel(u);
    const { data } = await supabase.from("unidade_etapas").select("*").eq("unidade_id", u.id).order("ordem");
    setEtapasSel(data ?? []);
  }

  async function toggleEtapa(row: any) {
    const nova = !row.concluida;
    await supabase.from("unidade_etapas").update({
      concluida: nova, data_conclusao: nova ? new Date().toISOString() : null,
    }).eq("id", row.id);

    const etapasAtualizadas = etapasSel.map(e => e.id === row.id ? { ...e, concluida: nova } : e);
    setEtapasSel(etapasAtualizadas);

    // recomputa % da unidade
    const concluidas = etapasAtualizadas.filter(e => e.concluida);
    const maiorPct = concluidas.length ? Math.max(...concluidas.map(e => e.percentual)) : 0;
    const etapaAtual = concluidas.length ? concluidas.sort((a,b)=>b.percentual-a.percentual)[0].etapa : "terreno";
    const finalizada = etapasAtualizadas.every(e => e.concluida);
    await supabase.from("unidades").update({
      percentual: maiorPct, etapa_atual: etapaAtual, concluida: finalizada,
    }).eq("id", sel.id);
    refresh();
    setSel({ ...sel, percentual: maiorPct, etapa_atual: etapaAtual, concluida: finalizada });
  }

  const linkPublico = (u: any) => `${window.location.origin}/unidade/${u.id}?t=${u.publico_token}`;

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Carregando unidades…</div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold">Unidades da obra</h2>
        <p className="text-sm text-muted-foreground">
          Ideal para prédios e condomínios: cada apartamento/casa tem token próprio e o cliente só vê o progresso da unidade dele.
        </p>
      </div>

      {canEdit && (
        <Card className="p-4">
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <Label>Nome</Label>
              <Input value={novoNome} onChange={e=>setNovoNome(e.target.value)} placeholder="Ex: Apto 101 / Casa 3" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={novoTipo} onValueChange={setNovoTipo}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="sala">Sala comercial</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bloco / ident.</Label>
              <Input value={novoIdent} onChange={e=>setNovoIdent(e.target.value)} placeholder="Ex: Bloco A" />
            </div>
          </div>
          <Button onClick={criar} disabled={criando} className="mt-3 gap-2">
            <Plus className="h-4 w-4"/> Adicionar unidade
          </Button>
        </Card>
      )}

      {unidades.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Nenhuma unidade cadastrada ainda.
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {unidades.map(u => (
            <Card key={u.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {u.tipo === "casa" ? <Home className="h-4 w-4 text-primary"/> : <Building className="h-4 w-4 text-primary"/>}
                    <p className="font-bold truncate">{u.nome}</p>
                  </div>
                  {u.identificador && <p className="text-xs text-muted-foreground">{u.identificador}</p>}
                </div>
                {u.concluida ? <Badge className="gap-1"><Check className="h-3 w-3"/>Concluída</Badge>
                  : <Badge variant="outline">{u.percentual}%</Badge>}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize text-muted-foreground">{u.etapa_atual}</span>
                  <span className="font-bold">{u.percentual}%</span>
                </div>
                <Progress value={u.percentual} className="h-2"/>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={()=>abrirDetalhe(u)}>Checklist</Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={()=>copiar(u.publico_token)}>
                  <Copy className="h-3 w-3"/>Token
                </Button>
                <a href={linkPublico(u)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost" className="gap-1"><ExternalLink className="h-3 w-3"/>Portal</Button>
                </a>
                {canEdit && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={()=>remover(u)}>
                    <Trash2 className="h-3 w-3"/>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!sel} onOpenChange={o => { if (!o) setSel(null); }}>
        <DialogContent className="max-w-lg">
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle>{sel.nome} — checklist de etapas</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {etapasSel.map(e => (
                  <button
                    key={e.id}
                    disabled={!canEdit}
                    onClick={()=>toggleEtapa(e)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition ${
                      e.concluida ? "bg-primary/10 border-primary" : "border-border hover:bg-muted/50"
                    } ${!canEdit ? "opacity-70 cursor-default" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${e.concluida ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                        {e.concluida && <Check className="h-3 w-3 text-primary-foreground"/>}
                      </div>
                      <span className="capitalize font-medium">{e.etapa}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{e.percentual}%</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/40 space-y-2">
                <p className="text-xs text-muted-foreground">Compartilhe com o cliente da unidade:</p>
                <div className="flex items-center gap-2">
                  <Input readOnly value={sel.publico_token} className="font-mono text-xs"/>
                  <Button size="sm" variant="outline" onClick={()=>copiar(sel.publico_token)}><Copy className="h-3 w-3"/></Button>
                </div>
                <div className="flex justify-center pt-2">
                  <div className="bg-white p-2 rounded">
                    <QRCodeCanvas value={`${window.location.origin}/unidade/${sel.id}?t=${sel.publico_token}`} size={140}/>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}