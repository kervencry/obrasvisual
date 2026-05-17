import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export default function PortfolioPublico() {
  const { userId } = useParams();
  const [obras, setObras] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({data})=>setProfile(data));
    supabase.from("obras").select("*").eq("owner_id", userId).eq("status","concluida").then(({data})=>setObras(data??[]));
  }, [userId]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold">{profile?.nome ?? "Portfólio"}</h1>
          {profile?.empresa && <p className="text-muted-foreground">{profile.empresa}</p>}
          {profile?.bio && <p className="mt-2 max-w-xl mx-auto">{profile.bio}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {obras.map(o => (
            <Card key={o.id} className="overflow-hidden">
              {o.capa_url && <img src={o.capa_url} className="w-full h-40 object-cover" alt={o.nome}/>}
              <div className="p-4"><h3 className="font-bold">{o.nome}</h3><p className="text-sm text-muted-foreground">{o.endereco}</p></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}