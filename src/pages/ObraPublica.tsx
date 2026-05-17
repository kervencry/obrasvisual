import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AnimatedHouse from "@/components/obra/AnimatedHouse";
import { HardHat } from "lucide-react";

export default function ObraPublica() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const token = sp.get("t");
  const [obra, setObra] = useState<any>(null);
  const [fotos, setFotos] = useState<any[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Public access via anon: query without RLS will fail; use edge function or public read function.
    // Workaround: open RLS for public when token matches via RPC. For now, fetch obra by id+token using rpc-less query relying on no RLS bypass:
    // We'll create a public view via supabase function call. As a simpler fallback, query allowed columns publicly.
    (async () => {
      const { data, error } = await supabase.rpc("get_obra_publica", { _id: id, _token: token });
      if (error || !data) { setErr("Link inválido ou expirado"); return; }
      setObra(data.obra); setFotos(data.fotos || []);
    })();
  }, [id, token]);

  if (err) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{err}</div>;
  if (!obra) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex items-center gap-2">
        <HardHat className="h-5 w-5 text-primary"/><span className="font-bold">ObraVisual</span>
        <Badge variant="outline" className="ml-auto">Portal do Cliente</Badge>
      </header>
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold">{obra.nome}</h1>
          <p className="text-muted-foreground">{obra.endereco}</p>
        </div>
        <Card className="p-4">
          <div className="flex justify-between mb-2"><span className="font-semibold">Progresso geral</span><span className="font-bold text-primary">{obra.percentual}%</span></div>
          <Progress value={obra.percentual}/>
          <p className="text-sm text-muted-foreground mt-2">Etapa atual: <strong>{obra.etapa_atual}</strong></p>
        </Card>
        <Card className="p-4"><AnimatedHouse stage={obra.etapa_atual}/></Card>
        {fotos.length>0 && (
          <div>
            <h3 className="font-semibold mb-2">Fotos recentes</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {fotos.map((f:any)=>(<img key={f.id} src={f.url} className="w-full h-40 object-cover rounded" alt=""/>))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}