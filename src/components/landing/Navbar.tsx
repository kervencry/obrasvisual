import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Building2 } from "lucide-react";
import { ThemeToggle } from "@/hooks/useTheme";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Como funciona", href: "#how" },
    { label: "Funcionalidades", href: "#features" },
    { label: "Planos", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="flex items-center gap-2 font-bold text-xl">
          <Building2 className="h-7 w-7 text-primary" />
          <span className="text-foreground">Obra<span className="text-primary">Visual</span></span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/auth"><Button variant="ghost" size="sm">Entrar</Button></Link>
          <Link to="/auth"><Button size="sm">Começar grátis</Button></Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/auth"><Button variant="ghost" size="sm" className="w-full">Entrar</Button></Link>
            <Link to="/auth"><Button size="sm" className="w-full">Começar grátis</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
