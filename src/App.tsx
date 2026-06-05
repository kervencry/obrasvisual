import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ObraDashboard from "./pages/obra/Dashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import EntrarComToken from "./pages/EntrarComToken";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import AppShell from "./components/app/AppShell";
import Obras from "./pages/app/Obras";
import NovaObra from "./pages/app/NovaObra";
import ObraDetalhe from "./pages/app/ObraDetalhe";
import Perfil from "./pages/app/Perfil";
import Notificacoes from "./pages/app/Notificacoes";
import Portfolio from "./pages/app/Portfolio";
import Planos from "./pages/app/Planos";
import DashboardEngenheiro from "./pages/app/DashboardEngenheiro";
import DashboardCliente from "./pages/app/DashboardCliente";
import DashboardArquiteto from "./pages/app/DashboardArquiteto";
import DashboardMestre from "./pages/app/DashboardMestre";
import DashboardAdmin from "./pages/app/DashboardAdmin";
import AdminUsuarios from "./pages/app/AdminUsuarios";
import AdminObras from "./pages/app/AdminObras";
import PortfolioPublico from "./pages/PortfolioPublico";
import ObraPublica from "./pages/ObraPublica";
import RoleRoute, { RoleRedirect } from "./components/auth/RoleRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/entrar" element={<EntrarComToken />} />
              <Route path="/demo" element={<ObraDashboard />} />
              <Route path="/obra/:id" element={<ObraDashboard />} />
              <Route path="/obra-publica/:id" element={<ObraPublica />} />
              <Route path="/portfolio/:userId" element={<PortfolioPublico />} />
              <Route path="/app" element={<AppShell><Obras /></AppShell>} />
              <Route path="/app/home" element={<RoleRedirect />} />
              <Route path="/app/dashboard" element={<RoleRedirect />} />
              <Route path="/app/cliente" element={<RoleRoute allow={["cliente","admin"]}><AppShell><DashboardCliente /></AppShell></RoleRoute>} />
              <Route path="/app/engenheiro" element={<RoleRoute allow={["engenheiro","admin"]}><AppShell><DashboardEngenheiro /></AppShell></RoleRoute>} />
              <Route path="/app/arquiteto" element={<RoleRoute allow={["arquiteto","admin"]}><AppShell><DashboardArquiteto /></AppShell></RoleRoute>} />
              <Route path="/app/mestre" element={<RoleRoute allow={["mestre_obras","admin"]}><AppShell><DashboardMestre /></AppShell></RoleRoute>} />
              <Route path="/app/admin" element={<RoleRoute allow={["admin"]}><AppShell><DashboardAdmin /></AppShell></RoleRoute>} />
              <Route path="/app/admin/usuarios" element={<RoleRoute allow={["admin"]}><AppShell><AdminUsuarios /></AppShell></RoleRoute>} />
              <Route path="/app/admin/obras" element={<RoleRoute allow={["admin"]}><AppShell><AdminObras /></AppShell></RoleRoute>} />
              <Route path="/app/obras/nova" element={<RoleRoute allow={["engenheiro","mestre_obras","admin"]}><AppShell><NovaObra /></AppShell></RoleRoute>} />
              <Route path="/app/obras/:id" element={<AppShell><ObraDetalhe /></AppShell>} />
              <Route path="/app/perfil" element={<AppShell><Perfil /></AppShell>} />
              <Route path="/app/notificacoes" element={<AppShell><Notificacoes /></AppShell>} />
              <Route path="/app/portfolio" element={<RoleRoute allow={["engenheiro","arquiteto","admin"]}><AppShell><Portfolio /></AppShell></RoleRoute>} />
              <Route path="/app/planos" element={<AppShell><Planos /></AppShell>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
