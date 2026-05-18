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
import { toast } from "sonner";
import AnimatedHouse, { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import BeforeAfter from "@/components/obra/BeforeAfter";
import ClimaWidget from "@/components/obra/ClimaWidget";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Upload, Send, CheckCircle2, FileText, DollarSign, BookOpen, MessageSquare, Clock, QrCode, Box, ImageIcon, ListChecks, Users, Copy, Download, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import MembrosObra from "@/components/obra/MembrosObra";
import { notificar, notificarMembros } from "@/lib/notificar";

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
    setObra(o.data); setEtapas(e.data ?? []); setFotos(f.data ?? []); setMsgs(m.data ?? []);
    setTl(t.data ?? []); setFin(fi.data ?? []); setDiario(d.data ?? []); setAprov(a.data ?? []);
    if (o.data) setStage(o.data.etapa_atual);
  }

  useEffect(() => { refresh(); }, [id]);

  // Realtime chat
  useEffect(() => {
    if (!id) return;
    const ch = supabase.channel(`obra-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens", filter: `obra_id=eq.${id}` },
        (p: any) => setMsgs(prev => [...prev, p.new]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  if (!obra) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const isOwner = obra.owner_id === user?.id;
  const orcamento = fin.filter(f=>f.tipo==="orcamento").reduce((a,b)=>a+Number(b.valor),0);
  const gastos    = fin.filter(f=>f.tipo==="gasto").reduce((a,b)=>a+Number(b.valor),0);
  const fotosEtapaAtual = fotos.filter(f => f.etapa === stage);

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
    const s = STAGES.find(x=>x.id===newStage)!;
    await supabase.from("obras").update({ etapa_atual: newStage, percentual: s.percent }).eq("id", obra.id);
    await logEvento("progresso", `Etapa atual: ${newStage} (${s.percent}%)`);
    await notificar(obra.owner_id, obra.id, "Etapa atualizada", `Nova etapa atual: ${newStage} (${s.percent}%)`, "info", `/app/obras/${obra.id}`);
    refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Link to="/app" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1 mb-3"><ArrowLeft className="h-3 w-3"/>Voltar</Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold">{obra.nome}</h1>
          <p className="text-muted-foreground">{obra.endereco}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{obra.tipo}</Badge>
          <Badge>{obra.status}</Badge>
        </div>
      </div>

      <Tabs defaultValue="visao">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="visao"><ListChecks className="h-4 w-4 mr-1"/>Visão geral</TabsTrigger>
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="fotos"><ImageIcon className="h-4 w-4 mr-1"/>Fotos</TabsTrigger>
          <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-1"/>Chat</TabsTrigger>
          <TabsTrigger value="timeline"><Clock className="h-4 w-4 mr-1"/>Timeline</TabsTrigger>
          <TabsTrigger value="financeiro"><DollarSign className="h-4 w-4 mr-1"/>Financeiro</TabsTrigger>
          <TabsTrigger value="diario"><BookOpen className="h-4 w-4 mr-1"/>Diário</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="vista3d"><Box className="h-4 w-4 mr-1"/>Vista 3D</TabsTrigger>
          <TabsTrigger value="aprov"><CheckCircle2 className="h-4 w-4 mr-1"/>Aprovações</TabsTrigger>
          <TabsTrigger value="antes"><ImageIcon className="h-4 w-4 mr-1"/>Antes/depois</TabsTrigger>
          <TabsTrigger value="qr"><QrCode className="h-4 w-4 mr-1"/>QR / Cliente</TabsTrigger>
          <TabsTrigger value="equipe"><Users className="h-4 w-4 mr-1"/>Equipe</TabsTrigger>
          <TabsTrigger value="relatorio"><FileText className="h-4 w-4 mr-1"/>Relatório</TabsTrigger>
        </TabsList>

        {/* VISÃO GERAL */}
        <TabsContent value="visao" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2">
              <h3 className="font-semibold mb-3">Casa em construção</h3>
              <AnimatedHouse stage={stage}/>
            </Card>
            <div className="space-y-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Progresso</p>
                <p className="text-3xl font-extrabold text-primary">{obra.percentual}%</p>
                <Progress value={obra.percentual} className="mt-2 h-2"/>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Etapa atual</p>
                <p className="font-bold">{obra.etapa_atual}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Clima local</p>
                <ClimaWidget lat={obra.latitude} lon={obra.longitude}/>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ETAPAS */}
        <TabsContent value="etapas" className="mt-4 space-y-3">
          {etapas.map(e => (
            <Card key={e.id} className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold capitalize">{e.etapa}</p>
                  <Progress value={e.percentual} className="mt-1 h-2"/>
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} max={100} className="w-20" defaultValue={e.percentual}
                      onBlur={ev => updateEtapa(e, { percentual: Number(ev.target.value) })}/>
                    <Select defaultValue={e.status} onValueChange={v=>updateEtapa(e,{ status: v })}>
                      <SelectTrigger className="w-40"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao_iniciado">Não iniciado</SelectItem>
                        <SelectItem value="em_andamento">Em andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={()=>setEtapaAtual(e.etapa)}>Tornar atual</Button>
                  </div>
                ) : <Badge variant="outline">{e.status}</Badge>}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* FOTOS */}
        <TabsContent value="fotos" className="mt-4">
          <FotosTab obraId={obra.id} fotos={fotos} stage={stage} setStage={setStage} onUpload={refresh} userId={user?.id}/>
        </TabsContent>

        {/* CHAT */}
        <TabsContent value="chat" className="mt-4">
          <ChatTab obraId={obra.id} msgs={msgs} userId={user?.id}/>
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline" className="mt-4">
          {tl.length === 0 ? <p className="text-muted-foreground">Nenhum evento ainda.</p> : (
            <div className="space-y-2">
              {tl.map(t=> (
                <Card key={t.id} className="p-3 flex justify-between">
                  <div><Badge variant="outline" className="mb-1">{t.tipo}</Badge><p className="text-sm">{t.descricao}</p></div>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.created_at),{addSuffix:true,locale:ptBR})}</span>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="financeiro" className="mt-4">
          <FinanceiroTab obraId={obra.id} fin={fin} orcamento={orcamento} gastos={gastos} valorPrev={obra.valor_previsto} userId={user?.id} isOwner={isOwner} onChange={refresh}/>
        </TabsContent>

        {/* DIÁRIO */}
        <TabsContent value="diario" className="mt-4">
          <DiarioTab obraId={obra.id} diario={diario} userId={user?.id} onChange={refresh}/>
        </TabsContent>

        {/* GANTT */}
        <TabsContent value="gantt" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Cronograma</h3>
            <div className="space-y-2">
              {etapas.map(e=>(
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <span className="w-28 capitalize">{e.etapa}</span>
                  <div className="flex-1 h-6 bg-muted rounded relative overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 rounded ${e.status==='concluido'||e.status==='aprovado'?'bg-primary':e.status==='em_andamento'?'bg-accent':'bg-muted-foreground/20'}`} style={{width:`${e.percentual}%`}}/>
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">{e.percentual}% — {e.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground w-24 text-right">{e.data_fim_prevista || "—"}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* VISTA 3D */}
        <TabsContent value="vista3d" className="mt-4">
          <Vista3D stage={stage}/>
        </TabsContent>

        {/* APROVAÇÕES */}
        <TabsContent value="aprov" className="mt-4">
          <AprovacoesTab obraId={obra.id} aprov={aprov} userId={user?.id} onChange={refresh}/>
        </TabsContent>

        {/* ANTES/DEPOIS */}
        <TabsContent value="antes" className="mt-4">
          {fotos.length < 2 ? <p className="text-muted-foreground">Faça upload de pelo menos 2 fotos para comparar.</p> :
            <BeforeAfter before={fotos[fotos.length-1].url} after={fotos[0].url}/>}
        </TabsContent>

        {/* QR */}
        <TabsContent value="qr" className="mt-4">
          <QrTab obra={obra}/>
        </TabsContent>

        {/* EQUIPE */}
        <TabsContent value="equipe" className="mt-4">
          <MembrosObra obraId={obra.id} ownerId={obra.owner_id}/>
        </TabsContent>

        {/* RELATÓRIO */}
        <TabsContent value="relatorio" className="mt-4">
          <Card className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-primary mb-3"/>
            <h3 className="font-bold mb-2">Relatório PDF da obra</h3>
            <p className="text-sm text-muted-foreground mb-4">Gere um PDF com resumo, etapas, financeiro e fotos</p>
            <Button onClick={()=>gerarPDF(obra, etapas, fin, fotos)}>Baixar PDF</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== Subcomponents =====
function FotosTab({ obraId, fotos, stage, setStage, onUpload, userId }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [legenda, setLegenda] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    if (!userId) return;
    setUploading(true);
    const path = `${userId}/${obraId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("fotos-obras").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: { publicUrl } } = supabase.storage.from("fotos-obras").getPublicUrl(path);
    const { error } = await supabase.from("fotos").insert({ obra_id: obraId, user_id: userId, url: publicUrl, etapa: stage, legenda });
    setUploading(false);
    if (error) return toast.error(error.message);
    await supabase.from("timeline_eventos").insert({ obra_id: obraId, user_id: userId, tipo: "foto", descricao: `Nova foto na etapa ${stage}` });
    await notificarMembros(obraId, userId, "Nova foto na obra", `Etapa ${stage}${legenda ? ": " + legenda : ""}`, "info", `/app/obras/${obraId}`);
    setLegenda(""); onUpload(); toast.success("Foto enviada!");
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <Label>Etapa</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{STAGES.map(s=><SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Legenda</Label><Input value={legenda} onChange={e=>setLegenda(e.target.value)} placeholder="Opcional"/></div>
          <Button onClick={()=>fileRef.current?.click()} disabled={uploading}><Upload className="h-4 w-4 mr-1"/>{uploading?"...":"Enviar"}</Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0] && upload(e.target.files[0])}/>
        </div>
      </Card>
      <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-3">
        {fotos.map((f:any) => (
          <Card key={f.id} className="overflow-hidden">
            <img src={f.url} className="w-full h-40 object-cover" alt={f.legenda || ""}/>
            <div className="p-2"><p className="text-xs text-muted-foreground capitalize">{f.etapa}</p>{f.legenda && <p className="text-sm">{f.legenda}</p>}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChatTab({ obraId, msgs, userId }: any) {
  const [txt, setTxt] = useState("");
  async function send() {
    if (!txt.trim() || !userId) return;
    await supabase.from("mensagens").insert({ obra_id: obraId, user_id: userId, conteudo: txt });
    setTxt("");
  }
  return (
    <Card className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {msgs.map((m:any)=>(
          <div key={m.id} className={`flex ${m.user_id===userId?"justify-end":"justify-start"}`}>
            <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${m.user_id===userId?"bg-primary text-primary-foreground":"bg-muted"}`}>
              <p>{m.conteudo}</p>
              <p className="text-[10px] opacity-60 mt-0.5">{format(new Date(m.created_at),"HH:mm")}</p>
            </div>
          </div>
        ))}
        {msgs.length===0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda</p>}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Mensagem..."/>
        <Button onClick={send}><Send className="h-4 w-4"/></Button>
      </div>
    </Card>
  );
}

