import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Building2, MapPin, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedHouse from "@/components/obra/AnimatedHouse";

const STATUS_LABEL: Record<string, string> = {
  planejamento: "Planejamento", em_andamento: "Em andamento",
  pausada: "Pausada", concluida: "Concluída", cancelada: "Cancelada",
};
const STATUS_COLOR: Record<string, string> = {
  planejamento: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  em_andamento: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pausada: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  concluida: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelada: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Obras() {
  const nav = useNavigate();
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("recente");

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { nav("/auth"); return; }
      const userId = s.session.user.id;
      const { data } = await supabase.from("obras").select("*")
        .eq("owner_id", userId).order("created_at", { ascending: false });
      setObras(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtradas = obras
    .filter(o => {
      const q = busca.toLowerCase();
      const matchBusca = o.nome.toLowerCase().includes(q) || (o.endereco ?? "").toLowerCase().includes(q);
      const matchStatus = filtroStatus === "todos" || o.status === filtroStatus;
      const matchTipo = filtroTipo === "todos" || o.tipo === filtroTipo;
      return matchBusca && matchStatus && matchTipo;
    })
    .sort((a, b) => {
      if (ordenacao === "recente") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome);
      if (ordenacao === "progresso") return b.percentual - a.percentual;
      return 0;
    });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Minhas Obras</h1>
          <p className="text-muted-foreground text-sm mt-1">{obras.length} obra{obras.length !== 1 ? "s" : ""} cadastrada{obras.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => nav("/app/obras/nova")} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />Nova obra
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou endereço..." value={busca}
            onChange={e => setBusca(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="planejamento">Planejamento</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="pausada">Pausada</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="casa">Casa</SelectItem>
            <SelectItem value="predio">Prédio</SelectItem>
            <SelectItem value="reforma">Reforma</SelectItem>
            <SelectItem value="comercial">Comercial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ordenacao} onValueChange={setOrdenacao}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Ordenar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recente">Mais recente</SelectItem>
            <SelectItem value="nome">Nome A-Z</SelectItem>
            <SelectItem value="progresso">% Progresso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Onboarding vazio */}
      {obras.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Bem-vindo ao ObraVisual! 👋</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Cadastre sua primeira obra em 1 minuto e comece a acompanhar o progresso em tempo real.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-8">
            {["✅ Criar conta", "⬜ Cadastrar obra", "⬜ Convidar equipe", "⬜ Adicionar fotos"].map((item, i) => (
              <span key={i} className={i === 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>{item}</span>
            ))}
          </div>
          <Button size="lg" onClick={() => nav("/app/obras/nova")}>
            <Plus className="h-5 w-5 mr-2" />Cadastrar primeira obra
          </Button>
        </div>
      )}

      {/* Sem resultados na busca */}
      {obras.length > 0 && filtradas.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">Nenhuma obra encontrada</h3>
          <p className="text-muted-foreground text-sm">Tente ajustar os filtros ou a busca.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtradas.map((obra, i) => (
          <motion.div key={obra.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }} onClick={() => nav(`/app/obras/${obra.id}`)}
            className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-200 group">
            <div className="bg-muted/40 px-6 pt-4 pb-2">
              <AnimatedHouse stage={obra.etapa_atual ?? "terreno"} className="max-w-[160px] mx-auto" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{obra.nome}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[obra.status] ?? ""}`}>
                  {STATUS_LABEL[obra.status] ?? obra.status}
                </span>
              </div>
              {obra.endereco && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                  <MapPin className="h-3 w-3 shrink-0" />{obra.endereco}
                </p>
              )}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span className="font-semibold text-primary">{obra.percentual}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${obra.percentual}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 capitalize">
                  <TrendingUp className="h-3 w-3" />{obra.etapa_atual ?? "terreno"}
                </span>
                {obra.data_fim_prevista && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(obra.data_fim_prevista).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
