import { motion } from "framer-motion";
import { Building2, Users, Camera, Eye } from "lucide-react";

const steps = [
  { n: 1, icon: Building2, title: "Cadastre sua obra", desc: "Crie sua obra com nome, endereço e tipo em menos de 1 minuto." },
  { n: 2, icon: Users, title: "Convide a equipe", desc: "Adicione engenheiro, arquiteto, mestre e cliente com um e-mail." },
  { n: 3, icon: Camera, title: "Atualize etapas e fotos", desc: "Cada etapa concluída é registrada com fotos e descrição." },
  { n: 4, icon: Eye, title: "Cliente acompanha tudo", desc: "Acesso por link exclusivo. Sem login. Em tempo real." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold">Como funciona</h2>
          <p className="text-muted-foreground mt-3">Do cadastro à entrega: tudo em uma única plataforma.</p>
        </div>
        <div className="relative grid md:grid-cols-4 gap-6">
          <div className="hidden md:block absolute top-9 left-[12%] right-[12%] h-0.5 bg-border" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 h-[72px] w-[72px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <s.icon className="h-7 w-7" />
              </div>
              <span className="mt-3 inline-flex items-center justify-center h-6 w-6 rounded-full bg-background border border-border text-xs font-bold">{s.n}</span>
              <h3 className="font-bold mt-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[220px]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
