import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedHouse, { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import { ArrowRight, MessageCircle, QrCode, Camera, HardHat, Ruler, ClipboardList, ChevronDown, Menu, X, Check } from "lucide-react";

/* -----------------------------------------------------------------------
 * Landing pública ObraVisual — paleta Terra & Ferro (escopo local)
 * Palette: #faf7f2 papel · #e8dccb argila · #c4654a terracota · #1a1a1a ferro
 * Fonts: Archivo Black (títulos) · Hind (corpo) — carregadas em main.tsx
 * --------------------------------------------------------------------- */

const PAPER = "#faf7f2";
const CLAY = "#e8dccb";
const TERRACOTA = "#c4654a";
const IRON = "#1a1a1a";

const heading = "font-['Archivo_Black'] uppercase tracking-tight";
const body = "font-['Hind']";

/* ============================ NAVBAR ============================ */
function LandingNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Problema", href: "#problema" },
    { label: "Como funciona", href: "#solucao" },
    { label: "Portal do cliente", href: "#portal" },
    { label: "Calculadora", href: "#calc" },
    { label: "Planos", href: "#planos" },
  ];
  return (
    <nav className={`sticky top-0 z-50 border-b-2 bg-[${PAPER}] ${body}`} style={{ borderColor: IRON }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
        <a href="/" className={`flex items-center gap-2 ${heading} text-lg`} style={{ color: IRON }}>
          <span className="inline-block w-6 h-6 border-2" style={{ borderColor: IRON, background: TERRACOTA }} />
          ObraVisual
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {links.map(l => (
            <a key={l.href} href={l.href} className="hover:text-[color:var(--tc)] transition-colors" style={{ ["--tc" as any]: TERRACOTA, color: IRON }}>{l.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Link to="/auth" className="text-sm font-semibold px-3 py-2 border-2 hover:bg-[#e8dccb] transition-colors" style={{ borderColor: IRON, color: IRON }}>
            Criar conta
          </Link>
          <Link to="/auth" className={`text-sm ${heading} px-4 py-2 border-2 transition-colors`} style={{ background: IRON, color: PAPER, borderColor: IRON }}>
            Entrar
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" style={{ color: IRON }}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t-2 px-4 py-4 space-y-3" style={{ borderColor: IRON, background: PAPER }}>
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-semibold" style={{ color: IRON }}>{l.label}</a>
          ))}
          <div className="pt-3 border-t-2 flex flex-col gap-2" style={{ borderColor: IRON }}>
            <Link to="/auth" className="text-sm font-semibold px-3 py-2 border-2 text-center" style={{ borderColor: IRON, color: IRON }}>Criar conta</Link>
            <Link to="/auth" className={`text-sm ${heading} px-4 py-2 text-center border-2`} style={{ background: IRON, color: PAPER, borderColor: IRON }}>Entrar</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ============================ HERO ============================ */
function Hero() {
  const [stage, setStage] = useState<ObraStage>("alvenaria");
  const stageData = STAGES.find(s => s.id === stage)!;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Título + CTA */}
        <div className="lg:col-span-8 border-4 p-8 md:p-12 flex flex-col justify-between min-h-[420px]"
          style={{ background: CLAY, borderColor: IRON, color: IRON }}>
          <div>
            <div className="inline-block px-2 py-1 mb-6 text-[10px] font-bold uppercase tracking-widest border-2" style={{ borderColor: IRON, background: PAPER }}>
              Para engenheiros, arquitetos e mestres de obras
            </div>
            <h1 className={`${heading} text-5xl md:text-7xl leading-none mb-6`}>
              OBRA NÃO É<br/>
              <span style={{ color: TERRACOTA }}>PLANILHA.</span>
            </h1>
            <p className="text-lg md:text-2xl max-w-xl font-semibold leading-tight">
              Registre o canteiro no celular, entregue transparência real ao cliente e pare de apagar incêndio no WhatsApp.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className={`${heading} px-6 py-4 border-2 flex items-center gap-2 hover:bg-[${TERRACOTA}] transition-colors`}
              style={{ background: IRON, color: PAPER, borderColor: IRON }}>
              Começar grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#calc" className={`${heading} px-6 py-4 border-2 hover:bg-[${IRON}] hover:text-[${PAPER}] transition-colors`}
              style={{ borderColor: IRON, color: IRON }}>
              Calcular economia
            </a>
          </div>
        </div>

        {/* AnimatedHouse dentro de prancheta */}
        <div className="lg:col-span-4 border-4 p-4 flex flex-col" style={{ background: PAPER, borderColor: IRON }}>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: IRON }}>
            <span>Progresso ao vivo</span>
            <span style={{ color: TERRACOTA }}>{stageData.percent}%</span>
          </div>
          <div className="flex-1 border-2 border-dashed p-2 min-h-[220px] flex items-center justify-center"
            style={{ borderColor: IRON, background: CLAY }}>
            <AnimatedHouse stage={stage} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1">
            {STAGES.map(s => (
              <button key={s.id} onClick={() => setStage(s.id)}
                className="text-[9px] font-bold uppercase py-2 border-2 transition-all"
                style={{
                  borderColor: IRON,
                  background: s.id === stage ? IRON : PAPER,
                  color: s.id === stage ? PAPER : IRON,
                }}>
                {s.label.replace(" 🎉", "")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ DOR ============================ */
function Dor() {
  const dores = [
    { titulo: "Cliente ligando toda semana", texto: "\"E aí, como tá a obra?\" No WhatsApp, no domingo, no meio da reunião." },
    { titulo: "Visita presencial atrapalhando", texto: "Cliente aparecendo no canteiro sem avisar e travando o cronograma da equipe." },
    { titulo: "Retrabalho por falta de registro", texto: "Foto perdida na galeria do mestre, dúvida sobre o que foi executado, prejuízo no bolso." },
    { titulo: "Desconfiança do cliente", texto: "Sem transparência, cada medição vira uma negociação. Cada aditivo vira briga." },
  ];
  return (
    <section id="problema" className="mt-4" style={{ background: IRON, color: PAPER }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end mb-12">
          <div className="md:col-span-8">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: TERRACOTA }}>
              O problema que ninguém resolve
            </div>
            <h2 className={`${heading} text-4xl md:text-6xl leading-none`}>
              Você não vende obra.<br/>
              <span style={{ color: TERRACOTA }}>Você vende confiança.</span>
            </h2>
          </div>
          <p className="md:col-span-4 text-lg opacity-80">
            E confiança quebra toda vez que o cliente fica no escuro. É por isso que existe o ObraVisual.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dores.map((d, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="border-2 p-6" style={{ borderColor: PAPER + "33" }}>
              <div className={`${heading} text-3xl mb-3`} style={{ color: TERRACOTA }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 className="font-bold uppercase text-sm mb-2">{d.titulo}</h3>
              <p className="text-sm opacity-70 leading-snug">{d.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ SOLUÇÃO / BENTO FEATURES ============================ */
function Solucao() {
  return (
    <section id="solucao" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="mb-10 md:flex md:items-end md:justify-between gap-8">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: TERRACOTA }}>A solução</div>
          <h2 className={`${heading} text-4xl md:text-6xl leading-none`} style={{ color: IRON }}>
            Um canteiro que<br/>se documenta sozinho.
          </h2>
        </div>
        <p className="max-w-md text-lg mt-4 md:mt-0" style={{ color: IRON }}>
          O mestre bate a foto pelo celular. O sistema monta a linha do tempo, notifica o cliente e libera o próximo pagamento. Sem planilha, sem WhatsApp acumulado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Diário de obra */}
        <div className="md:col-span-5 border-4 p-8 flex flex-col justify-between min-h-[280px]"
          style={{ background: CLAY, borderColor: IRON, color: IRON }}>
          <div>
            <Camera className="w-8 h-8 mb-4" />
            <h3 className={`${heading} text-2xl mb-2`}>Diário de obra pelo celular</h3>
            <p className="text-sm font-semibold leading-snug">Foto, legenda, etapa. Em 20 segundos você registra o que fez hoje — sem sair do canteiro.</p>
          </div>
          <div className="mt-6 flex gap-2 flex-wrap">
            {["Fundação", "Alvenaria", "Cobertura"].map(t => (
              <span key={t} className="text-[10px] font-bold uppercase px-2 py-1 border-2" style={{ borderColor: IRON, background: PAPER }}>{t}</span>
            ))}
          </div>
        </div>

        {/* WhatsApp destaque */}
        <div className="md:col-span-7 border-4 p-8 flex flex-col justify-between min-h-[280px]"
          style={{ background: TERRACOTA, color: PAPER, borderColor: IRON }}>
          <div>
            <MessageCircle className="w-8 h-8 mb-4" />
            <h3 className={`${heading} text-3xl md:text-4xl mb-3`}>Notificação chega no WhatsApp.</h3>
            <p className="text-lg font-semibold max-w-lg leading-snug">
              Porque cliente brasileiro não abre e-mail. Cada nova foto, medição ou etapa concluída dispara uma mensagem direta — com link do portal.
            </p>
          </div>
          <div className="mt-6 border-2 p-4 text-sm font-mono max-w-md" style={{ borderColor: PAPER, background: IRON + "22" }}>
            <div className="opacity-70 text-xs mb-1">ObraVisual · agora</div>
            <div>📸 Nova foto na etapa <b>Cobertura</b> da sua obra. Toque para ver.</div>
          </div>
        </div>

        {/* Antes/Depois */}
        <div className="md:col-span-4 border-4 p-6" style={{ background: PAPER, borderColor: IRON, color: IRON }}>
          <ClipboardList className="w-7 h-7 mb-3" />
          <h3 className={`${heading} text-xl mb-2`}>Antes / Depois por etapa</h3>
          <p className="text-sm">Compare fotos da mesma etapa lado a lado. Prova visual do serviço executado.</p>
        </div>

        {/* Aprovações */}
        <div className="md:col-span-4 border-4 p-6" style={{ background: PAPER, borderColor: IRON, color: IRON }}>
          <Check className="w-7 h-7 mb-3" />
          <h3 className={`${heading} text-xl mb-2`}>Aprovações registradas</h3>
          <p className="text-sm">Cliente aprova aditivo, alteração ou pagamento pelo portal. Fica tudo no histórico, datado.</p>
        </div>

        {/* Financeiro */}
        <div className="md:col-span-4 border-4 p-6" style={{ background: PAPER, borderColor: IRON, color: IRON }}>
          <Ruler className="w-7 h-7 mb-3" />
          <h3 className={`${heading} text-xl mb-2`}>Previsto × realizado</h3>
          <p className="text-sm">Cada etapa com custo orçado e efetivo. Upload da nota fiscal direto no lançamento.</p>
        </div>
      </div>
    </section>
  );
}

/* ============================ PORTAL DO CLIENTE ============================ */
function Portal() {
  return (
    <section id="portal" className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Screenshot mock */}
        <div className="md:col-span-7 border-4 p-1" style={{ background: PAPER, borderColor: IRON }}>
          <div className="border-b-4 px-4 py-2 flex items-center gap-2" style={{ borderColor: IRON, background: CLAY }}>
            <div className="w-3 h-3 rounded-full" style={{ background: TERRACOTA }} />
            <div className="w-3 h-3 rounded-full" style={{ background: IRON, opacity: 0.3 }} />
            <div className="w-3 h-3 rounded-full" style={{ background: IRON, opacity: 0.3 }} />
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: IRON }}>
              obravisual.com/obra/casa-santos
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: IRON }}>Residência Santos</div>
                <div className={`${heading} text-2xl`} style={{ color: IRON }}>68% concluído</div>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold uppercase border-2" style={{ borderColor: IRON, background: TERRACOTA, color: PAPER }}>
                Em obra
              </span>
            </div>
            <div className="h-3 w-full border-2" style={{ borderColor: IRON, background: PAPER }}>
              <div className="h-full" style={{ width: "68%", background: TERRACOTA }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[TERRACOTA, CLAY, IRON].map((c, i) => (
                <div key={i} className="aspect-square border-2 flex items-end p-2" style={{ borderColor: IRON, background: c }}>
                  <span className="text-[9px] font-bold uppercase" style={{ color: c === IRON ? PAPER : IRON }}>
                    {["Cobertura", "Alvenaria", "Fundação"][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t-2 pt-3 text-sm" style={{ borderColor: IRON, color: IRON }}>
              <b>Última atualização:</b> ontem, 17:42 — telhado colocado no lote traseiro.
            </div>
          </div>
        </div>

        {/* Copy do portal */}
        <div className="md:col-span-5 border-4 p-8 flex flex-col justify-between"
          style={{ background: IRON, color: PAPER, borderColor: IRON }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: TERRACOTA }}>
              Como o cliente vê sua obra sem precisar visitar
            </div>
            <h2 className={`${heading} text-3xl md:text-4xl leading-none mb-4`}>
              Um link. Sem senha. Sem app.
            </h2>
            <p className="text-base opacity-80 leading-snug mb-6">
              O cliente abre o portal no celular e vê tudo: percentual da etapa, últimas fotos, previsão de entrega. Você entrega transparência real, ele para de ligar.
            </p>
            <ul className="space-y-2 text-sm">
              {["Link exclusivo por obra", "Cliente cria conta e vincula a obra pelo token dentro do painel", "Funciona no celular sem baixar nada"].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: TERRACOTA }} /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/auth" className={`mt-6 ${heading} inline-flex items-center gap-2 px-6 py-3 border-2 w-fit transition-colors`}
            style={{ borderColor: PAPER, background: TERRACOTA, color: PAPER }}>
            Criar conta do cliente <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================ QR CODE + PORTFÓLIO ============================ */
function QRPortfolio() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* QR Code na placa */}
        <div className="md:col-span-5 border-4 p-8 flex flex-col md:flex-row items-center gap-6"
          style={{ background: TERRACOTA, color: PAPER, borderColor: IRON }}>
          <div className="w-32 h-32 border-4 p-2 shrink-0" style={{ borderColor: IRON, background: PAPER }}>
            <div className="w-full h-full grid grid-cols-5 gap-[2px]" style={{ background: IRON }}>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} style={{ background: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24].includes(i) ? PAPER : IRON }} />
              ))}
            </div>
          </div>
          <div>
            <QrCode className="w-6 h-6 mb-2" />
            <h3 className={`${heading} text-2xl md:text-3xl mb-2`}>QR na placa da obra</h3>
            <p className="text-sm font-semibold leading-snug">
              Imprima na placa do canteiro. Vizinho, cliente ou futuro proprietário aponta o celular e vê o andamento — vira propaganda ambulante do seu trabalho.
            </p>
          </div>
        </div>

        {/* Portfólio público */}
        <div className="md:col-span-7 border-4 p-8 flex flex-col justify-between"
          style={{ background: CLAY, color: IRON, borderColor: IRON }}>
          <div>
            <HardHat className="w-7 h-7 mb-3" />
            <h3 className={`${heading} text-2xl md:text-3xl mb-3`}>Sua vitrine pública de obras entregues.</h3>
            <p className="text-base font-semibold max-w-lg leading-snug">
              Cada obra concluída vira uma página no seu portfólio público. Enquanto o cliente vê a evolução, o próximo cliente já está te encontrando pelo Google.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[PAPER, IRON, TERRACOTA, PAPER].map((c, i) => (
              <div key={i} className="aspect-[4/3] border-2 flex items-end p-2" style={{ borderColor: IRON, background: c }}>
                <span className="text-[9px] font-bold uppercase" style={{ color: c === IRON ? PAPER : IRON }}>
                  Obra {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ CALCULADORA ============================ */
function Calculadora() {
  const [visitas, setVisitas] = useState(6);
  const [duracao, setDuracao] = useState(2);
  const horasMes = visitas * duracao;
  // suposição: ObraVisual reduz em 60% o tempo com visitas presenciais
  const economia = useMemo(() => Math.round(horasMes * 0.6), [horasMes]);
  const dias = (economia / 8).toFixed(1);

  return (
    <section id="calc" style={{ background: IRON, color: PAPER }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: TERRACOTA }}>
              Calculadora
            </div>
            <h2 className={`${heading} text-4xl md:text-5xl leading-none mb-4`}>
              Quanto tempo você<br/>economiza por mês?
            </h2>
            <p className="opacity-80 max-w-md">
              Cada visita presencial em obra come sua manhã. Menos visitas de rotina = mais horas produzindo projeto ou fechando obra nova.
            </p>
          </div>

          <div className="md:col-span-7 border-4 p-6 md:p-8" style={{ borderColor: PAPER, background: IRON }}>
            <div className="space-y-6">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-80">Visitas de obra por mês</label>
                  <span className={`${heading} text-2xl`} style={{ color: TERRACOTA }}>{visitas}</span>
                </div>
                <input type="range" min={1} max={30} value={visitas}
                  onChange={e => setVisitas(Number(e.target.value))}
                  className="w-full accent-[color:var(--tc)]"
                  style={{ ["--tc" as any]: TERRACOTA }} />
              </div>
              <div>
                <div className="flex items-end justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-80">Horas por visita (ida + volta)</label>
                  <span className={`${heading} text-2xl`} style={{ color: TERRACOTA }}>{duracao}h</span>
                </div>
                <input type="range" min={1} max={8} value={duracao}
                  onChange={e => setDuracao(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: TERRACOTA }} />
              </div>

              <div className="border-t-2 pt-6" style={{ borderColor: PAPER + "33" }}>
                <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Você economiza</div>
                <div className="flex items-end gap-3 flex-wrap">
                  <span className={`${heading} text-6xl md:text-7xl`} style={{ color: TERRACOTA }}>{economia}h</span>
                  <span className="text-lg opacity-80 mb-2">por mês · ~{dias} dias úteis</span>
                </div>
                <p className="text-sm opacity-70 mt-2">
                  Baseado em uma redução de 60% nas visitas presenciais que hoje só servem para dar satisfação ao cliente.
                </p>
              </div>

              <Link to="/auth" className={`${heading} inline-flex items-center gap-2 px-6 py-4 border-2 w-full justify-center transition-colors`}
                style={{ background: TERRACOTA, color: PAPER, borderColor: TERRACOTA }}>
                Quero começar agora <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ DEPOIMENTO ============================ */
function Depoimento() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="border-4 p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
        style={{ background: PAPER, borderColor: IRON, color: IRON }}>
        <div className="md:col-span-3 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces"
            alt="Engenheiro civil"
            className="w-40 h-40 md:w-52 md:h-52 object-cover border-4"
            style={{ borderColor: IRON }}
          />
        </div>
        <div className="md:col-span-9">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: TERRACOTA }}>
            Obra piloto · em uso real
          </div>
          <blockquote className={`${heading} text-2xl md:text-3xl leading-tight mb-4`}>
            "O cliente parou de ligar no domingo. Foi isso. Só isso já pagou a assinatura três vezes."
          </blockquote>
          <div className="text-sm font-semibold">
            Ricardo M. · Engenheiro Civil<br/>
            <span className="opacity-60">Residencial Vila Nova — Guarulhos/SP</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ PLANOS ============================ */
function Planos() {
  const planos = [
    {
      nome: "Solo",
      preco: "Grátis",
      alvo: "Testar com 1 obra",
      cta: "Começar grátis",
      feats: ["1 obra ativa", "Diário e fotos", "Portal do cliente", "QR na placa"],
      destaque: false,
    },
    {
      nome: "Profissional",
      preco: "R$ 79/mês",
      alvo: "Engenheiros e arquitetos",
      cta: "Assinar",
      feats: ["Obras ilimitadas", "Antes/Depois por etapa", "Aprovações e financeiro", "Notificação por WhatsApp", "Portfólio público"],
      destaque: true,
    },
    {
      nome: "Construtora",
      preco: "Sob consulta",
      alvo: "Equipes com mestres e clientes",
      cta: "Falar com a gente",
      feats: ["Usuários ilimitados", "Mestres, arquitetos e clientes", "Marca própria no portal", "Suporte dedicado"],
      destaque: false,
    },
  ];
  return (
    <section id="planos" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="mb-10 text-center">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: TERRACOTA }}>Planos</div>
        <h2 className={`${heading} text-4xl md:text-6xl leading-none`} style={{ color: IRON }}>
          Do primeiro cliente à<br/>obra número 100.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {planos.map(p => (
          <div key={p.nome} className="border-4 p-8 flex flex-col"
            style={{
              background: p.destaque ? IRON : PAPER,
              color: p.destaque ? PAPER : IRON,
              borderColor: IRON,
            }}>
            {p.destaque && (
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3 self-start px-2 py-1"
                style={{ background: TERRACOTA, color: PAPER }}>
                Mais escolhido
              </div>
            )}
            <h3 className={`${heading} text-2xl mb-1`}>{p.nome}</h3>
            <div className="text-xs uppercase tracking-widest opacity-70 mb-4">{p.alvo}</div>
            <div className={`${heading} text-4xl mb-6`} style={{ color: p.destaque ? TERRACOTA : IRON }}>{p.preco}</div>
            <ul className="space-y-2 text-sm mb-8 flex-1">
              {p.feats.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: TERRACOTA }} /> {f}
                </li>
              ))}
            </ul>
            <Link to="/auth" className={`${heading} text-center px-4 py-3 border-2 transition-colors`}
              style={{
                background: p.destaque ? TERRACOTA : IRON,
                color: PAPER,
                borderColor: p.destaque ? TERRACOTA : IRON,
              }}>
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================ FAQ ============================ */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2" style={{ borderColor: IRON + "33" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className={`${heading} text-lg`} style={{ color: IRON }}>{q}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: TERRACOTA }} />
      </button>
      {open && <p className="pb-5 text-sm max-w-3xl" style={{ color: IRON }}>{a}</p>}
    </div>
  );
}
function FAQ() {
  const items = [
    { q: "Preciso instalar app no celular do cliente?", a: "Não. O cliente abre um link no navegador do celular. Também pode criar conta e colar o token da obra para salvar o acesso." },
    { q: "Funciona sem internet no canteiro?", a: "O registro fica salvo e sincroniza quando o celular voltar a ter conexão. O mestre não precisa ficar preso ao sinal." },
    { q: "Posso ter mais de uma obra ao mesmo tempo?", a: "No plano gratuito, uma obra. No Profissional, ilimitadas. No Construtora, várias equipes e clientes por obra." },
    { q: "Como funciona a notificação por WhatsApp?", a: "Toda vez que uma foto, medição ou etapa é registrada, o cliente recebe uma mensagem no WhatsApp com o link direto para o portal." },
  ];
  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: TERRACOTA }}>Perguntas</div>
        <h2 className={`${heading} text-4xl md:text-5xl leading-none`} style={{ color: IRON }}>
          Antes de perder mais<br/>uma manhã em obra.
        </h2>
      </div>
      <div>{items.map((it, i) => <FAQItem key={i} {...it} />)}</div>
    </section>
  );
}

