import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AnimatedHouse, { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import BeforeAfterPorEtapa from "@/components/obra/BeforeAfterPorEtapa";
import Vista3DCasa from "@/components/obra/Vista3DCasa";
import ClimaWidget from "@/components/obra/ClimaWidget";
import { QRCodeCanvas } from "qrcode.react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft, Upload, Send, CheckCircle2, FileText, DollarSign,
  BookOpen, MessageSquare, Clock, QrCode, Box, ImageIcon,
  ListChecks, Users, Copy, Download, Share2, Settings,
  ChevronLeft, ChevronRight, X, Trash2, Key
} from "lucide-react";
import jsPDF from "jspdf";
import MembrosObra from "@/components/obra/MembrosObra";
import { notificar, notificarMembros } from "@/lib/notificar";
import PlanGate from "@/components/obra/PlanGate";
import DiarioIALivre from "@/components/obra/DiarioIALivre";
import ResumoSemanal from "@/components/obra/ResumoSemanal";
import AlertaRiscoChuva from "@/components/obra/AlertaRiscoChuva";
import ChecklistEtapa from "@/components/obra/ChecklistEtapa";
import TarefasKanban from "@/components/obra/TarefasKanban";
import VisitasTab from "@/components/obra/VisitasTab";
import OrcamentosTab from "@/components/obra/OrcamentosTab";
import DocumentosTab from "@/components/obra/DocumentosTab";
import ParalisacoesTab from "@/components/obra/ParalisacoesTab";
import CurvaS from "@/components/obra/CurvaS";
import { exportarObraXLSX } from "@/lib/exportarObra";
import { Sparkles, ListTodo, CalendarClock, Package, FolderOpen, Pause, FileSpreadsheet } from "lucide-react";

