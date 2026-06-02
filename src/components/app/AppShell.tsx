import { ReactNode } from "react";
import { NavLink, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { ThemeToggle } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { HardHat, LayoutDashboard, Plus, User, Bell, LogOut, Image, Building2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, role, signOut } = useAuth();
  const { naoLidas } = useNotificacoes();
  const nav = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const isPro = role === "engenheiro" || role === "arquiteto" || role === "mestre_obras";

  const firstLink = isPro
    ? { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true }
    : role === "cliente"
    ? { to: "/app/cliente", icon: LayoutDashboard, label: "Minhas obras", end: true }
    : { to: "/app", icon: LayoutDashboard, label: "Minhas obras", end: true };

  const links = [
    firstLink,
    { to: "/app", icon: Building2, label: "Obras" },
    { to: "/app/obras/nova", icon: Plus, label: "Nova obra" },
    { to: "/app/portfolio", icon: Image, label: "Portfólio" },
    { to: "/app/planos", icon: Crown, label: "Planos" },
    { to: "/app/notificacoes", icon: Bell, label: "Notificações", badge: naoLidas },
    { to: "/app/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="h-6 w-6 text-primary" />
            <span className="font-extrabold text-lg">ObraVisual</span>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((l: any) => (
            <NavLink key={l.to + l.label} to={l.to} end={l.end}
              className={({isActive}) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}>
              <l.icon className="h-4 w-4" />
              <span className="flex-1">{l.label}</span>
              {l.badge > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">{l.badge}</span>
              )}
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
          <div className="flex items-center gap-2">
            <NavLink to="/app/notificacoes" className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted">
              <Bell className="h-5 w-5"/>
              {naoLidas > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{naoLidas}</span>}
            </NavLink>
            <ThemeToggle />
            <Button size="sm" variant="ghost" onClick={async()=>{await signOut(); nav("/");}}><LogOut className="h-4 w-4"/></Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