function FinanceiroTab({ obraId, fin, orcamento, gastos, valorPrev, userId, isOwner, onChange }: any) {
  const [form, setForm] = useState({ tipo: "gasto", descricao: "", valor: "", categoria: "" });
  async function add() {
    if (!form.descricao || !form.valor) return;
    const { error } = await supabase.from("financeiro").insert({ obra_id: obraId, user_id: userId, tipo: form.tipo as any, descricao: form.descricao, valor: Number(form.valor), categoria: form.categoria || null });
    if (error) return toast.error(error.message);
    setForm({ tipo:"gasto", descricao:"", valor:"", categoria:"" }); onChange();
  }
  const desvio = valorPrev ? ((gastos - Number(valorPrev)) / Number(valorPrev) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Orçamento previsto</p><p className="text-2xl font-bold">R$ {Number(valorPrev||0).toLocaleString("pt-BR")}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Gasto até agora</p><p className="text-2xl font-bold text-accent">R$ {gastos.toLocaleString("pt-BR")}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Desvio</p><p className={`text-2xl font-bold ${desvio>0?"text-destructive":"text-primary"}`}>{desvio.toFixed(1)}%</p></Card>
      </div>
      {isOwner && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Novo lançamento</h4>
          <div className="grid sm:grid-cols-4 gap-2">
            <Select value={form.tipo} onValueChange={v=>setForm({...form,tipo:v})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="gasto">Gasto</SelectItem><SelectItem value="orcamento">Orçamento</SelectItem></SelectContent>
            </Select>
            <Input placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/>
            <Input placeholder="Valor R$" type="number" step="0.01" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})}/>
            <Button onClick={add}>Adicionar</Button>
          </div>
        </Card>
      )}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">Histórico</h4>
        {fin.length===0?<p className="text-muted-foreground text-sm">Sem lançamentos</p>:(
          <div className="space-y-1">
            {fin.map((f:any)=>(
              <div key={f.id} className="flex justify-between py-2 border-b text-sm last:border-0">
                <div><Badge variant={f.tipo==="gasto"?"destructive":"secondary"} className="mr-2">{f.tipo}</Badge>{f.descricao}</div>
                <div className="font-mono">R$ {Number(f.valor).toLocaleString("pt-BR")}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function DiarioTab({ obraId, diario, userId, onChange }: any) {
  const [form, setForm] = useState({ titulo: "", conteudo: "", clima: "", trabalhadores: "" });
  async function add() {
    if (!form.conteudo) return;
    const { error } = await supabase.from("diario_obra").insert({
      obra_id: obraId, user_id: userId, titulo: form.titulo || null, conteudo: form.conteudo,
      clima: form.clima || null, trabalhadores: form.trabalhadores ? Number(form.trabalhadores) : null,
    });
    if (error) return toast.error(error.message);
    setForm({ titulo:"", conteudo:"", clima:"", trabalhadores:"" }); onChange();
    toast.success("Registro adicionado");
  }
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold">Novo registro</h4>
        <Input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
        <Textarea placeholder="O que aconteceu hoje na obra..." rows={3} value={form.conteudo} onChange={e=>setForm({...form,conteudo:e.target.value})}/>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Clima (ex: ensolarado)" value={form.clima} onChange={e=>setForm({...form,clima:e.target.value})}/>
          <Input placeholder="Nº trabalhadores" type="number" value={form.trabalhadores} onChange={e=>setForm({...form,trabalhadores:e.target.value})}/>
        </div>
        <Button onClick={add}>Adicionar registro</Button>
      </Card>
      <div className="space-y-2">
        {diario.map((d:any)=>(
          <Card key={d.id} className="p-4">
            <div className="flex justify-between mb-1">
              <p className="font-semibold">{d.titulo || "Sem título"}</p>
              <span className="text-xs text-muted-foreground">{format(new Date(d.data),"dd/MM/yyyy")}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{d.conteudo}</p>
            {(d.clima||d.trabalhadores) && <p className="text-xs text-muted-foreground mt-2">{d.clima && `☀️ ${d.clima}`} {d.trabalhadores && `· 👷 ${d.trabalhadores}`}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function AprovacoesTab({ obraId, aprov, userId, onChange }: any) {
  const [etapa, setEtapa] = useState<ObraStage>("fundacao");
  const [assinatura, setAssinatura] = useState("");
  const [comentario, setComentario] = useState("");
  async function aprovar() {
    if (!assinatura) return toast.error("Digite seu nome como assinatura");
    const { error } = await supabase.from("aprovacoes").insert({ obra_id: obraId, user_id: userId, etapa, assinatura, comentario });
    if (error) return toast.error(error.message);
    setAssinatura(""); setComentario(""); onChange(); toast.success("Etapa aprovada digitalmente!");
  }
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold">Aprovar etapa</h4>
        <Select value={etapa} onValueChange={v=>setEtapa(v as ObraStage)}>
          <SelectTrigger><SelectValue/></SelectTrigger>
          <SelectContent>{STAGES.map(s=><SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Sua assinatura (nome completo)" value={assinatura} onChange={e=>setAssinatura(e.target.value)}/>
        <Textarea placeholder="Comentário (opcional)" rows={2} value={comentario} onChange={e=>setComentario(e.target.value)}/>
        <Button onClick={aprovar}><CheckCircle2 className="h-4 w-4 mr-1"/>Aprovar digitalmente</Button>
      </Card>
      <div className="space-y-2">
        {aprov.map((a:any)=>(
          <Card key={a.id} className="p-3">
            <div className="flex justify-between"><div><Badge>{a.etapa}</Badge> <span className="text-sm ml-2">por <strong>{a.assinatura}</strong></span></div><span className="text-xs text-muted-foreground">{format(new Date(a.created_at),"dd/MM/yyyy HH:mm")}</span></div>
            {a.comentario && <p className="text-sm mt-2 text-muted-foreground">{a.comentario}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Vista3D({ stage }: { stage: ObraStage }) {
  const idx = STAGES.findIndex(s=>s.id===stage);
  const has = (i: number) => idx >= i;
  return (
    <Card className="p-8 flex items-center justify-center min-h-[400px] bg-gradient-to-b from-sky-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
      <div className="relative" style={{ perspective: "800px" }}>
        <div className="relative" style={{ transform: "rotateX(20deg) rotateY(-25deg)", transformStyle: "preserve-3d" }}>
          {/* Terreno */}
          <div className="w-64 h-64 bg-amber-700/60 rounded shadow-2xl" style={{ transform: "rotateX(90deg) translateZ(-100px)" }}/>
          {/* Fundação */}
          {has(1) && <div className="absolute left-8 top-8 w-48 h-48 bg-stone-500 shadow-xl" style={{ transform: "translateZ(10px)" }}/>}
          {/* Estrutura/Paredes */}
          {has(2) && <div className="absolute left-8 top-8 w-48 h-32 bg-slate-300 border-4 border-slate-400" style={{ transform: "translateZ(60px)" }}/>}
          {has(3) && <div className="absolute left-8 top-8 w-48 h-32 bg-orange-200 border-2 border-orange-400" style={{ transform: "translateZ(60px)" }}/>}
          {/* Cobertura */}
          {has(4) && <div className="absolute left-4 -top-2 w-56 h-12 bg-red-600 transform skew-x-12 shadow-lg" style={{ transform: "translateZ(110px) rotateZ(-2deg)" }}/>}
          {/* Detalhes */}
          {has(6) && <div className="absolute left-20 top-32 w-8 h-12 bg-amber-900" style={{ transform: "translateZ(62px)" }}/>}
          {has(6) && <div className="absolute left-36 top-20 w-8 h-8 bg-sky-300 border-2 border-white" style={{ transform: "translateZ(62px)" }}/>}
        </div>
      </div>
    </Card>
  );
}

function gerarPDF(obra: any, etapas: any[], fin: any[], fotos: any[]) {
  const doc = new jsPDF();
  doc.setFontSize(20); doc.text(`Relatório — ${obra.nome}`, 14, 20);
  doc.setFontSize(10); doc.text(`Endereço: ${obra.endereco || "—"}`, 14, 30);
  doc.text(`Status: ${obra.status} · Progresso: ${obra.percentual}% · Etapa atual: ${obra.etapa_atual}`, 14, 36);
  doc.text(`Gerado em ${format(new Date(),"dd/MM/yyyy HH:mm")}`, 14, 42);

  let y = 54;
  doc.setFontSize(14); doc.text("Etapas", 14, y); y += 6;
  doc.setFontSize(10);
  etapas.forEach(e => { doc.text(`• ${e.etapa}: ${e.percentual}% — ${e.status}`, 16, y); y += 5; });

  y += 4; doc.setFontSize(14); doc.text("Financeiro", 14, y); y += 6;
  doc.setFontSize(10);
  const gastos = fin.filter(f=>f.tipo==="gasto").reduce((a,b)=>a+Number(b.valor),0);
  doc.text(`Orçamento previsto: R$ ${Number(obra.valor_previsto||0).toLocaleString("pt-BR")}`, 16, y); y+=5;
  doc.text(`Gastos: R$ ${gastos.toLocaleString("pt-BR")}`, 16, y); y+=5;

  y += 4; doc.setFontSize(14); doc.text(`Fotos (${fotos.length})`, 14, y);
  doc.save(`relatorio-${obra.nome}.pdf`);
}