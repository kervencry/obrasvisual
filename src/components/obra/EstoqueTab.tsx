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
import { Package, Plus, ArrowDownCircle, ArrowUpCircle, AlertTriangle, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Material = { id: string; nome: string; unidade: string; saldo: number; estoque_minimo: number; categoria: string | null };
type Movimento = { id: string; material_id: string; tipo: string; quantidade: number; data: string; responsavel: string | null; observacoes: string | null; created_at: string };

export default function EstoqueTab({ obraId, canEdit }: { obraId: string; canEdit: boolean }) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [movs, setMovs] = useState<Movimento[]>([]);
  const [openMat, setOpenMat] = useState(false);
  const [openMov, setOpenMov] = useState<{ mat: Material; tipo: "entrada" | "saida" } | null>(null);
  const [openHist, setOpenHist] = useState<Material | null>(null);

  const [nomeMat, setNomeMat] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [saldoInicial, setSaldoInicial] = useState("0");
  const [minimo, setMinimo] = useState("0");
  const [categoria, setCategoria] = useState("");

  const [qtd, setQtd] = useState("");
  const [resp, setResp] = useState("");
  const [obs, setObs] = useState("");

  async function refresh() {
    const { data: mats } = await supabase.from("materiais_estoque").select("*").eq("obra_id", obraId).order("nome");
    const { data: mv } = await supabase.from("estoque_movimentos").select("*").eq("obra_id", obraId).order("created_at", { ascending: false });
    setMateriais(mats ?? []);
    setMovs(mv ?? []);
  }

  useEffect(() => { refresh(); }, [obraId]);

  async function criarMaterial() {
    if (!nomeMat.trim()) return toast.error("Nome obrigatório");
    const { error } = await supabase.from("materiais_estoque").insert({
      obra_id: obraId, nome: nomeMat.trim(), unidade, saldo: Number(saldoInicial) || 0,
      estoque_minimo: Number(minimo) || 0, categoria: categoria || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Material adicionado");
    setOpenMat(false); setNomeMat(""); setSaldoInicial("0"); setMinimo("0"); setCategoria("");
    refresh();
  }

  async function registrarMov() {
    if (!openMov) return;
    const q = Number(qtd);
    if (!q || q <= 0) return toast.error("Quantidade inválida");
    const { error } = await supabase.from("estoque_movimentos").insert({
      obra_id: obraId, material_id: openMov.mat.id, tipo: openMov.tipo,
      quantidade: q, responsavel: resp || null, observacoes: obs || null,
    });
    if (error) return toast.error(error.message);
    toast.success(openMov.tipo === "entrada" ? "Entrada registrada" : "Saída registrada");
    setOpenMov(null); setQtd(""); setResp(""); setObs("");
    refresh();
  }

  async function apagarMaterial(id: string) {
    if (!confirm("Remover este material e todo o histórico?")) return;
    const { error } = await supabase.from("materiais_estoque").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  }

  const abaixoMin = materiais.filter(m => m.saldo <= m.estoque_minimo && m.estoque_minimo > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Estoque do canteiro</h2>
          {abaixoMin.length > 0 && (
            <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{abaixoMin.length} abaixo do mínimo</Badge>
          )}
        </div>
        {canEdit && (
          <Dialog open={openMat} onOpenChange={setOpenMat}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Novo material</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar material</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome</Label><Input value={nomeMat} onChange={e => setNomeMat(e.target.value)} placeholder="Cimento CP-II" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Unidade</Label>
                    <Select value={unidade} onValueChange={setUnidade}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["un","sc","kg","m","m²","m³","L","lt","cx","pç"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Categoria</Label><Input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Estrutura" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Saldo inicial</Label><Input type="number" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)} /></div>
                  <div><Label>Estoque mínimo</Label><Input type="number" value={minimo} onChange={e => setMinimo(e.target.value)} /></div>
                </div>
                <Button onClick={criarMaterial} className="w-full">Cadastrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {materiais.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">Nenhum material cadastrado.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {materiais.map(m => {
            const alerta = m.saldo <= m.estoque_minimo && m.estoque_minimo > 0;
            return (
              <Card key={m.id} className={`p-4 ${alerta ? "border-destructive" : ""}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{m.nome}</p>
                    {m.categoria && <p className="text-xs text-muted-foreground">{m.categoria}</p>}
                  </div>
                  {alerta && <Badge variant="destructive" className="text-[10px]">Repor</Badge>}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-extrabold">{Number(m.saldo).toLocaleString("pt-BR")}</span>
                  <span className="text-sm text-muted-foreground">{m.unidade}</span>
                  <span className="text-xs text-muted-foreground ml-auto">mín: {m.estoque_minimo}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {canEdit && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setOpenMov({ mat: m, tipo: "entrada" })}>
                        <ArrowDownCircle className="h-4 w-4 mr-1 text-green-600" />Entrada
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setOpenMov({ mat: m, tipo: "saida" })}>
                        <ArrowUpCircle className="h-4 w-4 mr-1 text-orange-600" />Saída
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setOpenHist(m)}><History className="h-4 w-4" /></Button>
                  {canEdit && <Button size="sm" variant="ghost" onClick={() => apagarMaterial(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Movimento */}
      <Dialog open={!!openMov} onOpenChange={(v) => !v && setOpenMov(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {openMov?.tipo === "entrada" ? "Registrar entrada" : "Registrar saída"} — {openMov?.mat.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Quantidade ({openMov?.mat.unidade})</Label><Input type="number" value={qtd} onChange={e => setQtd(e.target.value)} /></div>
            <div><Label>Responsável</Label><Input value={resp} onChange={e => setResp(e.target.value)} placeholder="Quem recebeu / retirou" /></div>
            <div><Label>Observações</Label><Textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} /></div>
            <Button onClick={registrarMov} className="w-full">Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      <Dialog open={!!openHist} onOpenChange={(v) => !v && setOpenHist(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Histórico — {openHist?.nome}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {movs.filter(m => m.material_id === openHist?.id).map(mv => (
              <div key={mv.id} className="flex justify-between items-center border-b py-2 text-sm">
                <div>
                  <p className="font-semibold flex items-center gap-1">
                    {mv.tipo === "entrada" ? <ArrowDownCircle className="h-4 w-4 text-green-600" /> : <ArrowUpCircle className="h-4 w-4 text-orange-600" />}
                    {mv.tipo === "entrada" ? "+" : "-"}{Number(mv.quantidade).toLocaleString("pt-BR")} {openHist?.unidade}
                  </p>
                  {mv.responsavel && <p className="text-xs text-muted-foreground">Por: {mv.responsavel}</p>}
                  {mv.observacoes && <p className="text-xs text-muted-foreground">{mv.observacoes}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(mv.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
              </div>
            ))}
            {movs.filter(m => m.material_id === openHist?.id).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sem movimentações.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}