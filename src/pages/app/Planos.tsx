import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PLANOS, type Plano, getPlanoDoUsuario, contarObrasDoUsuario } from "@/lib/planos";

const ICONS: Record<Plano, any> = {
  gratuito: Zap,
  profissional: Crown,
  construtora: Building2,
};

const FEATURE_LABELS: Record<string, string> = {
  chat: "Chat com a equipe",
  diario: "Diário da obra",
  portalCliente: "Portal do cliente",
  relatorioPDF: "Relatórios em PDF",
  financeiro: "Controle financeiro",
  aprovacaoDigital: "Aprovação digital de etapas",
  vista3d: "Vista 3D isométrica",
  portfolioPublico: "Portfólio público",
  suportePrioritario: "Suporte prioritário",
};

export default function Planos() {
  const { user } = useAuth();
  const [atual, setAtual] = useState<Plano>("gratuito");
  const [obras, setObras] = useState(0);
  const [loading, setLoading] = useState<Plano | null>(null);

  async function load() {
    if (!user) return;
    const [p, c] = await Promise.all([getPlanoDoUsuario(user.id), contarObrasDoUsuario(user.id)]);
    setAtual(p); setObras(c);
  }
  useEffect(() => { load(); }, [user]);

  async function escolher(p: Plano) {
    if (!user || p === atual) return;
    setLoading(p);
    const { error } = await supabase.from("profiles").update({ plano: p } as any).eq("id", user.id);
    setLoading(null);
    if (error) return toast.error(error.message);
    toast.success(`Plano alterado para ${PLANOS[p].nome}!`);
    setAtual(p);
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1">Planos</h1>
        <p className="text-muted-foreground">
          Você está no plano <strong className="text-foreground capitalize">{PLANOS[atual].nome}</strong>
          {PLANOS[atual].maxObras !== null && (
            <> — usando {obras} de {PLANOS[atual].maxObras} obras</>
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {(Object.keys(PLANOS) as Plano[]).map(id => {
          const p = PLANOS[id];
          const Icon = ICONS[id];
          const isAtual = id === atual;
          return (
            <Card key={id} className={`p-6 flex flex-col relative ${p.destaque ? "border-primary border-2 shadow-lg shadow-primary/10" : ""} ${isAtual ? "ring-2 ring-primary" : ""}`}>
              {p.destaque && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Mais popular</Badge>
              )}
              <Icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-xl font-bold">{p.nome}</h3>
              <div className="my-3">
                <span className="text-4xl font-extrabold">{p.preco}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm mb-6 flex-1">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {p.maxObras === null ? "Obras ilimitadas" : `${p.maxObras} obra${p.maxObras > 1 ? "s" : ""}`}
                </li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {p.maxMembros === null ? "Membros ilimitados" : `${p.maxMembros} membros por obra`}
                </li>
                {Object.entries(p.features).map(([k, v]) => (
                  <li key={k} className={`flex gap-2 ${v ? "" : "text-muted-foreground/60 line-through"}`}>
                    {v ? <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <X className="h-4 w-4 mt-0.5 shrink-0" />}
                    {FEATURE_LABELS[k] ?? k}
                  </li>
                ))}
              </ul>
              <Button
                disabled={isAtual || loading !== null}
                variant={p.destaque ? "default" : "outline"}
                onClick={() => escolher(id)}
              >
                {isAtual ? "Plano atual" : loading === id ? "Alterando..." : `Mudar para ${p.nome}`}
              </Button>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Pagamentos serão habilitados em breve. Por enquanto você pode testar todos os planos livremente.
      </p>
    </div>
  );
}