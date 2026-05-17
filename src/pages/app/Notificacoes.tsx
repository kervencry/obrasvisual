import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Notificacoes() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("notificacoes").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
    supabase.from("notificacoes").update({ lida: true }).eq("user_id", user.id).eq("lida", false).then(()=>{});
  }, [user]);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-2"><Bell/>Notificações</h1>
      {items.length === 0 ? <p className="text-muted-foreground">Nenhuma notificação ainda.</p> : (
        <div className="space-y-2">
          {items.map(n => (
            <Card key={n.id} className="p-4">
              <div className="flex justify-between gap-3">
                <div><p className="font-medium">{n.titulo}</p><p className="text-sm text-muted-foreground">{n.mensagem}</p></div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}