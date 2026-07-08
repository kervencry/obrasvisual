import { ReactNode, useState } from "react";
import { NavLink, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { ThemeToggle } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  HardHat, LayoutDashboard, Plus, User, Bell, LogOut, Image, Building2,
  Crown, MessageSquare, FileText, ClipboardList, Users, Shield, Layers,
  Camera, GalleryHorizontal, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, type Role } from "@/lib/rbac";

type LinkItem = {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
  badge?: number;
};

function buildLinks(role: Role | null, naoLidas: number): LinkItem[] {
  const notif: LinkItem = { to: "/app/notificacoes", icon: Bell, label: "Notificações", badge: naoLidas };
  const perfil: LinkItem = { to: "/app/perfil", icon: User, label: "Perfil" };

  if (role === "admin") {
    return [
      { to: "/app/admin", icon: Shield, label: "Dashboard", end: true },
      { to: "/app/admin/usuarios", icon: Users, label: "Usuários" },
      { to: "/app/admin/obras", icon: Building2, label: "Obras" },
      { to: "/app/planos", icon: Crown, label: "Planos" },
      notif, perfil,
    ];
  }
  if (role === "engenheiro") {
    return [
      { to: "/app/engenheiro", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/app", icon: Building2, label: "Obras", end: true },
      { to: "/app/obras/nova", icon: Plus, label: "Nova obra" },
      { to: "/app/portfolio", icon: Image, label: "Portfólio" },
      { to: "/app/planos", icon: Crown, label: "Planos" },
      notif, perfil,
    ];
  }
  if (role === "arquiteto") {
    return [
      { to: "/app/arquiteto", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/app", icon: Layers, label: "Projetos", end: true },
      { to: "/app/portfolio", icon: GalleryHorizontal, label: "Portfólio" },
      notif, perfil,
    ];
  }
  if (role === "mestre_obras") {
    return [
      { to: "/app/mestre", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/app", icon: HardHat, label: "Obras", end: true },
      { to: "/app/obras/nova", icon: Plus, label: "Nova obra" },
      notif, perfil,
    ];
  }
  // cliente (default)
  return [
    { to: "/app/cliente", icon: LayoutDashboard, label: "Minha obra", end: true },
    { to: "/app/notificacoes", icon: MessageSquare, label: "Mensagens", badge: naoLidas },
    perfil,
  ];
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, role, signOut } = useAuth();
  const { naoLidas } = useNotificacoes();
  const nav = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const links = buildLinks(role as Role | null, naoLidas);
  const roleLabel = role ? ROLE_LABEL[role as Role] : "";

  const NavList = ({ onClick }: { onClick?: () => void }) => (
    <>
      {links.map((l: any) => (
        <NavLink key={l.to + l.label} to={l.to} end={l.end} onClick={onClick}
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
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-foreground bg-primary" />
              <span className="font-extrabold text-lg uppercase tracking-tight">ObraVisual</span>
            </div>
            <ThemeToggle />
          </div>
          {roleLabel && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {roleLabel}
            </span>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <NavList />
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" className="w-full justify-start" onClick={async()=>{await signOut(); nav("/");}}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="md:hidden border-b border-border bg-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={openMenu} onOpenChange={setOpenMenu}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="h-9 w-9"><Menu className="h-5 w-5"/></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-foreground bg-primary" />
                    <span className="font-extrabold text-lg uppercase tracking-tight">ObraVisual</span>
                  </div>
                  {roleLabel && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{roleLabel}</span>
                  )}
                </div>
                <nav className="flex-1 p-2 space-y-1 overflow-auto">
                  <NavList onClick={() => setOpenMenu(false)} />
                </nav>
                <div className="p-2 border-t border-border">
                  <Button variant="ghost" className="w-full justify-start" onClick={async()=>{await signOut(); nav("/");}}>
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <span className="inline-block w-4 h-4 border-2 border-foreground bg-primary" />
            <span className="font-bold uppercase tracking-tight">ObraVisual</span>
          </div>
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
