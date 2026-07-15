import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck, Plus, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Item = { texto: string; ok: boolean };
type Inspecao = {
  id: string; tipo: "FVS" | "FVM"; titulo: string; etapa: string | null;
  status: "pendente" | "conforme" | "nao_conforme"; responsavel: string | null;
  data_inspecao: string; itens: Item[]; nao_conformidade: string | null; observacoes: string | null;
};

const TEMPLATES: Record<string, string[]> = {
  "FVS - Fundação": ["Cota de fundo conferida", "Armadura conforme projeto", "Cobrimento adequado", "Concreto slump testado", "Cura protegida"],
  "FVS - Alvenaria": ["Prumo verificado", "Nível verificado", "Argamassa dentro do traço", "Amarração correta", "Vãos conferidos"],
  "FVS - Contrapiso": ["Espessura mínima 3cm", "Nivelamento a régua", "Cura mínima 3 dias", "Sem trincas visíveis"],
  "FVS - Revestimento cerâmico": ["Substrato limpo e sem pó", "Argamassa colante correta", "Rejunte uniforme", "Nível e prumo ok"],
  "FVM - Cimento": ["Embalagem íntegra", "Data de fabricação < 60 dias", "Armazenagem em pallet", "Lote registrado"],
  "FVM - Aço": ["Bitola conforme projeto", "Certificado do fabricante", "Sem oxidação excessiva", "Estocagem correta"],
  "FVM - Cerâmica/Piso": ["PEI adequado ao ambiente", "Lote único", "Embalagens íntegras", "Quantidade conforme pedido"],
};

