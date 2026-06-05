import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, type Role } from "@/lib/rbac";

export default function AdminUsuarios() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("id,nome,plano,created_at").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("user_id,role");
      const map = new Map<string, string>();
      (roles ?? []).forEach((r: any) => map.set(r.user_id, r.role));
      setRows((profiles ?? []).map((p: any) => ({ ...p, role: map.get(p.id) ?? "cliente" })));
    })();
  }, []);

  const filt = rows.filter((r) => (r.nome ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold">Usuários</h1>
        <p className="text-muted-foreground">{rows.length} usuários na plataforma</p>
      </div>
      <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {filt.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
              <div className="min-w-0">
                <p className="font-medium truncate">{u.nome ?? u.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  Cadastrado em {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{u.plano ?? "gratuito"}</Badge>
                <Badge>{ROLE_LABEL[u.role as Role] ?? u.role}</Badge>
              </div>
            </div>
          ))}
          {filt.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nenhum usuário.</div>}
        </div>
      </Card>
    </div>
  );
}