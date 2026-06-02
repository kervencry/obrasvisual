import { motion, AnimatePresence } from "framer-motion";
import { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import { Card } from "@/components/ui/card";

/**
 * Vista isométrica 3D da casa.
 * Renderizada via SVG com perspectiva isométrica (sem libs 3D).
 */
export default function Vista3DCasa({ stage }: { stage: ObraStage }) {
  const idx = STAGES.findIndex(s => s.id === stage);
  const show = (i: number) => idx >= i;
  const pct = STAGES[idx]?.percent ?? 0;

  return (
    <Card className="p-4 md:p-8 bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">Vista isométrica da obra</h3>
          <p className="text-xs text-muted-foreground capitalize">Etapa: {stage} — {pct}%</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"/>
          <span className="w-2 h-2 rounded-full bg-amber-500"/>
          <span className="w-2 h-2 rounded-full bg-rose-500"/>
        </div>
      </div>

      <div className="aspect-[4/3] w-full">
        <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky3d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="grass3d" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
            <linearGradient id="wallFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <linearGradient id="wallSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="roofFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="roofSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="foundation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#4b5563" />
            </linearGradient>
            <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="0" dy="6" result="off"/>
              <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* SKY */}
          <rect width="600" height="450" fill="url(#sky3d)" />

          {/* SUN */}
          <circle cx="510" cy="70" r="32" fill="#fde047" opacity="0.85" />
          <circle cx="510" cy="70" r="44" fill="#fde047" opacity="0.25" />

          {/* GROUND ISOMETRIC */}
          <polygon points="60,360 540,300 540,420 60,400" fill="url(#grass3d)" />
          <polygon points="60,360 540,300 540,310 60,370" fill="#22c55e" opacity="0.4" />

          {/* TERRENO marker */}
          <AnimatePresence>
            {show(0) && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <polygon points="180,340 420,310 420,330 180,360" fill="#a16207" opacity="0.45" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* FUNDAÇÃO (base isométrica) */}
          <AnimatePresence>
            {show(1) && (
              <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} filter="url(#shadow3d)">
                {/* topo */}
                <polygon points="180,300 420,272 420,295 180,323" fill="url(#foundation)" />
                {/* frente */}
                <polygon points="180,323 420,295 420,320 180,348" fill="#374151" />
                {/* lado */}
                <polygon points="420,295 420,320 420,272" fill="#1f2937" opacity="0" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ESTRUTURA - pilares */}
          <AnimatePresence>
            {show(2) && (
              <motion.g initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} style={{ transformOrigin: "300px 300px" }} transition={{ duration: 0.5 }}>
                {[195, 290, 385].map((x, i) => (
                  <polygon key={i} points={`${x},${300 - i * 0} ${x + 8},${298} ${x + 8},${180} ${x},${182}`} fill="#6b7280" />
                ))}
                {/* viga superior */}
                <polygon points="190,185 410,158 410,170 190,197" fill="#9ca3af" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ALVENARIA — paredes isométricas */}
          <AnimatePresence>
            {show(3) && (
              <motion.g initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} style={{ transformOrigin: "300px 300px" }} transition={{ duration: 0.7 }} filter="url(#shadow3d)">
                {/* parede frontal */}
                <polygon points="180,300 420,272 420,170 180,198" fill="url(#wallFront)" stroke="#92400e" strokeWidth="1.5" />
                {/* parede lateral direita */}
                <polygon points="420,272 480,260 480,158 420,170" fill="url(#wallSide)" stroke="#78350f" strokeWidth="1.5" />
                {/* parede topo (visível em isométrico) */}
                <polygon points="180,198 420,170 480,158 240,186" fill="#fed7aa" opacity="0.6" stroke="#92400e" strokeWidth="1" />

                {/* linhas de tijolos frente */}
                {[220, 240, 260, 280].map(y => (
                  <line key={y} x1="180" y1={y - (y - 198) * 0.12} x2="420" y2={y - 28 - (y - 198) * 0.12} stroke="#fdba74" strokeWidth="0.8" opacity="0.6" />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* JANELAS */}
          <AnimatePresence>
            {show(3) && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {/* janela esquerda */}
                <polygon points="210,250 270,243 270,210 210,217" fill={show(5) ? "#fef3c7" : "#bae6fd"} stroke="#0c4a6e" strokeWidth="1.5" />
                <line x1="240" y1="246" x2="240" y2="213" stroke="#0c4a6e" strokeWidth="1" />
                <line x1="210" y1="233" x2="270" y2="226" stroke="#0c4a6e" strokeWidth="1" />
                {/* janela direita */}
                <polygon points="340,235 400,228 400,196 340,203" fill={show(5) ? "#fef3c7" : "#bae6fd"} stroke="#0c4a6e" strokeWidth="1.5" />
                <line x1="370" y1="231" x2="370" y2="200" stroke="#0c4a6e" strokeWidth="1" />
                {/* janela lateral */}
                <polygon points="435,230 470,224 470,195 435,200" fill={show(5) ? "#fef3c7" : "#bae6fd"} stroke="#0c4a6e" strokeWidth="1.5" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* PORTA */}
          <AnimatePresence>
            {show(3) && (
              <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "300px 300px" }} transition={{ delay: 0.4 }}>
                <polygon points="285,300 325,295 325,250 285,255" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                <circle cx="318" cy="277" r="1.8" fill="#fbbf24" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* COBERTURA — telhado isométrico */}
          <AnimatePresence>
            {show(4) && (
              <motion.g initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} filter="url(#shadow3d)">
                {/* frente do telhado */}
                <polygon points="170,200 300,90 430,160 180,198" fill="url(#roofFront)" stroke="#450a0a" strokeWidth="1.5" />
                {/* lado do telhado */}
                <polygon points="430,160 490,150 360,80 300,90" fill="url(#roofSide)" stroke="#450a0a" strokeWidth="1.5" />
                {/* topo lateral */}
                <polygon points="430,160 490,150 480,158 420,170" fill="#7f1d1d" />
                {/* linhas de telhas */}
                {[0.25, 0.5, 0.75].map((t, i) => (
                  <line key={i} x1={170 + (300 - 170) * t} y1={200 - (200 - 90) * t} x2={430 - (430 - 300) * t} y2={160 - (160 - 90) * t} stroke="#fecaca" strokeWidth="0.7" opacity="0.4" />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* INSTALAÇÕES — antena + caixa d'água */}
          <AnimatePresence>
            {show(5) && (
              <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                {/* caixa d'água */}
                <ellipse cx="370" cy="78" rx="22" ry="6" fill="#1e40af" />
                <rect x="348" y="60" width="44" height="20" rx="3" fill="#3b82f6" />
                <ellipse cx="370" cy="60" rx="22" ry="6" fill="#60a5fa" />
                {/* antena */}
                <line x1="250" y1="110" x2="250" y2="60" stroke="#374151" strokeWidth="2" />
                <line x1="250" y1="65" x2="240" y2="55" stroke="#374151" strokeWidth="1.5" />
                <line x1="250" y1="65" x2="260" y2="55" stroke="#374151" strokeWidth="1.5" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ACABAMENTO — jardim, árvores, caminho */}
          <AnimatePresence>
            {show(6) && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
                {/* caminho até a porta */}
                <polygon points="290,380 320,378 326,300 286,302" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="1" />
                {/* árvore esquerda */}
                <ellipse cx="120" cy="360" rx="34" ry="38" fill="#16a34a" />
                <ellipse cx="120" cy="345" rx="26" ry="28" fill="#22c55e" />
                <rect x="115" y="380" width="10" height="20" fill="#78350f" />
                {/* árvore direita */}
                <ellipse cx="495" cy="320" rx="30" ry="32" fill="#16a34a" />
                <ellipse cx="495" cy="310" rx="22" ry="24" fill="#22c55e" />
                <rect x="490" y="340" width="10" height="18" fill="#78350f" />
                {/* arbustos */}
                <ellipse cx="190" cy="378" rx="14" ry="8" fill="#15803d" />
                <ellipse cx="430" cy="345" rx="14" ry="8" fill="#15803d" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ENTREGUE — bandeira / placa */}
          <AnimatePresence>
            {show(7) && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                <line x1="300" y1="90" x2="300" y2="40" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                <polygon points="300,40 340,52 300,64" fill="hsl(var(--primary))" />
                <text x="310" y="32" fontSize="11" fontWeight="bold" fill="hsl(var(--primary))">ENTREGUE</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Outline cobertura quando ainda não construída */}
          {!show(4) && show(3) && (
            <polyline points="170,200 300,90 430,160 490,150 360,80 300,90" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
          )}
        </svg>
      </div>

      {/* legenda */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {STAGES.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-1.5 ${i <= idx ? "text-foreground" : "text-muted-foreground/50"}`}>
            <span className={`w-2 h-2 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
            <span className="capitalize">{s.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}