import { Building2 } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-muted/20">
    <div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
      <div>
        <div className="flex items-center gap-2 font-bold text-lg mb-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span>Obra<span className="text-primary">Visual</span></span>
        </div>
        <p className="text-muted-foreground">Acompanhamento de obras em tempo real para engenheiros, arquitetos e clientes.</p>
      </div>
      <div>
        <p className="font-semibold mb-2">Produto</p>
        <ul className="space-y-1 text-muted-foreground">
          <li><a href="#features" className="hover:text-foreground">Funcionalidades</a></li>
          <li><a href="#how" className="hover:text-foreground">Como funciona</a></li>
          <li><a href="#pricing" className="hover:text-foreground">Planos</a></li>
          <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
        </ul>
      </div>
      <div>
        <p className="font-semibold mb-2">Empresa</p>
        <ul className="space-y-1 text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">Sobre</a></li>
          <li><a href="#" className="hover:text-foreground">Contato</a></li>
        </ul>
      </div>
      <div>
        <p className="font-semibold mb-2">Legal</p>
        <ul className="space-y-1 text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">Termos</a></li>
          <li><a href="#" className="hover:text-foreground">Privacidade</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} ObraVisual. Todos os direitos reservados.
    </div>
  </footer>
);

export default Footer;
