import { Building2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              <Building2 className="h-6 w-6" />
              <span>ObraViva</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              Plataforma inteligente de acompanhamento de obras para a construção civil.
            </p>
          </div>

          {[
            {
              title: "Produto",
              links: ["Funcionalidades", "Planos", "Integrações", "Segurança"],
            },
            {
              title: "Empresa",
              links: ["Sobre", "Blog", "Carreiras", "Contato"],
            },
            {
              title: "Suporte",
              links: ["Central de Ajuda", "Documentação", "Status", "Termos de Uso"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/40">
          © {new Date().getFullYear()} ObraViva. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