export default function ObraDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const [obra, setObra] = useState<any>(null);
  const [etapas, setEtapas] = useState<any[]>([]);
  const [fotos, setFotos] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [tl, setTl] = useState<any[]>([]);
  const [fin, setFin] = useState<any[]>([]);
  const [diario, setDiario] = useState<any[]>([]);
  const [aprov, setAprov] = useState<any[]>([]);
  const [stage, setStage] = useState<ObraStage>("terreno");
  const [checklistEtapa, setChecklistEtapa] = useState<any>(null);
  const [paralisacaoAtiva, setParalisacaoAtiva] = useState(false);

  async function refresh() {
    if (!id) return;
    const [o, e, f, m, t, fi, d, a] = await Promise.all([
      supabase.from("obras").select("*").eq("id", id).maybeSingle(),
      supabase.from("etapas").select("*").eq("obra_id", id).order("ordem"),
      supabase.from("fotos").select("*").eq("obra_id", id).order("created_at", { ascending: false }),
      supabase.from("mensagens").select("*").eq("obra_id", id).order("created_at"),
      supabase.from("timeline_eventos").select("*").eq("obra_id", id).order("created_at", { ascending: false }),
      supabase.from("financeiro").select("*").eq("obra_id", id).order("data", { ascending: false }),
      supabase.from("diario_obra").select("*").eq("obra_id", id).order("data", { ascending: false }),
      supabase.from("aprovacoes").select("*").eq("obra_id", id).order("created_at", { ascending: false }),
    ]);
    setObra(o.data); setEtapas(e.data ?? []); setFotos(f.data ?? []);
    setMsgs(m.data ?? []); setTl(t.data ?? []); setFin(fi.data ?? []);
    setDiario(d.data ?? []); setAprov(a.data ?? []);
    if (o.data) setStage(o.data.etapa_atual);
    const { data: par } = await supabase.from("paralisacoes_obra").select("id").eq("obra_id", id).is("data_fim", null).limit(1);
    setParalisacaoAtiva((par ?? []).length > 0);
  }

  useEffect(() => { refresh(); }, [id]);

  useEffect(() => {
    if (!id) return;
    const ch = supabase.channel(`obra-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens", filter: `obra_id=eq.${id}` },
        (p: any) => setMsgs(prev => [...prev, p.new]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  if (!obra) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isOwner = obra.owner_id === user?.id;
  const orcamento = fin.filter(f => f.tipo === "orcamento").reduce((a, b) => a + Number(b.valor), 0);
  const gastos = fin.filter(f => f.tipo === "gasto").reduce((a, b) => a + Number(b.valor), 0);

  async function logEvento(tipo: string, descricao: string) {
    if (!id) return;
    await supabase.from("timeline_eventos").insert({ obra_id: id, user_id: user?.id, tipo, descricao });
  }

  async function updateEtapa(etapaRow: any, patch: any) {
    await supabase.from("etapas").update(patch).eq("id", etapaRow.id);
    await logEvento("etapa", `Etapa "${etapaRow.etapa}" atualizada`);
    refresh();
  }

  async function setEtapaAtual(newStage: ObraStage) {
    const s = STAGES.find(x => x.id === newStage)!;
    await supabase.from("obras").update({ etapa_atual: newStage, percentual: s.percent }).eq("id", obra.id);
    await logEvento("progresso", `Etapa atual: ${newStage} (${s.percent}%)`);
    await notificar(obra.owner_id, obra.id, "Etapa atualizada", `Nova etapa: ${newStage} (${s.percent}%)`, "info", `/app/obras/${obra.id}`);
    refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Link to="/app" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1 mb-3">
        <ArrowLeft className="h-3 w-3" />Voltar
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold">{obra.nome}</h1>
          <p className="text-muted-foreground">{obra.endereco}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{obra.tipo}</Badge>
          <Badge>{obra.status}</Badge>
          {paralisacaoAtiva && <Badge variant="destructive" className="gap-1"><Pause className="h-3 w-3" />Paralisada</Badge>}
        </div>
      </div>

      <Tabs defaultValue="visao">
        <div className="overflow-x-auto pb-1">
          <TabsList className="flex w-max h-auto gap-1">
            <TabsTrigger value="visao"><ListChecks className="h-4 w-4 mr-1" />Visão geral</TabsTrigger>
            <TabsTrigger value="etapas">Etapas</TabsTrigger>
            <TabsTrigger value="fotos"><ImageIcon className="h-4 w-4 mr-1" />Fotos</TabsTrigger>
            <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-1" />Chat</TabsTrigger>
            <TabsTrigger value="timeline"><Clock className="h-4 w-4 mr-1" />Timeline</TabsTrigger>
            <TabsTrigger value="financeiro"><DollarSign className="h-4 w-4 mr-1" />Financeiro</TabsTrigger>
            <TabsTrigger value="diario"><BookOpen className="h-4 w-4 mr-1" />Diário</TabsTrigger>
            <TabsTrigger value="gantt">Gantt</TabsTrigger>
            <TabsTrigger value="vista3d"><Box className="h-4 w-4 mr-1" />Vista 3D</TabsTrigger>
            <TabsTrigger value="aprov"><CheckCircle2 className="h-4 w-4 mr-1" />Aprovações</TabsTrigger>
            <TabsTrigger value="antes"><ImageIcon className="h-4 w-4 mr-1" />Antes/depois</TabsTrigger>
            <TabsTrigger value="qr"><QrCode className="h-4 w-4 mr-1" />QR / Cliente</TabsTrigger>
            <TabsTrigger value="equipe"><Users className="h-4 w-4 mr-1" />Equipe</TabsTrigger>
            <TabsTrigger value="tarefas"><ListTodo className="h-4 w-4 mr-1" />Tarefas</TabsTrigger>
            <TabsTrigger value="visitas"><CalendarClock className="h-4 w-4 mr-1" />Visitas</TabsTrigger>
            <TabsTrigger value="orcamentos"><Package className="h-4 w-4 mr-1" />Orçamentos</TabsTrigger>
            <TabsTrigger value="documentos"><FolderOpen className="h-4 w-4 mr-1" />Documentos</TabsTrigger>
            <TabsTrigger value="paralisacoes"><Pause className="h-4 w-4 mr-1" />Paralisações</TabsTrigger>
            <TabsTrigger value="resumo"><Sparkles className="h-4 w-4 mr-1" />Resumo IA</TabsTrigger>
            <TabsTrigger value="relatorio"><FileText className="h-4 w-4 mr-1" />Relatório</TabsTrigger>
            <TabsTrigger value="exportar"><FileSpreadsheet className="h-4 w-4 mr-1" />Exportar</TabsTrigger>
            {isOwner && <TabsTrigger value="config"><Settings className="h-4 w-4 mr-1" />Config.</TabsTrigger>}
          </TabsList>
        </div>

        {/* VISÃO GERAL */}
        <TabsContent value="visao" className="mt-4">
          <div className="mb-4">
            <AlertaRiscoChuva lat={obra.latitude} lon={obra.longitude} etapas={etapas} />
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2">
              <h3 className="font-semibold mb-3">Casa em construção</h3>
              <AnimatedHouse stage={stage} />
            </Card>
            <div className="space-y-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Progresso</p>
                <p className="text-3xl font-extrabold text-primary">{obra.percentual}%</p>
                <Progress value={obra.percentual} className="mt-2 h-2" />
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Etapa atual</p>
                <p className="font-bold capitalize">{obra.etapa_atual}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Clima local</p>
                <ClimaWidget lat={obra.latitude} lon={obra.longitude} />
              </Card>
            </div>
          </div>
        </TabsContent>

       {/* ETAPAS */}
        <TabsContent value="etapas" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {etapas.map((e, i) => {
              const concluido = e.status === "concluido" || e.status === "aprovado";
              return (
                <div
                  key={e.id}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    concluido
                      ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                      : e.status === "em_andamento"
                      ? "border-accent/50 bg-accent/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {/* Número da etapa */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${
                    concluido ? "bg-primary text-primary-foreground" :
                    e.status === "em_andamento" ? "bg-accent/20 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {concluido ? "✓" : i + 1}
                  </div>

                  {/* Nome */}
                  <p className={`font-semibold capitalize text-sm mb-1 ${
                    concluido ? "text-primary" : "text-foreground"
                  }`}>
                    {e.etapa}
                  </p>

                  {/* Porcentagem */}
                  <p className={`text-2xl font-extrabold ${
                    concluido ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {e.percentual}%
                  </p>

                  {/* Barra */}
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        concluido ? "bg-primary" :
                        e.status === "em_andamento" ? "bg-accent" : "bg-muted-foreground/30"
                      }`}
                      style={{ width: `${e.percentual}%` }}
                    />
                  </div>

                  {/* Status badge */}
                  <div className={`mt-2 text-xs font-medium ${
                    concluido ? "text-primary" :
                    e.status === "em_andamento" ? "text-accent" :
                    "text-muted-foreground"
                  }`}>
                    <span className="inline-flex items-center gap-1">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        concluido ? "bg-primary" :
                        e.status === "em_andamento" ? "bg-accent" :
                        "bg-muted-foreground/40"
                      }`} />
                      {concluido ? "Concluído" :
                       e.status === "em_andamento" ? "Em andamento" :
                       "Não iniciado"}
                    </span>
                  </div>

                  {/* Hint para owner */}
                  {isOwner && (
                    <div className="mt-3 flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs flex-1"
                        onClick={() => setChecklistEtapa(e)}>
                        <ListChecks className="h-3 w-3 mr-1" />Checklist
                      </Button>
                      <Button size="sm" variant={concluido ? "ghost" : "default"} className="h-7 text-xs"
                        onClick={() => {
                          const novoStatus = concluido ? "nao_iniciado" : "concluido";
                          updateEtapa(e, { status: novoStatus, percentual: concluido ? 0 : e.percentual });
                          if (!concluido) setEtapaAtual(e.etapa);
                        }}>
                        {concluido ? "Desmarcar" : "Concluir"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {checklistEtapa && (
            <ChecklistEtapa
              open={!!checklistEtapa}
              onOpenChange={(v) => !v && setChecklistEtapa(null)}
              etapaRow={checklistEtapa}
              obra={obra}
              userId={user?.id ?? ""}
              onCompletar={() => {
                updateEtapa(checklistEtapa, { status: "concluido", percentual: checklistEtapa.percentual });
                setEtapaAtual(checklistEtapa.etapa);
              }}
            />
          )}

          {/* Progresso geral */}
          <div className="mt-4 p-4 bg-card border border-border rounded-2xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Progresso geral da obra</span>
              <span className="font-bold text-primary">{obra.percentual}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
                style={{ width: `${obra.percentual}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{etapas.filter(e => e.status === "concluido" || e.status === "aprovado").length} de {etapas.length} etapas concluídas</span>
              <span>{etapas.filter(e => e.status === "em_andamento").length > 0 ? "Em andamento" : "Aguardando"}</span>
            </div>
          </div>
        </TabsContent>

        {/* FOTOS */}
        <TabsContent value="fotos" className="mt-4">
          <FotosTab obraId={obra.id} fotos={fotos} stage={stage}
            setStage={setStage} onUpload={refresh} userId={user?.id} />
        </TabsContent>

        {/* CHAT */}
        <TabsContent value="chat" className="mt-4">
          <ChatTab obraId={obra.id} msgs={msgs} userId={user?.id} />
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline" className="mt-4">
          {tl.length === 0 ? <p className="text-muted-foreground">Nenhum evento ainda.</p> : (
            <div className="space-y-2">
              {tl.map(t => (
                <Card key={t.id} className="p-3 flex justify-between">
                  <div>
                    <Badge variant="outline" className="mb-1">{t.tipo}</Badge>
                    <p className="text-sm">{t.descricao}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="financeiro" className="mt-4">
          <PlanGate feature="financeiro" titulo="Controle financeiro">
            <div className="space-y-4">
              <FinanceiroTab obraId={obra.id} fin={fin} orcamento={orcamento}
                gastos={gastos} valorPrev={obra.valor_previsto}
                userId={user?.id} isOwner={isOwner} onChange={refresh} />
              <CurvaS obraId={obra.id} userId={user?.id ?? ""} fin={fin} isEditor={isOwner} />
            </div>
          </PlanGate>
        </TabsContent>

        {/* DIÁRIO */}
        <TabsContent value="diario" className="mt-4">
          <DiarioTab obraId={obra.id} diario={diario} userId={user?.id} onChange={refresh} />
        </TabsContent>

        <TabsContent value="visitas" className="mt-4">
          <VisitasTab obraId={obra.id} userId={user?.id ?? ""} isEditor={isOwner} ownerId={obra.owner_id} />
        </TabsContent>

        <TabsContent value="orcamentos" className="mt-4">
          <OrcamentosTab obraId={obra.id} userId={user?.id ?? ""} isEditor={isOwner} />
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <DocumentosTab obraId={obra.id} userId={user?.id ?? ""} isEditor={isOwner} />
        </TabsContent>

        <TabsContent value="paralisacoes" className="mt-4">
          <ParalisacoesTab obraId={obra.id} userId={user?.id ?? ""} isEditor={isOwner} />
        </TabsContent>

        <TabsContent value="exportar" className="mt-4">
          <Card className="p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-primary mb-3" />
            <h3 className="font-bold mb-2">Exportar dados da obra</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gera um arquivo Excel (.xlsx) com abas para Financeiro, Diário e Etapas.
            </p>
            <Button onClick={() => exportarObraXLSX(obra, fin, diario, etapas)}>
              <Download className="h-4 w-4 mr-1" />Baixar planilha
            </Button>
          </Card>
        </TabsContent>

        {/* GANTT */}
        <TabsContent value="gantt" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Cronograma</h3>
            <div className="space-y-2">
              {etapas.map(e => (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <span className="w-28 capitalize shrink-0">{e.etapa}</span>
                  <div className="flex-1 h-6 bg-muted rounded relative overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 rounded transition-all duration-500 ${
                      e.status === "concluido" || e.status === "aprovado" ? "bg-primary" :
                      e.status === "em_andamento" ? "bg-accent" : "bg-muted-foreground/20"
                    }`} style={{ width: `${e.percentual}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
                      {e.percentual}% — {e.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
                    {e.data_fim_prevista || "—"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* VISTA 3D */}
        <TabsContent value="vista3d" className="mt-4">
          <PlanGate feature="vista3d" titulo="Vista 3D isométrica">
            <Vista3DCasa
              stage={stage}
              obraId={obra.id}
              photoUrl={obra.foto_projeto_url}
              canEdit={obra.owner_id === user?.id || ["engenheiro","arquiteto","mestre_obras","admin"].includes((user as any)?.user_metadata?.role || "")}
              onPhotoChange={() => refresh()}
            />
          </PlanGate>
        </TabsContent>

        {/* APROVAÇÕES */}
        <TabsContent value="aprov" className="mt-4">
          <PlanGate feature="aprovacaoDigital" titulo="Aprovação digital">
            <AprovacoesTab obraId={obra.id} aprov={aprov} userId={user?.id} onChange={refresh} />
          </PlanGate>
        </TabsContent>

        {/* ANTES/DEPOIS */}
        <TabsContent value="antes" className="mt-4">
          <BeforeAfterPorEtapa fotos={fotos} />
        </TabsContent>

        {/* QR */}
        <TabsContent value="qr" className="mt-4">
          <QrTab obra={obra} />
        </TabsContent>

        {/* EQUIPE */}
        <TabsContent value="equipe" className="mt-4">
          <MembrosObra obraId={obra.id} ownerId={obra.owner_id} />
        </TabsContent>

        {/* TAREFAS */}
        <TabsContent value="tarefas" className="mt-4">
          <TarefasKanbanWrapper obraId={obra.id} ownerId={obra.owner_id} userId={user?.id ?? ""} />
        </TabsContent>

        {/* RESUMO IA */}
        <TabsContent value="resumo" className="mt-4">
          <ResumoSemanal obra={obra} userId={user?.id ?? ""} />
        </TabsContent>

        {/* RELATÓRIO */}
        <TabsContent value="relatorio" className="mt-4">
          <PlanGate feature="relatorioPDF" titulo="Relatórios em PDF">
            <Card className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-3" />
              <h3 className="font-bold mb-2">Relatório PDF da obra</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gere um PDF com narrativa profissional escrita por IA, etapas, financeiro e fotos
              </p>
              <PdfButton obra={obra} etapas={etapas} fin={fin} fotos={fotos} />
            </Card>
          </PlanGate>
        </TabsContent>

        {/* CONFIGURAÇÕES */}
        {isOwner && (
          <TabsContent value="config" className="mt-4">
            <ConfigTab obra={obra} onUpdate={refresh} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ===== FOTOS COM LIGHTBOX =====
function FotosTab({ obraId, fotos, stage, setStage, onUpload, userId }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [legenda, setLegenda] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  async function upload(file: File) {
    if (!userId) return;
    setUploading(true);
    const path = `${userId}/${obraId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("fotos-obras").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: { publicUrl } } = supabase.storage.from("fotos-obras").getPublicUrl(path);
    const { error } = await supabase.from("fotos").insert({
      obra_id: obraId, user_id: userId, url: publicUrl, etapa: stage, legenda
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    await supabase.from("timeline_eventos").insert({
      obra_id: obraId, user_id: userId, tipo: "foto", descricao: `Nova foto na etapa ${stage}`
    });
    await notificarMembros(obraId, userId, "Nova foto na obra",
      `Etapa ${stage}${legenda ? ": " + legenda : ""}`, "info", `/app/obras/${obraId}`);
    setLegenda(""); onUpload(); toast.success("Foto enviada!");
  }

  function navLightbox(dir: number) {
    if (lightbox === null) return;
    const next = lightbox + dir;
    if (next >= 0 && next < fotos.length) setLightbox(next);
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <Label>Etapa</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Legenda</Label>
            <Input value={legenda} onChange={e => setLegenda(e.target.value)} placeholder="Opcional" />
          </div>
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-1" />{uploading ? "Enviando..." : "Enviar foto"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
      </Card>

      {fotos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma foto ainda. Envie a primeira!</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {fotos.map((f: any, i: number) => (
          <div key={f.id} className="rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-md transition-all group relative">
            <div className="aspect-video overflow-hidden bg-muted cursor-pointer" onClick={() => setLightbox(i)}>
              <img src={f.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt={f.legenda || ""} />
            </div>
            <button
              onClick={async () => {
                if (!confirm("Excluir esta foto?")) return;
                await supabase.from("fotos").delete().eq("id", f.id);
                toast.success("Foto excluída!");
                onUpload();
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600 rounded-full items-center justify-center text-white hidden group-hover:flex transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="p-2">
              <p className="text-xs text-muted-foreground capitalize">{f.etapa}</p>
              {f.legenda && <p className="text-xs text-foreground truncate">{f.legenda}</p>}
            </div>
          </div>
        ))}
      </div>
            
      {/* LIGHTBOX */}
      <Dialog open={lightbox !== null} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
          {lightbox !== null && fotos[lightbox] && (
            <div className="relative">
              <img src={fotos[lightbox].url}
                className="w-full max-h-[80vh] object-contain"
                alt={fotos[lightbox].legenda || ""} />
              <button onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
              {lightbox > 0 && (
                <button onClick={() => navLightbox(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {lightbox < fotos.length - 1 && (
                <button onClick={() => navLightbox(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80">
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
              <div className="p-3 text-center">
                <p className="text-white/70 text-sm capitalize">{fotos[lightbox].etapa}</p>
                {fotos[lightbox].legenda && <p className="text-white text-sm">{fotos[lightbox].legenda}</p>}
                <p className="text-white/50 text-xs mt-1">{lightbox + 1} / {fotos.length}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== CHAT =====
function ChatTab({ obraId, msgs, userId }: any) {
  const [txt, setTxt] = useState("");
  async function send() {
    if (!txt.trim() || !userId) return;
    await supabase.from("mensagens").insert({ obra_id: obraId, user_id: userId, conteudo: txt });
    setTxt("");
  }
  return (
    <Card className="flex flex-col h-[500px]">
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Chat interno da obra — visível para você, equipe e cliente (via portal/token)
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {msgs.map((m: any) => {
          const isCliente = m.conteudo?.startsWith("[Cliente]");
          const mine = m.user_id === userId && !isCliente;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                mine ? "bg-primary text-primary-foreground"
                     : isCliente ? "bg-accent/20 border border-accent/40"
                     : "bg-muted"
              }`}>
                {isCliente && <p className="text-[10px] font-bold text-accent mb-0.5">CLIENTE</p>}
                <p>{m.conteudo?.replace("[Cliente] ", "")}</p>
                <p className="text-[10px] opacity-60 mt-0.5">{format(new Date(m.created_at), "HH:mm")}</p>
              </div>
            </div>
          );
        })}
        {msgs.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda</p>}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Input value={txt} onChange={e => setTxt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()} placeholder="Mensagem..." />
        <Button onClick={send}><Send className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}

// ===== FINANCEIRO =====
function FinanceiroTab({ obraId, fin, orcamento, gastos, valorPrev, userId, isOwner, onChange }: any) {
  const [form, setForm] = useState({ tipo: "gasto", descricao: "", valor: "", categoria: "" });
  async function add() {
    if (!form.descricao || !form.valor) return;
    const { error } = await supabase.from("financeiro").insert({
      obra_id: obraId, user_id: userId, tipo: form.tipo as any,
      descricao: form.descricao, valor: Number(form.valor), categoria: form.categoria || null
    });
    if (error) return toast.error(error.message);
    setForm({ tipo: "gasto", descricao: "", valor: "", categoria: "" }); onChange();
  }
  const desvio = valorPrev ? ((gastos - Number(valorPrev)) / Number(valorPrev) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Orçamento previsto</p><p className="text-2xl font-bold">R$ {Number(valorPrev || 0).toLocaleString("pt-BR")}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Gasto até agora</p><p className="text-2xl font-bold text-accent">R$ {gastos.toLocaleString("pt-BR")}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Desvio</p><p className={`text-2xl font-bold ${desvio > 0 ? "text-destructive" : "text-primary"}`}>{desvio.toFixed(1)}%</p></Card>
      </div>
      {isOwner && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Novo lançamento</h4>
          <div className="grid sm:grid-cols-4 gap-2">
            <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gasto">Gasto</SelectItem>
                <SelectItem value="orcamento">Orçamento</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            <Input placeholder="Valor R$" type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
            <Button onClick={add}>Adicionar</Button>
          </div>
        </Card>
      )}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">Histórico</h4>
        {fin.length === 0 ? <p className="text-muted-foreground text-sm">Sem lançamentos</p> : (
          <div className="space-y-1">
            {fin.map((f: any) => (
              <div key={f.id} className="flex justify-between py-2 border-b text-sm last:border-0">
                <div><Badge variant={f.tipo === "gasto" ? "destructive" : "secondary"} className="mr-2">{f.tipo}</Badge>{f.descricao}</div>
                <div className="font-mono">R$ {Number(f.valor).toLocaleString("pt-BR")}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ===== DIÁRIO =====
function DiarioTab({ obraId, diario, userId, onChange }: any) {
  const [form, setForm] = useState({ titulo: "", conteudo: "", clima: "", trabalhadores: "" });
  const [busca, setBusca] = useState("");
  const [filtroData, setFiltroData] = useState("");
  async function add() {
    if (!form.conteudo) return;
    const { error } = await supabase.from("diario_obra").insert({
      obra_id: obraId, user_id: userId, titulo: form.titulo || null,
      conteudo: form.conteudo, clima: form.clima || null,
      trabalhadores: form.trabalhadores ? Number(form.trabalhadores) : null,
    });
    if (error) return toast.error(error.message);
    setForm({ titulo: "", conteudo: "", clima: "", trabalhadores: "" });
    onChange(); toast.success("Registro adicionado");
  }
  async function excluir(id: string) {
    if (!confirm("Excluir este registro?")) return;
    await supabase.from("diario_obra").delete().eq("id", id);
    onChange(); toast.success("Registro excluído");
  }
  const filtrados = diario.filter((d: any) => {
    const matchBusca = !busca ||
      d.conteudo?.toLowerCase().includes(busca.toLowerCase()) ||
      d.titulo?.toLowerCase().includes(busca.toLowerCase());
    const matchData = !filtroData || d.data === filtroData;
    return matchBusca && matchData;
  });
  // agrupar por mês
  const grupos: Record<string, any[]> = {};
  filtrados.forEach((d: any) => {
    const k = format(new Date(d.data), "MMMM yyyy", { locale: ptBR });
    (grupos[k] = grupos[k] || []).push(d);
  });
  return (
    <div className="space-y-4">
      <DiarioIALivre obraId={obraId} userId={userId} onSaved={onChange} />
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold">Novo registro (manual)</h4>
        <Input placeholder="Título" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
        <Textarea placeholder="O que aconteceu hoje na obra..." rows={3} value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Clima (ex: ensolarado)" value={form.clima} onChange={e => setForm({ ...form, clima: e.target.value })} />
          <Input placeholder="Nº trabalhadores" type="number" value={form.trabalhadores} onChange={e => setForm({ ...form, trabalhadores: e.target.value })} />
        </div>
        <Button onClick={add}>Adicionar registro</Button>
      </Card>

      {diario.length > 0 && (
        <Card className="p-3 flex flex-wrap gap-2 items-center">
          <Input placeholder="🔍 Buscar no diário..." value={busca} onChange={e => setBusca(e.target.value)} className="flex-1 min-w-[200px]" />
          <Input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} className="w-44" />
          {(busca || filtroData) && (
            <Button variant="ghost" size="sm" onClick={() => { setBusca(""); setFiltroData(""); }}>Limpar</Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {filtrados.length} de {diario.length} registros
          </span>
        </Card>
      )}

      {filtrados.length === 0 && diario.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-6">Nenhum registro encontrado com esses filtros.</p>
      )}
      {diario.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-6">Comece adicionando o primeiro registro do diário.</p>
      )}

      <div className="space-y-4">
        {Object.entries(grupos).map(([mes, items]) => (
          <div key={mes}>
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 capitalize sticky top-0 bg-background py-1">
              📅 {mes} <span className="font-normal">· {items.length} registro{items.length > 1 ? "s" : ""}</span>
            </h5>
            <div className="space-y-2">
              {items.map((d: any) => (
                <Card key={d.id} className="p-4 group">
                  <div className="flex justify-between mb-1">
                    <p className="font-semibold">{d.titulo || "Sem título"}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{format(new Date(d.data), "dd/MM/yyyy")}</span>
                      <button onClick={() => excluir(d.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{d.conteudo}</p>
                  {(d.clima || d.trabalhadores) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {d.clima && `☀️ ${d.clima}`} {d.trabalhadores && `· 👷 ${d.trabalhadores} trabalhadores`}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== APROVAÇÕES =====
function AprovacoesTab({ obraId, aprov, userId, onChange }: any) {
  const [etapa, setEtapa] = useState<ObraStage>("fundacao");
  const [assinatura, setAssinatura] = useState("");
  const [comentario, setComentario] = useState("");
  async function aprovar() {
    if (!assinatura) return toast.error("Digite seu nome como assinatura");
    const { error } = await supabase.from("aprovacoes").insert({ obra_id: obraId, user_id: userId, etapa, assinatura, comentario });
    if (error) return toast.error(error.message);
    await notificarMembros(obraId, userId, "Nova aprovação digital", `Etapa ${etapa} aprovada por ${assinatura}`, "sucesso", `/app/obras/${obraId}`);
    setAssinatura(""); setComentario(""); onChange(); toast.success("Etapa aprovada digitalmente!");
  }
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold">Aprovar etapa</h4>
        <Select value={etapa} onValueChange={v => setEtapa(v as ObraStage)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Sua assinatura (nome completo)" value={assinatura} onChange={e => setAssinatura(e.target.value)} />
        <Textarea placeholder="Comentário (opcional)" rows={2} value={comentario} onChange={e => setComentario(e.target.value)} />
        <Button onClick={aprovar}><CheckCircle2 className="h-4 w-4 mr-1" />Aprovar digitalmente</Button>
      </Card>
      <div className="space-y-2">
        {aprov.map((a: any) => (
          <Card key={a.id} className="p-3">
            <div className="flex justify-between">
              <div><Badge>{a.etapa}</Badge> <span className="text-sm ml-2">por <strong>{a.assinatura}</strong></span></div>
              <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "dd/MM/yyyy HH:mm")}</span>
            </div>
            {a.comentario && <p className="text-sm mt-2 text-muted-foreground">{a.comentario}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== VISTA 3D =====
function Vista3D({ stage }: { stage: ObraStage }) {
  const idx = STAGES.findIndex(s => s.id === stage);
  const has = (i: number) => idx >= i;
  return (
    <Card className="p-8 flex items-center justify-center min-h-[400px] bg-gradient-to-b from-sky-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
      <div className="relative" style={{ perspective: "800px" }}>
        <div className="relative" style={{ transform: "rotateX(20deg) rotateY(-25deg)", transformStyle: "preserve-3d" }}>
          <div className="w-64 h-64 bg-amber-700/60 rounded shadow-2xl" style={{ transform: "rotateX(90deg) translateZ(-100px)" }} />
          {has(1) && <div className="absolute left-8 top-8 w-48 h-48 bg-stone-500 shadow-xl" style={{ transform: "translateZ(10px)" }} />}
          {has(2) && <div className="absolute left-8 top-8 w-48 h-32 bg-slate-300 border-4 border-slate-400" style={{ transform: "translateZ(60px)" }} />}
          {has(3) && <div className="absolute left-8 top-8 w-48 h-32 bg-orange-200 border-2 border-orange-400" style={{ transform: "translateZ(60px)" }} />}
          {has(4) && <div className="absolute left-4 -top-2 w-56 h-12 bg-red-600 shadow-lg" style={{ transform: "translateZ(110px) rotateZ(-2deg)" }} />}
          {has(6) && <div className="absolute left-20 top-32 w-8 h-12 bg-amber-900" style={{ transform: "translateZ(62px)" }} />}
          {has(6) && <div className="absolute left-36 top-20 w-8 h-8 bg-sky-300 border-2 border-white" style={{ transform: "translateZ(62px)" }} />}
        </div>
      </div>
    </Card>
  );
}

// ===== QR =====
function QrTab({ obra }: { obra: any }) {
  const url = `${window.location.origin}/obra-publica/${obra.id}?t=${obra.publico_token}`;
  const linkCliente = `${window.location.origin}/entrar`;
  const canvasRef = useRef<HTMLDivElement>(null);

  function copiar() { navigator.clipboard.writeText(url); toast.success("Link copiado!"); }
  function copiarToken() { navigator.clipboard.writeText(obra.publico_token); toast.success("Token copiado!"); }
  function baixar() {
    const canvas = canvasRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qrcode-${obra.nome}.png`;
    link.click();
  }
  function whatsapp() {
    const txt = encodeURIComponent(
      `Olá! Aqui está o acesso para acompanhar sua obra "${obra.nome}" em tempo real.\n\n` +
      `1️⃣ Acesse: ${linkCliente}\n` +
      `2️⃣ Cole este token: ${obra.publico_token}\n\n` +
      `Ou acesse direto pelo link: ${url}`
    );
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  }

  return (
    <div className="space-y-4">
      {/* TOKEN em destaque */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Token de acesso do cliente</h3>
            <p className="text-xs text-muted-foreground">Envie este token para seu cliente acessar a obra</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
          <code className="flex-1 text-xl font-mono font-bold text-primary tracking-widest text-center">
            {obra.publico_token}
          </code>
          <Button size="sm" onClick={copiarToken}>
            <Copy className="h-4 w-4 mr-1" />Copiar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          O cliente acessa <strong>{window.location.origin}/entrar</strong> e cola este token
        </p>
      </div>

      {/* Instruções */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { texto: "Copie o token acima", Icon: Copy },
          { texto: "Envie para o cliente via WhatsApp", Icon: Share2 },
          { texto: "Cliente cola o token dentro da conta dele", Icon: Key },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.Icon className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">{s.texto}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 text-center">
          <h3 className="font-bold mb-2">QR Code da obra</h3>
          <p className="text-sm text-muted-foreground mb-4">Imprima e cole na placa de obra</p>
          <div ref={canvasRef} className="inline-block p-4 bg-white rounded-lg border">
            <QRCodeCanvas value={url} size={180} />
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Button size="sm" variant="outline" onClick={copiar}>
              <Copy className="h-4 w-4 mr-1" />Copiar link
            </Button>
            <Button size="sm" variant="outline" onClick={baixar}>
              <Download className="h-4 w-4 mr-1" />Baixar QR
            </Button>
            <Button size="sm" onClick={whatsapp}>
              <Share2 className="h-4 w-4 mr-1" />WhatsApp
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Pré-visualização do cliente</h3>
          <p className="text-xs text-muted-foreground mb-3">É assim que o cliente verá a obra</p>
          <div className="rounded-lg border border-border overflow-hidden bg-muted/30 h-[320px]">
            <iframe title="Preview" src={url} className="w-full h-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
// ===== CONFIGURAÇÕES =====
function ConfigTab({ obra, onUpdate }: { obra: any; onUpdate: () => void }) {
  const nav = useNavigate ? null : null;
  const [form, setForm] = useState({
    nome: obra.nome || "",
    endereco: obra.endereco || "",
    tipo: obra.tipo || "casa",
    valor_previsto: obra.valor_previsto || "",
    data_inicio: obra.data_inicio || "",
    data_fim_prevista: obra.data_fim_prevista || "",
    descricao: obra.descricao || "",
    status: obra.status || "planejamento",
  });
  const [saving, setSaving] = useState(false);

  async function salvar() {
    setSaving(true);
    const patch: any = { ...form, valor_previsto: form.valor_previsto ? Number(form.valor_previsto) : null };
    if (patch.status === "concluida") patch.percentual = 100;
    const { error } = await supabase.from("obras").update(patch).eq("id", obra.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Obra atualizada!");
    onUpdate();
  }

  async function arquivar() {
    await supabase.from("obras").update({ status: "cancelada" }).eq("id", obra.id);
    toast.success("Obra arquivada.");
    onUpdate();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-lg">Editar informações da obra</h3>
        <div>
          <Label>Nome da obra</Label>
          <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div>
          <Label>Endereço</Label>
          <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="predio">Prédio</SelectItem>
                <SelectItem value="reforma">Reforma</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor previsto (R$)</Label>
            <Input type="number" value={form.valor_previsto}
              onChange={e => setForm({ ...form, valor_previsto: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Data início</Label>
            <Input type="date" value={form.data_inicio}
              onChange={e => setForm({ ...form, data_inicio: e.target.value })} />
          </div>
          <div>
            <Label>Prazo (entrega)</Label>
            <Input type="date" value={form.data_fim_prevista}
              onChange={e => setForm({ ...form, data_fim_prevista: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea rows={3} value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })} />
        </div>
        <div>
          <Label>Status da obra</Label>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="planejamento">Planejamento</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="pausada">Pausada</SelectItem>
              <SelectItem value="concluida">Concluída (marca 100%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={salvar} disabled={saving} className="w-full">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </Card>

      <Card className="p-6 border-destructive/30">
        <h3 className="font-bold text-lg text-destructive mb-2">Zona de perigo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Arquivar a obra a marcará como cancelada. Esta ação pode ser revertida nas configurações.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />Arquivar obra
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Arquivar obra?</AlertDialogTitle>
              <AlertDialogDescription>
                A obra será marcada como cancelada. Você pode reverter isso depois.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={arquivar} className="bg-destructive text-destructive-foreground">
                Sim, arquivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}

// ===== PDF =====
function gerarPDF(obra: any, etapas: any[], fin: any[], fotos: any[], abertura = "", conclusao = "") {
  const doc = new jsPDF();
  doc.setFontSize(20); doc.text(`Relatório — ${obra.nome}`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Endereço: ${obra.endereco || "—"}`, 14, 30);
  doc.text(`Status: ${obra.status} · Progresso: ${obra.percentual}% · Etapa: ${obra.etapa_atual}`, 14, 36);
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 42);
  let y = 54;
  if (abertura) {
    doc.setFontSize(11); doc.text("Apresentação", 14, y); y += 5;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(abertura, 180);
    doc.text(lines, 14, y); y += lines.length * 5 + 4;
  }
  doc.setFontSize(14); doc.text("Etapas", 14, y); y += 6;
  doc.setFontSize(10);
  etapas.forEach(e => { doc.text(`• ${e.etapa}: ${e.percentual}% — ${e.status}`, 16, y); y += 5; });
  y += 4; doc.setFontSize(14); doc.text("Financeiro", 14, y); y += 6;
  const gastos = fin.filter(f => f.tipo === "gasto").reduce((a, b) => a + Number(b.valor), 0);
  doc.setFontSize(10);
  doc.text(`Orçamento previsto: R$ ${Number(obra.valor_previsto || 0).toLocaleString("pt-BR")}`, 16, y); y += 5;
  doc.text(`Gastos: R$ ${gastos.toLocaleString("pt-BR")}`, 16, y); y += 5;
  y += 4; doc.setFontSize(14); doc.text(`Fotos (${fotos.length})`, 14, y);
  if (conclusao) {
    y += 8; doc.setFontSize(11); doc.text("Conclusão", 14, y); y += 5;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(conclusao, 180);
    doc.text(lines, 14, y);
  }
  doc.save(`relatorio-${obra.nome}.pdf`);
}

function useNavigate() {
  return null;
}

// ===== WRAPPER TAREFAS (busca membros) =====
function TarefasKanbanWrapper({ obraId, ownerId, userId }: { obraId: string; ownerId: string; userId: string }) {
  const [membros, setMembros] = useState<{ user_id: string; nome: string }[]>([]);
  useEffect(() => {
    (async () => {
      const { data: m } = await supabase.from("obra_members").select("user_id").eq("obra_id", obraId);
      const ids = [ownerId, ...((m ?? []).map((x: any) => x.user_id))];
      const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", ids);
      setMembros((profs ?? []).map((p: any) => ({ user_id: p.id, nome: p.nome ?? "Sem nome" })));
    })();
  }, [obraId, ownerId]);
  return <TarefasKanban obraId={obraId} userId={userId} membros={membros} />;
}

// ===== BOTÃO PDF COM NARRATIVA IA =====
function PdfButton({ obra, etapas, fin, fotos }: any) {
  const [loading, setLoading] = useState(false);
  async function baixar() {
    setLoading(true);
    let abertura = "";
    let conclusao = "";
    try {
      const { data } = await supabase.functions.invoke("pdf-narrativa", {
        body: { obra, etapas, fin, fotosCount: fotos.length },
      });
      if (data && !(data as any).error) {
        abertura = (data as any).abertura ?? "";
        conclusao = (data as any).conclusao ?? "";
      }
    } catch { /* segue sem narrativa */ }
    gerarPDF(obra, etapas, fin, fotos, abertura, conclusao);
    setLoading(false);
  }
  return (
    <Button onClick={baixar} disabled={loading}>
      {loading ? "Gerando narrativa IA..." : "Baixar PDF"}
    </Button>
  );
}
