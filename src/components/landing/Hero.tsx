import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
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
            <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-12">
              <Play className="mr-2 h-4 w-4" />
              Ver Demonstração
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "2.500+", label: "Obras monitoradas" },
              { value: "98%", label: "Satisfação" },
              { value: "40%", label: "Menos visitas" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero visual - construction progress mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-primary/5 p-2">
            <div className="bg-muted rounded-xl p-8 md:p-12">
              {/* Mock dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Progresso Geral</p>
                  <p className="text-3xl font-bold text-primary">67%</p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "67%" }} />
                  </div>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Etapa Atual</p>
                  <p className="text-lg font-bold text-foreground">Alvenaria</p>
                  <p className="text-sm text-accent font-medium">Em andamento</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Prazo</p>
                  <p className="text-lg font-bold text-foreground">15 Mar 2026</p>
                  <p className="text-sm text-primary font-medium">No prazo ✓</p>
                </div>
              </div>

              {/* SVG Building illustration */}
              <div className="mt-8 flex justify-center">
                <svg viewBox="0 0 400 200" className="w-full max-w-md" fill="none">
                  {/* Ground */}
                  <rect x="50" y="180" width="300" height="20" rx="4" className="fill-muted-foreground/20" />
                  {/* Foundation */}
                  <rect x="80" y="160" width="240" height="20" rx="2" className="fill-primary" />
                  {/* Structure */}
                  <rect x="90" y="100" width="10" height="60" className="fill-primary/80" />
                  <rect x="300" y="100" width="10" height="60" className="fill-primary/80" />
                  <rect x="90" y="95" width="220" height="10" rx="2" className="fill-primary/80" />
                  {/* Walls - partially done */}
                  <rect x="100" y="105" width="200" height="55" rx="2" className="fill-primary/40" />
                  {/* Windows */}
                  <rect x="120" y="115" width="30" height="25" rx="2" className="fill-background" />
                  <rect x="185" y="115" width="30" height="25" rx="2" className="fill-background" />
                  <rect x="250" y="115" width="30" height="25" rx="2" className="fill-background" />
                  {/* Door */}
                  <rect x="175" y="130" width="25" height="30" rx="2" className="fill-background" />
                  {/* Roof outline (not built yet) */}
                  <path d="M70 95 L200 30 L330 95" className="stroke-muted-foreground/30" strokeWidth="3" strokeDasharray="8 4" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
