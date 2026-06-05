import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export default function AdminObras() {
  const [obras, setObras] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("obras").select("*").order("created_at", { ascending: false });
      setObras(data ?? []);
    })();
  }, []);

  const filt = obras.filter((o) => o.nome.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold">Todas as obras</h1>
        <p className="text-muted-foreground">{obras.length} obras na plataforma</p>
      </div>
      <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <div className="grid md:grid-cols-2 gap-3">
        {filt.map((o) => (
          <Link key={o.id} to={`/app/obras/${o.id}`}>
            <Card className="p-4 hover:border-primary/40 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <p className="font-bold truncate">{o.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{o.endereco}</p>
                </div>
                <Badge variant="outline">{o.status}</Badge>
              </div>
              <Progress value={o.percentual} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span className="capitalize">{o.etapa_atual}</span>
                <span>{o.percentual}%</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}