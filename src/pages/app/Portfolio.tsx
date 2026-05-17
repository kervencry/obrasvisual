import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";

export default function Portfolio() {
  const { user } = useAuth();
  const [obras, setObras] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("obras").select("*").eq("status","concluida").then(({data})=>setObras(data??[]));
  }, [user]);
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-1">Meu portfólio</h1>
      <p className="text-muted-foreground mb-6">Obras concluídas — link público: <code>/portfolio/{user?.id}</code></p>
      {obras.length === 0 ? <p className="text-muted-foreground">Nenhuma obra concluída ainda.</p> : (
        <div className="grid md:grid-cols-3 gap-4">
          {obras.map(o=> (
            <Card key={o.id} className="overflow-hidden">
              {o.capa_url && <img src={o.capa_url} className="w-full h-40 object-cover" alt={o.nome}/>}
              <div className="p-4"><h3 className="font-bold">{o.nome}</h3><p className="text-sm text-muted-foreground">{o.endereco}</p></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}