import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardHat, Camera, ClipboardList, Wrench } from "lucide-react";

export default function DashboardMestre() {
  const { user } = useAuth();
  const [obras, setObras] = useState<any[]>([]);
  const [diarios, setDiarios] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mem } = await supabase
        .from("obra_members")
        .select("obra_id")
        .eq("user_id", user.id);
      const ids = (mem ?? []).map((m: any) => m.obra_id);
      if (ids.length) {
        const [{ data: o }, { data: d }] = await Promise.all([
          supabase.from("obras").select("*").in("id", ids),
          supabase.from("diario_obra").select("*").in("obra_id", ids).order("data", { ascending: false }).limit(10),
        ]);
        setObras(o ?? []);
        setDiarios(d ?? []);
      }
    })();
  }, [user]);

  const ativas = obras.filter((o) => o.status === "em_andamento");

  const kpis = [
    { label: "Obras ativas", value: ativas.length, icon: HardHat },
    { label: "Diários (10 últimos)", value: diarios.length, icon: ClipboardList },
    { label: "Total de obras", value: obras.length, icon: Wrench },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Painel do Mestre</h1>
        <p className="text-muted-foreground">Registre o dia a dia da obra</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
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
        <h3 className="font-semibold mb-3">Obras em andamento</h3>
        {ativas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem obras ativas no momento.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {ativas.map((o) => (
              <div key={o.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{o.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.endereco}</p>
                  </div>
                  <Badge variant="outline">{o.etapa_atual}</Badge>
                </div>
                <Progress value={o.percentual} className="h-2 mb-3" />
                <div className="flex gap-2">
                  <Link to={`/app/obras/${o.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Camera className="h-4 w-4 mr-2" /> Abrir obra
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <ClipboardList className="h-4 w-4" /> Últimos registros do diário
        </h3>
        {diarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem registros ainda.</p>
        ) : (
          <div className="space-y-1">
            {diarios.map((d) => (
              <Link key={d.id} to={`/app/obras/${d.obra_id}`} className="block">
                <div className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                  <span className="truncate flex-1">{d.observacoes ?? d.atividades ?? "Registro"}</span>
                  <span className="text-xs text-muted-foreground ml-3">
                    {new Date(d.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}