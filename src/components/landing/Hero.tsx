import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import AnimatedHouse, { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import StageSelector from "@/components/obra/StageSelector";

const STAGE_INFO: Record<ObraStage, { etapa: string; status: string; prazo: string }> = {
  terreno:     { etapa: "Terreno preparado", status: "Concluído ✓",      prazo: "Ago 2025" },
  fundacao:    { etapa: "Fundação",          status: "Concluído ✓",      prazo: "Set 2025" },
  estrutura:   { etapa: "Estrutura",         status: "Concluído ✓",      prazo: "Out 2025" },
  alvenaria:   { etapa: "Alvenaria",         status: "Em andamento ⚡",   prazo: "Nov 2025" },
  cobertura:   { etapa: "Cobertura",         status: "Em andamento ⚡",   prazo: "Dez 2025" },
  instalacoes: { etapa: "Instalações",       status: "Em andamento ⚡",   prazo: "Jan 2026" },
  acabamento:  { etapa: "Acabamento",        status: "Em andamento ⚡",   prazo: "Fev 2026" },
  entregue:    { etapa: "Obra entregue!",    status: "Finalizado 🎉",     prazo: "Mar 2026" },
};

export default function Hero() {
  const [stage, setStage] = useState<ObraStage>("alvenaria");
  const info = STAGE_INFO[stage];
  const stageData = STAGES.find((s) => s.id === stage)!;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6"
          >
            🏗️ Plataforma #1 de acompanhamento de obras
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Acompanhe sua obra{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              em tempo real
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Visualize o progresso, controle etapas e mantenha todos os envolvidos
            alinhados. Transparência total do fundamento à entrega.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth">
              <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                <Play className="mr-2 h-4 w-4" />
                Ver Demonstração
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "2.500+", label: "Obras monitoradas" },
              { value: "98%",    label: "Satisfação" },
              { value: "40%",    label: "Menos visitas" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* INTERACTIVE DEMO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <span className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <span className="text-xs text-muted-foreground mx-auto">
                obravisual.com/obra/casa-santos-2025
              </span>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-muted/60 rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Progresso</p>
                  <p className="text-2xl font-extrabold text-primary">{stageData.percent}%</p>
                  <div className="mt-1.5 h-1.5 bg-background rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${stageData.percent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="bg-muted/60 rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Etapa Atual</p>
                  <p className="text-sm font-bold text-foreground leading-tight">{info.etapa}</p>
                  <p className="text-xs text-accent font-medium mt-0.5">{info.status}</p>
                </div>
                <div className="bg-muted/60 rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Prazo</p>
                  <p className="text-sm font-bold text-foreground">{info.prazo}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">No prazo ✓</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-muted/40 rounded-xl p-4">
                  <AnimatedHouse stage={stage} />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Etapas da obra</p>
                    <p className="text-xs text-muted-foreground">
                      Clique em uma etapa para ver a casa sendo construída em tempo real
                    </p>
                  </div>
                  <div className="space-y-2">
                    {STAGES.map((s, i) => {
                      const currentIdx = STAGES.findIndex((x) => x.id === stage);
                      const done   = i < currentIdx;
                      const active = i === currentIdx;
                      return (
                        <motion.button
                          key={s.id}
                          onClick={() => setStage(s.id)}
                          whileHover={{ x: 4 }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left ${
                            active
                              ? "bg-primary/10 border border-primary/30 text-primary font-semibold"
                              : done
                              ? "bg-green-500/5 border border-green-500/20 text-muted-foreground"
                              : "border border-transparent text-muted-foreground hover:bg-muted/60"
                          }`}
                        >
                          <span className="text-base">{done ? "✅" : active ? "🔨" : "⬜"}</span>
                          <span className="flex-1">{s.label}</span>
                          <span className="text-xs opacity-60">{s.percent}%</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border">
                <StageSelector current={stage} onChange={setStage} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
