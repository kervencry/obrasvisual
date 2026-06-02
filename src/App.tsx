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
import PortfolioPublico from "./pages/PortfolioPublico";
import ObraPublica from "./pages/ObraPublica";

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
              <Route path="/app/dashboard" element={<AppShell><DashboardEngenheiro /></AppShell>} />
              <Route path="/app/cliente" element={<AppShell><DashboardCliente /></AppShell>} />
              <Route path="/app/obras/nova" element={<AppShell><NovaObra /></AppShell>} />
              <Route path="/app/obras/:id" element={<AppShell><ObraDetalhe /></AppShell>} />
              <Route path="/app/perfil" element={<AppShell><Perfil /></AppShell>} />
              <Route path="/app/notificacoes" element={<AppShell><Notificacoes /></AppShell>} />
              <Route path="/app/portfolio" element={<AppShell><Portfolio /></AppShell>} />
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
