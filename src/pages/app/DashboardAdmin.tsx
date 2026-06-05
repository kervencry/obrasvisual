import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Users, Building2, Crown, Activity } from "lucide-react";
import { ROLE_LABEL } from "@/lib/rbac";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({ obras: 0, usuarios: 0, ativas: 0 });
  const [roles, setRoles] = useState<Record<string, number>>({});
  const [planos, setPlanos] = useState<Record<string, number>>({});
  const [ultimos, setUltimos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: totalObras }, { count: ativas }, { count: totalUsers }] = await Promise.all([
        supabase.from("obras").select("*", { count: "exact", head: true }),
        supabase.from("obras").select("*", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats({ obras: totalObras ?? 0, usuarios: totalUsers ?? 0, ativas: ativas ?? 0 });

      const { data: ur } = await supabase.from("user_roles").select("role");
      const agg: Record<string, number> = {};
      (ur ?? []).forEach((r: any) => { agg[r.role] = (agg[r.role] ?? 0) + 1; });
      setRoles(agg);

      const { data: pr } = await supabase.from("profiles").select("plano");
      const pa: Record<string, number> = {};
      (pr ?? []).forEach((p: any) => { const k = p.plano ?? "gratuito"; pa[k] = (pa[k] ?? 0) + 1; });
      setPlanos(pa);

      const { data: u } = await supabase.from("profiles").select("id,nome,created_at,plano").order("created_at", { ascending: false }).limit(8);
      setUltimos(u ?? []);
    })();
  }, []);

  const kpis = [
    { label: "Usuários", value: stats.usuarios, icon: Users },
    { label: "Obras", value: stats.obras, icon: Building2 },
    { label: "Obras ativas", value: stats.ativas, icon: Activity },
    { label: "Profissional+", value: (planos["profissional"] ?? 0) + (planos["construtora"] ?? 0), icon: Crown },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Painel administrativo</h1>
          <p className="text-muted-foreground">Visão global da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/admin/usuarios"><Badge variant="outline" className="cursor-pointer">Usuários</Badge></Link>
          <Link to="/app/admin/obras"><Badge variant="outline" className="cursor-pointer">Obras</Badge></Link>
        </div>
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

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Usuários por perfil</h3>
          <div className="space-y-2">
            {Object.entries(ROLE_LABEL).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <Badge variant="secondary">{roles[k] ?? 0}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Distribuição de planos</h3>
          <div className="space-y-2">
            {["gratuito", "profissional", "construtora"].map((p) => (
              <div key={p} className="flex items-center justify-between text-sm capitalize">
                <span>{p}</span>
                <Badge variant="secondary">{planos[p] ?? 0}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Últimos cadastros</h3>
        {ultimos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem cadastros recentes.</p>
        ) : (
          <div className="space-y-1">
            {ultimos.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <span className="truncate">{u.nome ?? u.id.slice(0, 8)}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">{u.plano ?? "gratuito"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}