export default function InspecoesTab({ obraId, canEdit }: { obraId: string; canEdit: boolean }) {
  const [rows, setRows] = useState<Inspecao[]>([]);
  const [openNova, setOpenNova] = useState(false);
  const [openDet, setOpenDet] = useState<Inspecao | null>(null);

  const [tipo, setTipo] = useState<"FVS" | "FVM">("FVS");
  const [titulo, setTitulo] = useState("");
  const [etapa, setEtapa] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [template, setTemplate] = useState("");
  const [itens, setItens] = useState<Item[]>([]);
  const [novoItem, setNovoItem] = useState("");

  async function refresh() {
    const { data } = await supabase.from("inspecoes_qualidade").select("*").eq("obra_id", obraId).order("data_inspecao", { ascending: false });
    setRows((data ?? []) as any);
  }
  useEffect(() => { refresh(); }, [obraId]);

  function aplicarTemplate(k: string) {
    setTemplate(k);
    setTitulo(k);
    setTipo(k.startsWith("FVM") ? "FVM" : "FVS");
    setItens((TEMPLATES[k] ?? []).map(t => ({ texto: t, ok: false })));
  }

  async function salvar() {
    if (!titulo.trim() || itens.length === 0) return toast.error("Título e ao menos 1 item");
    const { error } = await supabase.from("inspecoes_qualidade").insert({
      obra_id: obraId, tipo, titulo, etapa: etapa || null, responsavel: responsavel || null,
      itens: itens as any, status: "pendente",
    });
    if (error) return toast.error(error.message);
    toast.success("Inspeção criada");
    setOpenNova(false); setTitulo(""); setEtapa(""); setResponsavel(""); setItens([]); setTemplate("");
    refresh();
  }

  async function toggleItem(insp: Inspecao, idx: number) {
    const novos = insp.itens.map((it, i) => i === idx ? { ...it, ok: !it.ok } : it);
    await supabase.from("inspecoes_qualidade").update({ itens: novos as any }).eq("id", insp.id);
    setOpenDet({ ...insp, itens: novos });
    refresh();
  }

  async function finalizar(insp: Inspecao, status: "conforme" | "nao_conforme", ncTexto?: string) {
    const { error } = await supabase.from("inspecoes_qualidade").update({
      status, nao_conformidade: status === "nao_conforme" ? (ncTexto ?? insp.nao_conformidade) : null,
    }).eq("id", insp.id);
    if (error) return toast.error(error.message);
    toast.success(status === "conforme" ? "Aprovada" : "Registrada não-conformidade");
    setOpenDet(null); refresh();
  }

  async function apagar(id: string) {
    if (!confirm("Remover esta inspeção?")) return;
    await supabase.from("inspecoes_qualidade").delete().eq("id", id);
    refresh();
  }

  const statusBadge = (s: string) => {
    if (s === "conforme") return <Badge className="bg-green-600 gap-1"><CheckCircle2 className="h-3 w-3" />Conforme</Badge>;
    if (s === "nao_conforme") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Não conforme</Badge>;
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Inspeções de qualidade (FVS / FVM)</h2>
        </div>
        {canEdit && (
          <Dialog open={openNova} onOpenChange={setOpenNova}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova inspeção</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova ficha de inspeção</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Usar modelo</Label>
                  <Select value={template} onValueChange={aplicarTemplate}>
                    <SelectTrigger><SelectValue placeholder="Escolha um modelo (opcional)" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(TEMPLATES).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FVS">FVS — Serviço</SelectItem>
                        <SelectItem value="FVM">FVM — Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Etapa</Label><Input value={etapa} onChange={e => setEtapa(e.target.value)} placeholder="Fundação, Alvenaria..." /></div>
                </div>
                <div><Label>Título</Label><Input value={titulo} onChange={e => setTitulo(e.target.value)} /></div>
                <div><Label>Responsável</Label><Input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Eng. / Mestre responsável" /></div>
                <div>
                  <Label>Itens a verificar</Label>
                  <div className="space-y-1 mb-2 max-h-40 overflow-y-auto">
                    {itens.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-sm border rounded px-2 py-1">
                        <span>{it.texto}</span>
                        <Button size="sm" variant="ghost" onClick={() => setItens(itens.filter((_, x) => x !== i))}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Input value={novoItem} onChange={e => setNovoItem(e.target.value)} placeholder="Adicionar item personalizado" />
                    <Button size="sm" variant="outline" onClick={() => { if (novoItem.trim()) { setItens([...itens, { texto: novoItem.trim(), ok: false }]); setNovoItem(""); }}}>+</Button>
                  </div>
                </div>
                <Button onClick={salvar} className="w-full">Criar inspeção</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">Nenhuma inspeção registrada.</Card>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {rows.map(r => (
            <Card key={r.id} className="p-3 cursor-pointer hover:border-primary" onClick={() => setOpenDet(r)}>
              <div className="flex justify-between items-start gap-2 mb-1">
                <div>
                  <p className="font-bold text-sm">{r.titulo}</p>
                  <p className="text-xs text-muted-foreground">{r.tipo}{r.etapa ? ` · ${r.etapa}` : ""} · {format(new Date(r.data_inspecao), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                {statusBadge(r.status)}
              </div>
              <div className="text-xs text-muted-foreground">
                {r.itens.filter(i => i.ok).length}/{r.itens.length} itens verificados
                {r.responsavel && ` · ${r.responsavel}`}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!openDet} onOpenChange={(v) => !v && setOpenDet(null)}>
        <DialogContent>
          {openDet && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {openDet.titulo} {statusBadge(openDet.status)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {openDet.tipo}{openDet.etapa ? ` · ${openDet.etapa}` : ""} · {format(new Date(openDet.data_inspecao), "dd/MM/yyyy", { locale: ptBR })}
                  {openDet.responsavel && ` · ${openDet.responsavel}`}
                </p>
                <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                  {openDet.itens.map((it, i) => (
                    <label key={i} className="flex items-center gap-2 p-2 border rounded text-sm cursor-pointer">
                      <Checkbox checked={it.ok} onCheckedChange={() => canEdit && toggleItem(openDet, i)} disabled={!canEdit || openDet.status !== "pendente"} />
                      <span className={it.ok ? "line-through text-muted-foreground" : ""}>{it.texto}</span>
                    </label>
                  ))}
                </div>
                {openDet.nao_conformidade && (
                  <div className="p-2 bg-destructive/10 border border-destructive rounded text-xs">
                    <strong>Não conformidade:</strong> {openDet.nao_conformidade}
                  </div>
                )}
                {canEdit && openDet.status === "pendente" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => finalizar(openDet, "conforme")}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Aprovar
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => {
                      const nc = prompt("Descreva a não conformidade:");
                      if (nc) finalizar(openDet, "nao_conforme", nc);
                    }}>
                      <XCircle className="h-4 w-4 mr-1" />Não conforme
                    </Button>
                  </div>
                )}
                {canEdit && (
                  <Button size="sm" variant="ghost" onClick={() => apagar(openDet.id)} className="w-full text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />Remover
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}