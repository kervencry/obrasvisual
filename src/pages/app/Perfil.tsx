import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Perfil() {
  const { user, role } = useAuth();
  const [p, setP] = useState({ nome: "", telefone: "", bio: "", empresa: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setP({ nome: data.nome ?? "", telefone: data.telefone ?? "", bio: data.bio ?? "", empresa: data.empresa ?? "" });
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(p).eq("id", user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Meu perfil</h1>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3"><Badge>{role}</Badge><span className="text-sm text-muted-foreground">{user?.email}</span></div>
        <div><Label>Nome</Label><Input value={p.nome} onChange={e=>setP({...p,nome:e.target.value})}/></div>
        <div><Label>Telefone</Label><Input value={p.telefone} onChange={e=>setP({...p,telefone:e.target.value})}/></div>
        <div><Label>Empresa</Label><Input value={p.empresa} onChange={e=>setP({...p,empresa:e.target.value})}/></div>
        <div><Label>Bio</Label><Textarea rows={3} value={p.bio} onChange={e=>setP({...p,bio:e.target.value})}/></div>
        <Button onClick={save} disabled={loading}>{loading?"...":"Salvar"}</Button>
      </Card>
    </div>
  );
}