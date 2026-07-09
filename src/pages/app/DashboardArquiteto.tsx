import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Clock, Layers } from "lucide-react";
import VincularObraToken from "@/components/obra/VincularObraToken";

export default function DashboardArquiteto() {
  const { user } = useAuth();
  const [obras, setObras] = useState<any[]>([]);
  const [aprovacoes, setAprovacoes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mem } = await supabase
        .from("obra_members")
        .select("obra_id")
        .eq("user_id", user.id);
      const ids = (mem ?? []).map((m: any) => m.obra_id);
      if (ids.length) {
        const [{ data: o }, { data: a }] = await Promise.all([
          supabase.from("obras").select("*").in("id", ids),
          supabase.from("aprovacoes").select("*").in("obra_id", ids).order("created_at", { ascending: false }),
        ]);
        setObras(o ?? []);
        setAprovacoes(a ?? []);
      }
    })();
  }, [user]);

  const pendentes = aprovacoes.filter((a) => a.status === "pendente");
  const aprovadas = aprovacoes.filter((a) => a.status === "aprovada");

  const kpis = [
    { label: "Projetos", value: obras.length, icon: Layers },
    { label: "Revisões pendentes", value: pendentes.length, icon: Clock },
    { label: "Aprovadas", value: aprovadas.length, icon: CheckCircle2 },
    { label: "Documentos", value: aprovacoes.length, icon: FileText },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Estúdio do Arquiteto</h1>
        <p className="text-muted-foreground">Acompanhe seus projetos e revisões</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((m) => (
          <Card key={m.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <m.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-extrabold">{m.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Entrar em uma obra por token</h3>
        <p className="text-xs text-muted-foreground mb-3">Cole o token compartilhado pelo engenheiro para vincular seu perfil de arquiteto ao projeto.</p>
        <VincularObraToken compact onVinculada={() => window.location.reload()} />
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Meus projetos</h3>
          {obras.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não está vinculado a projetos.</p>
          ) : (
            <div className="space-y-2">
              {obras.map((o) => (
                <Link key={o.id} to={`/app/obras/${o.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{o.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.endereco}</p>
                    </div>
                    <Badge variant="outline">{o.etapa_atual}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Revisões pendentes
          </h3>
          {pendentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma revisão aguardando.</p>
          ) : (
            <div className="space-y-2">
              {pendentes.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.titulo ?? "Aprovação"}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.descricao}</p>
                  </div>
                  <Link to={`/app/obras/${a.obra_id}`}>
                    <Button size="sm" variant="outline">Abrir</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}