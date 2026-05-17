import { ReactNode } from "react";
import { NavLink, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { HardHat, LayoutDashboard, Plus, User, Bell, LogOut, Image } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const links = [
    { to: "/app", icon: LayoutDashboard, label: "Minhas obras", end: true },
    { to: "/app/obras/nova", icon: Plus, label: "Nova obra" },
    { to: "/app/portfolio", icon: Image, label: "Portfólio" },
    { to: "/app/notificacoes", icon: Bell, label: "Notificações" },
    { to: "/app/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-lg">ObraVisual</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({isActive}) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" className="w-full justify-start" onClick={async()=>{await signOut(); nav("/");}}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="md:hidden border-b border-border bg-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><HardHat className="h-5 w-5 text-primary"/><span className="font-bold">ObraVisual</span></div>
          <Button size="sm" variant="ghost" onClick={async()=>{await signOut(); nav("/");}}><LogOut className="h-4 w-4"/></Button>
        </div>
        {children}
      </main>
    </div>
  );
}