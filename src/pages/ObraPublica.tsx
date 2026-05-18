import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AnimatedHouse from "@/components/obra/AnimatedHouse";
import { Building2, MapPin } from "lucide-react";

export default function ObraPublica() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const token = sp.get("t");
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: d, error } = await supabase.rpc("get_obra_publica", { _id: id!, _token: token! });
      if (error || !d) { setErr("Link inválido ou expirado"); return; }
      setData(d as any);
      // public timeline (only descriptions)
      const { data: tl } = await supabase
        .from("timeline_eventos").select("id, tipo, descricao, created_at")
        .eq("obra_id", id).order("created_at", { ascending: false }).limit(10);
      setTimeline(tl ?? []);
    })();
  }, [id, token]);

  if (err) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{err}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  const obra = (data as any).obra;
  const fotos = (data as any).fotos ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto p-4 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary"/>
          <span className="font-extrabold">ObraVisual</span>
          <Badge variant="outline" className="ml-auto">Portal do Cliente</Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{obra.nome}</h1>
          {obra.endereco && <p className="text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-4 w-4"/>{obra.endereco}</p>}
          <div className="mt-6 max-w-xl">
            <div className="flex justify-between mb-2 text-sm"><span>Progresso da obra</span><span className="font-bold text-primary">{obra.percentual}%</span></div>
            <Progress value={obra.percentual} className="h-3"/>
            <p className="text-sm text-muted-foreground mt-2">Etapa atual: <span className="font-semibold text-foreground capitalize">{obra.etapa_atual}</span></p>
          </div>
        </section>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Visualização da obra</h2>
          <AnimatedHouse stage={obra.etapa_atual}/>
        </Card>

        {fotos.length > 0 && (
          <section>
            <h2 className="font-semibold mb-3">Fotos recentes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fotos.map((f:any) => (
                <button key={f.id} onClick={()=>setLightbox(f.url)} className="group relative overflow-hidden rounded-lg aspect-square">
                  <img src={f.url} alt={f.legenda || ""} className="w-full h-full object-cover group-hover:scale-105 transition"/>
                  {f.legenda && <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-1.5 text-left">{f.legenda}</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        {timeline.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold mb-3">Linha do tempo</h2>
            <div className="space-y-2">
              {timeline.map(t => (
                <div key={t.id} className="flex gap-3 text-sm border-l-2 border-primary/40 pl-3 py-1">
                  <Badge variant="outline" className="h-fit">{t.tipo}</Badge>
                  <div className="flex-1">
                    <p>{t.descricao}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <footer className="border-t border-border mt-10 py-6 text-center text-xs text-muted-foreground">
        Powered by <Link to="/" className="text-primary font-semibold hover:underline">ObraVisual</Link>
      </footer>

      <Dialog open={!!lightbox} onOpenChange={o=>!o && setLightbox(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-0">
          {lightbox && <img src={lightbox} alt="" className="w-full h-auto rounded-lg"/>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
