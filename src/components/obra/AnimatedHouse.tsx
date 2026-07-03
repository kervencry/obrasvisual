import { motion, AnimatePresence } from "framer-motion";

export type ObraStage =
  | "terreno"
  | "fundacao"
  | "estrutura"
  | "alvenaria"
  | "cobertura"
  | "instalacoes"
  | "acabamento"
  | "entregue";

export const STAGES: { id: ObraStage; label: string; percent: number }[] = [
  { id: "terreno",     label: "Terreno",       percent: 0  },
  { id: "fundacao",    label: "Fundação",      percent: 14 },
  { id: "estrutura",   label: "Estrutura",     percent: 28 },
  { id: "alvenaria",   label: "Alvenaria",     percent: 42 },
  { id: "cobertura",   label: "Cobertura",     percent: 57 },
  { id: "instalacoes", label: "Instalações",   percent: 71 },
  { id: "acabamento",  label: "Acabamento",    percent: 85 },
  { id: "entregue",    label: "Entregue",      percent: 100 },
];

interface Props {
  stage: ObraStage;
  className?: string;
}

const stageIndex = (s: ObraStage) => STAGES.findIndex((x) => x.id === s);

export default function AnimatedHouse({ stage, className = "" }: Props) {
  const idx = stageIndex(stage);

  const show = (minStage: ObraStage) => idx >= stageIndex(minStage);
  const pct  = STAGES[idx].percent;

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox="0 0 400 260"
        className="w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── GROUND ── */}
        <rect x="20" y="230" width="360" height="14" rx="4" className="fill-muted-foreground/20" />

        {/* ── TERRENO: grass + sun ── */}
        <AnimatePresence>
          {show("terreno") && (
            <motion.g
              key="terreno"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* sun */}
              <circle cx="355" cy="38" r="18" className="fill-accent/80" />
              <line x1="355" y1="12" x2="355" y2="4"  stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="355" y1="64" x2="355" y2="72" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="329" y1="38" x2="321" y2="38" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="381" y1="38" x2="389" y2="38" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="337" y1="20" x2="331" y2="14" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="373" y1="56" x2="379" y2="62" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="373" y1="20" x2="379" y2="14" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="337" y1="56" x2="331" y2="62" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
              {/* grass patches */}
              <ellipse cx="55"  cy="228" rx="22" ry="6" className="fill-green-500/30" />
              <ellipse cx="330" cy="228" rx="18" ry="5" className="fill-green-500/30" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── FUNDAÇÃO ── */}
        <AnimatePresence>
          {show("fundacao") && (
            <motion.g
              key="fundacao"
              initial={{ scaleY: 0, originY: "100%" }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5 }}
            >
              <rect x="70" y="210" width="260" height="22" rx="3" className="fill-stone-500/70" />
              {/* foundation blocks pattern */}
              {[90,120,150,180,210,240,270,300].map((x) => (
                <line key={x} x1={x} y1="210" x2={x} y2="232" stroke="hsl(var(--background))" strokeWidth="1.5" opacity="0.4" />
              ))}
              <line x1="70" y1="221" x2="330" y2="221" stroke="hsl(var(--background))" strokeWidth="1.5" opacity="0.4" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── ESTRUTURA (pilares + laje) ── */}
        <AnimatePresence>
          {show("estrutura") && (
            <motion.g
              key="estrutura"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* pillars */}
              <rect x="75"  y="110" width="14" height="100" rx="2" className="fill-stone-400/80" />
              <rect x="311" y="110" width="14" height="100" rx="2" className="fill-stone-400/80" />
              {/* mid pillars */}
              <rect x="156" y="140" width="10" height="70"  rx="2" className="fill-stone-400/60" />
              <rect x="234" y="140" width="10" height="70"  rx="2" className="fill-stone-400/60" />
              {/* top beam */}
              <rect x="70" y="105" width="260" height="12" rx="3" className="fill-stone-500/70" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── ALVENARIA (paredes) ── */}
        <AnimatePresence>
          {show("alvenaria") && (
            <motion.g
              key="alvenaria"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              style={{ transformOrigin: "200px 210px" }}
              transition={{ duration: 0.7 }}
            >
              {/* main walls */}
              <rect x="89"  y="117" width="222" height="93" rx="2" className="fill-orange-100/80 dark:fill-orange-900/40" />
              {/* brick pattern lines */}
              {[130,150,170,190].map((y) => (
                <line key={y} x1="89" y1={y} x2="311" y2={y}
                  stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />
              ))}
              {[130,170].map((y) =>
                [105,145,185,225,265,295].map((x) => (
                  <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={y + 20}
                    stroke="hsl(var(--border))" strokeWidth="1" opacity="0.4" />
                ))
              )}
              {[150,190].map((y) =>
                [115,155,195,235,275].map((x) => (
                  <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={y + 20}
                    stroke="hsl(var(--border))" strokeWidth="1" opacity="0.4" />
                ))
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── COBERTURA (telhado) ── */}
        <AnimatePresence>
          {show("cobertura") && (
            <motion.g
              key="cobertura"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* roof fill */}
              <path d="M55 110 L200 38 L345 110 Z" className="fill-red-700/80 dark:fill-red-800/80" />
              {/* roof tiles lines */}
              {[62,78,95,112].map((offset) => (
                <line key={offset}
                  x1={55 + offset * 0.48} y1={110 - offset * 0.5}
                  x2={200} y2={38 + offset * 0.1}
                  stroke="hsl(var(--background))" strokeWidth="1" opacity="0.25"
                />
              ))}
              {[62,78,95,112].map((offset) => (
                <line key={`r${offset}`}
                  x1={345 - offset * 0.48} y1={110 - offset * 0.5}
                  x2={200} y2={38 + offset * 0.1}
                  stroke="hsl(var(--background))" strokeWidth="1" opacity="0.25"
                />
              ))}
              {/* ridge */}
              <line x1="200" y1="38" x2="200" y2="45" stroke="hsl(var(--background))" strokeWidth="2" strokeLinecap="round" />
              {/* overhang line */}
              <path d="M52 112 L200 39 L348 112" stroke="hsl(var(--background))" strokeWidth="1.5" opacity="0.4" fill="none" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── JANELAS ── */}
        <AnimatePresence>
          {show("alvenaria") && (
            <motion.g
              key="janelas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* left window */}
              <rect x="105" y="130" width="44" height="36" rx="3"
                className="fill-sky-200/80 dark:fill-sky-900/60"
                stroke="hsl(var(--border))" strokeWidth="1.5"
              />
              <line x1="127" y1="130" x2="127" y2="166" stroke="hsl(var(--border))" strokeWidth="1" />
              <line x1="105" y1="148" x2="149" y2="148" stroke="hsl(var(--border))" strokeWidth="1" />
              {/* right window */}
              <rect x="251" y="130" width="44" height="36" rx="3"
                className="fill-sky-200/80 dark:fill-sky-900/60"
                stroke="hsl(var(--border))" strokeWidth="1.5"
              />
              <line x1="273" y1="130" x2="273" y2="166" stroke="hsl(var(--border))" strokeWidth="1" />
              <line x1="251" y1="148" x2="295" y2="148" stroke="hsl(var(--border))" strokeWidth="1" />
              {/* window glow when instalacoes */}
              {show("instalacoes") && (
                <>
                  <rect x="106" y="131" width="42" height="34" rx="2"
                    className="fill-yellow-200/60 dark:fill-yellow-400/20"
                  />
                  <rect x="252" y="131" width="42" height="34" rx="2"
                    className="fill-yellow-200/60 dark:fill-yellow-400/20"
                  />
                </>
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── PORTA ── */}
        <AnimatePresence>
          {show("alvenaria") && (
            <motion.g
              key="porta"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: "200px 210px" }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <rect x="178" y="170" width="44" height="40" rx="4 4 0 0"
                className="fill-amber-800/80 dark:fill-amber-900/80"
                stroke="hsl(var(--border))" strokeWidth="1.5"
              />
              {/* door panels */}
              <rect x="182" y="174" width="17" height="16" rx="2"
                className="fill-amber-700/60" />
              <rect x="201" y="174" width="17" height="16" rx="2"
                className="fill-amber-700/60" />
              <rect x="182" y="194" width="17" height="12" rx="2"
                className="fill-amber-700/60" />
              <rect x="201" y="194" width="17" height="12" rx="2"
                className="fill-amber-700/60" />
              {/* door knob */}
              <circle cx="208" cy="192" r="2.5" className="fill-yellow-400" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── INSTALAÇÕES (pipes + electrical symbols) ── */}
        <AnimatePresence>
          {show("instalacoes") && (
            <motion.g
              key="instalacoes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* water pipe on wall */}
              <rect x="163" y="117" width="4" height="93" rx="2" className="fill-blue-400/50" />
              {/* electrical conduit */}
              <rect x="237" y="117" width="4" height="93" rx="2" className="fill-yellow-400/50" />
              {/* AC unit */}
              <rect x="291" y="126" width="22" height="14" rx="2"
                className="fill-slate-300/80 dark:fill-slate-600/80"
                stroke="hsl(var(--border))" strokeWidth="1"
              />
              <line x1="294" y1="129" x2="310" y2="129" stroke="hsl(var(--border))" strokeWidth="0.8" />
              <line x1="294" y1="133" x2="310" y2="133" stroke="hsl(var(--border))" strokeWidth="0.8" />
              <line x1="294" y1="137" x2="310" y2="137" stroke="hsl(var(--border))" strokeWidth="0.8" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── ACABAMENTO (paint + garden) ── */}
        <AnimatePresence>
          {show("acabamento") && (
            <motion.g
              key="acabamento"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* painted walls overlay */}
              <rect x="89" y="117" width="222" height="93" rx="2"
                className="fill-amber-50/60 dark:fill-amber-950/40"
              />
              {/* garden */}
              <ellipse cx="80"  cy="228" rx="28" ry="8"  className="fill-green-500/50" />
              <ellipse cx="320" cy="228" rx="28" ry="8"  className="fill-green-500/50" />
              {/* trees */}
              <rect x="56"  y="195" width="6"  height="30" rx="2" className="fill-amber-800/60" />
              <ellipse cx="59"  cy="190" rx="16" ry="18"  className="fill-green-600/70" />
              <rect x="316" y="195" width="6"  height="30" rx="2" className="fill-amber-800/60" />
              <ellipse cx="319" cy="190" rx="16" ry="18"  className="fill-green-600/70" />
              {/* path to door */}
              <rect x="185" y="218" width="30" height="16" rx="2"
                className="fill-stone-300/70 dark:fill-stone-600/70"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── ENTREGUE (flag + badge) ── */}
        <AnimatePresence>
          {show("entregue") && (
            <motion.g
              key="entregue"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              {/* flag pole */}
              <line x1="200" y1="38" x2="200" y2="14" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
              {/* flag */}
              <path d="M200 14 L222 20 L200 26 Z" className="fill-primary" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── ROOF OUTLINE when not built yet ── */}
        {!show("cobertura") && (
          <path
            d="M55 110 L200 38 L345 110"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeDasharray="8 5"
            opacity="0.4"
            fill="none"
          />
        )}

        {/* ── PROGRESS BAR at bottom ── */}
        <rect x="70" y="248" width="260" height="6" rx="3" className="fill-muted" />
        <motion.rect
          x="70" y="248" height="6" rx="3"
          className="fill-primary"
          initial={{ width: 0 }}
          animate={{ width: (260 * pct) / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <text
          x="200" y="260"
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: "9px", fontFamily: "var(--font-sans)" }}
        >
          {pct}% concluído
        </text>
      </svg>
    </div>
  );
}