/* ============================ CTA + FOOTER ============================ */
function Fim() {
  return (
    <section style={{ background: TERRACOTA, color: PAPER }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <h2 className={`${heading} text-4xl md:text-6xl leading-none`}>
            Pare de vender obra no escuro.
          </h2>
          <p className="text-lg mt-4 max-w-2xl opacity-90">
            Sua próxima obra pode começar hoje com transparência de verdade. É grátis para testar com a primeira.
          </p>
        </div>
        <div className="md:col-span-4 flex flex-col gap-3">
          <Link to="/auth" className={`${heading} px-6 py-4 border-2 text-center`}
            style={{ background: IRON, color: PAPER, borderColor: IRON }}>
            Criar conta grátis
          </Link>
          <Link to="/auth" className={`${heading} px-6 py-4 border-2 text-center`}
            style={{ borderColor: PAPER, color: PAPER }}>
            Sou cliente — vincular obra
          </Link>
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer style={{ background: IRON, color: PAPER }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className={`${heading} text-lg flex items-center gap-2`}>
          <span className="inline-block w-5 h-5 border-2" style={{ borderColor: PAPER, background: TERRACOTA }} />
          ObraVisual
        </div>
        <div className="text-xs opacity-70">© {new Date().getFullYear()} ObraVisual · Feito para quem constrói de verdade.</div>
      </div>
    </footer>
  );
}

/* ============================ PAGE ============================ */
const Index = () => (
  <div className={body} style={{ background: PAPER, color: IRON }}>
    <LandingNav />
    <main>
      <Hero />
      <Dor />
      <Solucao />
      <Portal />
      <QRPortfolio />
      <Calculadora />
      <Depoimento />
      <Planos />
      <FAQ />
      <Fim />
    </main>
    <Footer />
  </div>
);

export default Index;
