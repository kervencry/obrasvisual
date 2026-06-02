import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AnimatedHouse, { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import ClimaWidget from "@/components/obra/ClimaWidget";
import BeforeAfterPorEtapa from "@/components/obra/BeforeAfterPorEtapa";
import Vista3DCasa from "@/components/obra/Vista3DCasa";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Building2, Camera, MessageSquare, CheckCircle2,
  Clock, Send, ChevronLeft, ChevronRight, X,
  FileText, HardHat, MapPin, Calendar, TrendingUp,
  ImageIcon, Download
} from "lucide-react";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

export default function ObraPublica() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t");

  const [obra, setObra] = useState<any>(null);
  const [fotos, setFotos] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [etapas, setEtapas] = useState<any[]>([]);
  const [aprov, setAprov] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [txt, setTxt] = useState("");
  const [assinatura, setAssinatura] = useState("");
  const [comentario, setComentario] = useState("");
  const [etapaAprov, setEtapaAprov] = useState("");

  useEffect(() => {
    async function load() {
      if (!id || !token) { setErro("Link inválido."); setLoading(false); return; }

      const { data: obraData } = await supabase
        .from("obras")
        .select("*")
        .eq("id", id)
        .eq("publico_token", token)
        .maybeSingle();

      if (!obraData) { setErro("Obra não encontrada. Verifique o token."); setLoading(false); return; }

      setObra(obraData);

      const [f, t, m, e, a] = await Promise.all([
        supabase.from("fotos").select("*").eq("obra_id", id).order("created_at", { ascending: false }),
        supabase.from("timeline_eventos").select("*").eq("obra_id", id).order("created_at", { ascending: false }).limit(20),
        supabase.from("mensagens").select("*").eq("obra_id", id).order("created_at"),
        supabase.from("etapas").select("*").eq("obra_id", id).order("ordem"),
        supabase.from("aprovacoes").select("*").eq("obra_id", id).order("created_at", { ascending: false }),
      ]);

      setFotos(f.data ?? []);
      setTimeline(t.data ?? []);
      setMsgs(m.data ?? []);
      setEtapas(e.data ?? []);
      setAprov(a.data ?? []);
      if (e.data?.[0]) setEtapaAprov(e.data[0].etapa);
      setLoading(false);
    }
    load();
  }, [id, token]);

  // Realtime chat
  useEffect(() => {
    if (!id) return;
    const ch = supabase.channel(`publica-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens", filter: `obra_id=eq.${id}` },
        (p: any) => setMsgs(prev => [...prev, p.new]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  function navLightbox(dir: number) {
    if (lightbox === null) return;
    const next = lightbox + dir;
    if (next >= 0 && next < fotos.length) setLightbox(next);
  }

  async function enviarMsg() {
    if (!txt.trim() || !id) return;
    await supabase.from("mensagens").insert({ obra_id: id, user_id: obra.owner_id, conteudo: `[Cliente] ${txt}` });
    setTxt("");
    toast.success("Mensagem enviada!");
  }

  async function aprovar() {
    if (!assinatura.trim()) { toast.error("Digite seu nome para assinar"); return; }
    const { error } = await supabase.from("aprovacoes").insert({
      obra_id: id, user_id: obra.owner_id, etapa: etapaAprov as any,
      assinatura, comentario, aprovado: true
    });
    if (error) return toast.error(error.message);
    toast.success("Etapa aprovada digitalmente! ✅");
    setAssinatura(""); setComentario("");
    const a = await supabase.from("aprovacoes").select("*").eq("obra_id", id).order("created_at", { ascending: false });
    setAprov(a.data ?? []);
  }

  function gerarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text(`Relatório — ${obra.nome}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Endereço: ${obra.endereco || "—"}`, 14, 30);
    doc.text(`Progresso: ${obra.percentual}% — Etapa: ${obra.etapa_atual}`, 14, 36);
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 42);
    let y = 54;
    doc.setFontSize(14); doc.text("Etapas", 14, y); y += 6;
    doc.setFontSize(10);
    etapas.forEach(e => { doc.text(`• ${e.etapa}: ${e.percentual}% — ${e.status}`, 16, y); y += 5; });
    y += 4; doc.setFontSize(14); doc.text(`Fotos (${fotos.length})`, 14, y);
    doc.save(`relatorio-${obra.nome}.pdf`);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando sua obra...</p>
      </div>
    </div>
  );

  if (erro) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Obra não encontrada</h2>
        <p className="text-muted-foreground mb-4">{erro}</p>
        <Link to="/entrar"><Button>Tentar novamente</Button></Link>
      </div>
    </div>
  );

  const stageIdx = STAGES.findIndex(s => s.id === obra.etapa_atual);

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <HardHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-sm">ObraVisual</span>
          </Link>
          <Badge variant="outline" className="text-xs">Portal do Cliente</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-extrabold text-foreground">{obra.nome}</h1>
          {obra.endereco && (
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />{obra.endereco}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{obra.status}</Badge>
            <Badge variant="outline">{obra.tipo}</Badge>
            {obra.data_fim_prevista && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Entrega: {new Date(obra.data_fim_prevista).toLocaleDateString("pt-BR")}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Progresso", value: `${obra.percentual}%`, color: "text-primary" },
            { label: "Etapa atual", value: obra.etapa_atual, color: "text-accent" },
            { label: "Fotos", value: `${fotos.length}`, color: "text-foreground" },
            { label: "Aprovações", value: `${aprov.length}`, color: "text-green-600" },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-extrabold capitalize mt-1 ${m.color}`}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        {/* BARRA DE PROGRESSO */}
        <div className="mb-6 bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progresso geral</span>
            <span className="font-bold text-primary">{obra.percentual}%</span>
          </div>
          <Progress value={obra.percentual} className="h-3" />
          <div className="flex justify-between mt-3 overflow-x-auto">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center gap-1 min-w-[50px]">
                <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                  i < stageIdx ? "bg-primary border-primary" :
                  i === stageIdx ? "bg-accent border-accent animate-pulse" :
                  "bg-muted border-border"
                }`} />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <Tabs defaultValue="visao">
          <div className="overflow-x-auto pb-1 mb-4">
            <TabsList className="flex w-max h-auto gap-1">
              <TabsTrigger value="visao"><TrendingUp className="h-4 w-4 mr-1" />Visão geral</TabsTrigger>
              <TabsTrigger value="fotos"><Camera className="h-4 w-4 mr-1" />Fotos ({fotos.length})</TabsTrigger>
              <TabsTrigger value="timeline"><Clock className="h-4 w-4 mr-1" />Histórico</TabsTrigger>
              <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-1" />Chat</TabsTrigger>
              <TabsTrigger value="aprov"><CheckCircle2 className="h-4 w-4 mr-1" />Aprovações</TabsTrigger>
              <TabsTrigger value="antes"><ImageIcon className="h-4 w-4 mr-1" />Antes/depois</TabsTrigger>
              <TabsTrigger value="relatorio"><FileText className="h-4 w-4 mr-1" />Relatório</TabsTrigger>
            </TabsList>
          </div>

          {/* VISÃO GERAL */}
          <TabsContent value="visao">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Sua obra em construção</h3>
                <AnimatedHouse stage={obra.etapa_atual as ObraStage} />
              </Card>
              <div className="space-y-3">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Etapas</h3>
                  <div className="space-y-2">
                    {etapas.map((e, i) => {
                      const concluido = e.status === "concluido" || e.status === "aprovado";
                      const atual = e.etapa === obra.etapa_atual;
                      return (
                        <div key={e.id} className={`flex items-center gap-3 p-2 rounded-lg ${atual ? "bg-primary/5 border border-primary/20" : ""}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            concluido ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            atual ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                          }`}>
                            {concluido ? "✓" : i + 1}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm capitalize ${atual ? "font-semibold text-primary" : concluido ? "text-muted-foreground" : "text-foreground"}`}>
                              {e.etapa}
                            </p>
                            <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                              <div className={`h-full rounded-full ${concluido ? "bg-primary" : atual ? "bg-accent" : "bg-muted-foreground/20"}`}
                                style={{ width: `${e.percentual}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{e.percentual}%</span>
                          {atual && <Badge className="text-xs bg-accent text-accent-foreground">Atual</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Clima no local</p>
                  <ClimaWidget lat={obra.latitude} lon={obra.longitude} />
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* FOTOS */}
          <TabsContent value="fotos">
            {fotos.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma foto ainda. O engenheiro adicionará fotos em breve.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {fotos.map((f, i) => (
                  <div key={f.id} onClick={() => setLightbox(i)}
                    className="cursor-pointer rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img src={f.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={f.legenda || ""} />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground capitalize">{f.etapa}</p>
                      {f.legenda && <p className="text-xs truncate">{f.legenda}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lightbox */}
            <Dialog open={lightbox !== null} onOpenChange={() => setLightbox(null)}>
              <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
                {lightbox !== null && fotos[lightbox] && (
                  <div className="relative">
                    <img src={fotos[lightbox].url} className="w-full max-h-[80vh] object-contain" alt="" />
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
          </TabsContent>

          {/* HISTÓRICO */}
          <TabsContent value="timeline">
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum evento ainda.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((t, i) => (
                  <div key={t.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                        <span className="text-xs">
                          {t.tipo === "foto" ? "📸" : t.tipo === "etapa" ? "🔨" : t.tipo === "progresso" ? "📊" : "📝"}
                        </span>
                      </div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-xs">{t.tipo}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{t.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CHAT */}
          <TabsContent value="chat">
            <Card className="flex flex-col h-[500px]">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm">Chat com a equipe</p>
                <p className="text-xs text-muted-foreground">Tire dúvidas diretamente com o engenheiro</p>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.conteudo.startsWith("[Cliente]") ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                      m.conteudo.startsWith("[Cliente]")
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      <p>{m.conteudo.replace("[Cliente] ", "")}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{format(new Date(m.created_at), "HH:mm")}</p>
                    </div>
                  </div>
                ))}
                {msgs.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    Nenhuma mensagem ainda. Mande uma pergunta para o engenheiro!
                  </p>
                )}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input value={txt} onChange={e => setTxt(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && enviarMsg()}
                  placeholder="Escreva uma mensagem para o engenheiro..." />
                <Button onClick={enviarMsg}><Send className="h-4 w-4" /></Button>
              </div>
            </Card>
          </TabsContent>

          {/* APROVAÇÕES */}
          <TabsContent value="aprov">
            <div className="space-y-4">
              <Card className="p-5 space-y-3">
                <h3 className="font-bold">Aprovar etapa digitalmente</h3>
                <p className="text-sm text-muted-foreground">
                  Ao aprovar, você confirma que a etapa foi concluída conforme o combinado.
                </p>
                <select
                  value={etapaAprov}
                  onChange={e => setEtapaAprov(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                >
                  {etapas.map(e => <option key={e.id} value={e.etapa}>{e.etapa}</option>)}
                </select>
                <Input placeholder="Seu nome completo (assinatura)" value={assinatura}
                  onChange={e => setAssinatura(e.target.value)} />
                <Input placeholder="Comentário (opcional)" value={comentario}
                  onChange={e => setComentario(e.target.value)} />
                <Button onClick={aprovar} className="w-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" />Aprovar digitalmente
                </Button>
              </Card>

              {aprov.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Aprovações registradas</h4>
                  {aprov.map(a => (
                    <Card key={a.id} className="p-3">
                      <div className="flex justify-between">
                        <div>
                          <Badge className="mr-2 capitalize">{a.etapa}</Badge>
                          <span className="text-sm">por <strong>{a.assinatura}</strong></span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(a.created_at), "dd/MM/yyyy")}
                        </span>
                      </div>
                      {a.comentario && <p className="text-sm mt-1 text-muted-foreground">{a.comentario}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ANTES/DEPOIS */}
          <TabsContent value="antes">
            <BeforeAfterPorEtapa fotos={fotos} />
          </TabsContent>

          {/* RELATÓRIO */}
          <TabsContent value="relatorio">
            <Card className="p-8 text-center">
              <FileText className="h-14 w-14 mx-auto text-primary mb-4" />
              <h3 className="font-bold text-xl mb-2">Relatório da sua obra</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Baixe um PDF completo com o resumo do progresso, etapas e fotos da sua obra.
              </p>
              <Button size="lg" onClick={gerarPDF}>
                <Download className="h-5 w-5 mr-2" />Baixar relatório PDF
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border mt-12 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <Link to="/" className="text-primary font-medium hover:underline">ObraVisual</Link>
          {" "}— Acompanhamento de obras em tempo real
        </p>
      </footer>
    </div>
  );
}
