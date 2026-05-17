import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera, CheckCircle2, Clock, MessageSquare,
  FileText, Bell, TrendingUp, Calendar,
  ChevronRight, AlertCircle, User, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AnimatedHouse, { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import { Link } from "react-router-dom";

// ─── mock data ────────────────────────────────────────────────────
const OBRA = {
  nome: "Residência Santos",
  endereco: "Rua das Flores, 142 — Camaçari, BA",
  cliente: "João Santos",
  engenheiro: "Eng. Rafael Lima",
  arquiteto: "Arq. Camila Torres",
  inicio: "Ago 2025",
  previsao: "Mar 2026",
  orcamento: "R$ 480.000",
  gastoAtual: "R$ 312.000",
  stage: "alvenaria" as ObraStage,
};

const TIMELINE = [
  { data: "15 Mai 2026", autor: "Eng. Rafael Lima", tipo: "update",   texto: "Alvenaria do 2º pavimento 80% concluída. Iniciando vergas das janelas." },
  { data: "12 Mai 2026", autor: "Eng. Rafael Lima", tipo: "foto",     texto: "10 novas fotos adicionadas — etapa: Alvenaria" },
  { data: "08 Mai 2026", autor: "Arq. Camila Torres", tipo: "doc",    texto: "Planta hidráulica revisada enviada para aprovação." },
  { data: "02 Mai 2026", autor: "João Santos",       tipo: "aprovacao",texto: "Etapa 'Estrutura' aprovada pelo cliente." },
  { data: "25 Abr 2026", autor: "Eng. Rafael Lima",  tipo: "alerta",  texto: "Chuvas intensas — 3 dias de atraso previstos. Prazo ajustado." },
];

const FOTOS = [
  { etapa: "Alvenaria", data: "15 Mai 2026", src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&q=60" },
  { etapa: "Estrutura", data: "02 Mai 2026", src: "https://images.unsplash.com/photo-1460574283810-2aab119d8511?w=300&q=60" },
  { etapa: "Fundação",  data: "10 Abr 2026", src: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&q=60" },
  { etapa: "Fundação",  data: "05 Abr 2026", src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&q=60" },
];

const stageIdx = STAGES.findIndex((s) => s.id === OBRA.stage);
const pct = STAGES[stageIdx].percent;

const tipoIcon: Record<string, React.ReactNode> = {
  update:    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />,
  foto:      <Camera className="h-3.5 w-3.5 text-purple-500" />,
  doc:       <FileText className="h-3.5 w-3.5 text-orange-500" />,
  aprovacao: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  alerta:    <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
};

// ─── component ────────────────────────────────────────────────────
export default function ObraDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "fotos" | "timeline" | "chat">("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">{OBRA.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ── OBRA HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{OBRA.nome}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{OBRA.endereco}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />{OBRA.engenheiro}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />{OBRA.arquiteto}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />Relatório PDF
              </Button>
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />Falar com Eng.
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── METRICS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Progresso",      value: `${pct}%`,          sub: "da obra concluída",   color: "text-primary" },
            { label: "Etapa atual",    value: "Alvenaria",         sub: "Em andamento ⚡",     color: "text-accent" },
            { label: "Prazo",          value: "Mar 2026",          sub: "No prazo ✓",          color: "text-green-600" },
            { label: "Orçamento",      value: OBRA.orcamento,      sub: `Gasto: ${OBRA.gastoAtual}`, color: "text-foreground" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-extrabold mt-1 ${m.color}`}>{m.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progresso geral</span>
            <span>{pct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-3 overflow-x-auto">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center gap-1 min-w-[50px]">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  i < stageIdx  ? "bg-primary border-primary" :
                  i === stageIdx ? "bg-accent border-accent animate-pulse" :
                  "bg-muted border-border"
                }`} />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {(["overview","fotos","timeline","chat"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {{ overview: "Visão Geral", fotos: "Fotos", timeline: "Histórico", chat: "Chat" }[tab]}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* House */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold mb-4">Visualização da Obra</h3>
              <AnimatedHouse stage={OBRA.stage} />
            </motion.div>

            {/* Etapas list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold mb-4">Status das Etapas</h3>
              <div className="space-y-2.5">
                {STAGES.map((s, i) => {
                  const done   = i < stageIdx;
                  const active = i === stageIdx;
                  return (
                    <div key={s.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${
                      active ? "bg-primary/5 border border-primary/20" : ""
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        done   ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        active ? "bg-accent/20 text-accent" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${active ? "font-semibold text-primary" : done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {s.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{s.percent}%</span>
                      {active && (
                        <Badge className="text-xs bg-accent text-accent-foreground">Atual</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* ── TAB: FOTOS ── */}
        {activeTab === "fotos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FOTOS.map((f, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden group cursor-pointer">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={f.src}
                      alt={f.etapa}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground">{f.etapa}</p>
                    <p className="text-xs text-muted-foreground">{f.data}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline">Ver todas as fotos (48)</Button>
            </div>
          </motion.div>
        )}

        {/* ── TAB: TIMELINE ── */}
        {activeTab === "timeline" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-4">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                      {tipoIcon[item.tipo]}
                    </div>
                    {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{item.autor}</span>
                      <span className="text-xs text-muted-foreground">{item.data}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── TAB: CHAT ── */}
        {activeTab === "chat" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ChatDemo />
          </motion.div>
        )}
      </main>
    </div>
  );
}

// ─── inline chat demo ─────────────────────────────────────────────
function ChatDemo() {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([
    { de: "eng", texto: "Bom dia! A alvenaria do 2º pavimento está avançando bem. Previsão de conclusão em 5 dias." },
    { de: "eu",  texto: "Ótimo! E a questão das janelas que discutimos?" },
    { de: "eng", texto: "Já confirmei com o fornecedor. As esquadrias chegam na semana que vem. ✅" },
  ]);

  const enviar = () => {
    if (!msg.trim()) return;
    setMsgs((m) => [...m, { de: "eu", texto: msg }]);
    setMsg("");
    setTimeout(() => {
      setMsgs((m) => [...m, { de: "eng", texto: "Recebi! Vou verificar e te retorno em breve. 👷" }]);
    }, 1200);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style={{ height: 420 }}>
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Eng. Rafael Lima</p>
          <p className="text-xs text-green-500">● Online agora</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.de === "eu" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
              m.de === "eu"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}>
              {m.texto}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Escreva uma mensagem..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
        />
        <Button size="sm" onClick={enviar}>Enviar</Button>
      </div>
    </div>
  );
}
