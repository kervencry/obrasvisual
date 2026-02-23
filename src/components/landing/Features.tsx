import { motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Shield,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Etapas Visuais",
    description: "Acompanhe 7 etapas padrão com ilustração SVG que se constrói conforme o progresso da obra.",
  },
  {
    icon: Camera,
    title: "Fotos e Registros",
    description: "Upload de fotos por etapa com comentários técnicos, data e responsável. Histórico imutável.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Progresso geral, prazos, alertas de atraso e resumo financeiro em um único painel.",
  },
  {
    icon: Users,
    title: "Multiusuário",
    description: "Engenheiros, arquitetos, mestres de obras e clientes acessam a mesma plataforma com permissões específicas.",
  },
  {
    icon: CheckCircle2,
    title: "Aprovação Digital",
    description: "Clientes aprovam etapas concluídas com registro digital, eliminando burocracia.",
  },
  {
    icon: FileText,
    title: "Relatórios PDF",
    description: "Gere relatórios automáticos com fotos, progresso e comentários. Envie por e-mail.",
  },
  {
    icon: Clock,
    title: "Linha do Tempo",
    description: "Histórico completo da obra: quem alterou, quando e o quê. Rastreabilidade total.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Dados criptografados, controle de permissões por perfil e backup automático.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
          >
            Funcionalidades
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
          >
            Tudo que você precisa para{" "}
            <span className="text-primary">gerenciar obras</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Substituímos relatórios manuais e visitas constantes por uma plataforma
            visual, documentada e em tempo real.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
