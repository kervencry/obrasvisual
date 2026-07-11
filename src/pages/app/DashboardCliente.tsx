import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AnimatedHouse from "@/components/obra/AnimatedHouse";
import { Bell, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import VincularObraToken from "@/components/obra/VincularObraToken";

export default function DashboardCliente() {
  const { user } = useAuth();
  const [obras, setObras] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleVinculada(obra: any) {
    // se veio de token de unidade, recarrega tudo
    if (obra?.unidade) { load(); }
    else setObras(prev => prev.some(o => o.id === obra.id) ? prev : [...prev, obra]);
    setDialogOpen(false);
  }

  async function load() {
    if (!user) return;
    const { data: mem } = await supabase.from("obra_members")
      .select("obra_id, unidade_id").eq("user_id", user.id).eq("papel", "cliente");
    const rows = mem ?? [];
    const ids = rows.map((m: any) => m.obra_id);
    if (ids.length) {
      const { data: o } = await supabase.from("obras").select("*").in("id", ids);
      setObras(o ?? []);
      const unidIds = rows.filter((m:any)=>m.unidade_id).map((m:any)=>m.unidade_id);
      if (unidIds.length) {
        const { data: u } = await supabase.from("unidades").select("*").in("id", unidIds);
        setUnidades(u ?? []);
      } else setUnidades([]);
    } else { setObras([]); setUnidades([]); }
    const { count } = await supabase.from("notificacoes").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("lida", false);
    setNaoLidas(count ?? 0);
  }
  useEffect(() => { load(); }, [user]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Minhas obras</h1>
          <p className="text-muted-foreground">Acompanhe o progresso da sua construção</p>
        </div>
        <div className="flex items-center gap-2">
          {naoLidas > 0 && (
            <Link to="/app/notificacoes">
              <Badge className="gap-1 py-2 px-3"><Bell className="h-4 w-4"/>{naoLidas} novas</Badge>
            </Link>
          )}
          {obras.length > 0 && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1"><Plus className="h-4 w-4"/>Vincular outra obra</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Vincular obra por token</DialogTitle>
                </DialogHeader>
                <VincularObraToken compact onVinculada={handleVinculada} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {obras.length === 0 && unidades.length === 0 ? (
        <Card className="p-8 md:p-12 max-w-xl mx-auto">
          <VincularObraToken onVinculada={handleVinculada} />
        </Card>
      ) : (
        <div className="space-y-6">
          {unidades.length > 0 && (
            <div>
              <h2 className="font-bold mb-2 text-sm uppercase tracking-widest text-muted-foreground">Minhas unidades</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {unidades.map(u => {
                  const obra = obras.find(o => o.id === u.obra_id);
                  return (
                    <Card key={u.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{obra?.nome ?? "Obra"}</p>
                          <h3 className="font-bold text-lg">{u.nome}</h3>
                          {u.identificador && <p className="text-xs text-muted-foreground">{u.identificador}</p>}
                        </div>
                        <Badge variant={u.concluida ? "default" : "outline"}>{u.concluida ? "Concluída" : `${u.percentual}%`}</Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1"><span className="capitalize">Etapa: {u.etapa_atual}</span><span className="font-bold">{u.percentual}%</span></div>
                        <Progress value={u.percentual} className="h-2"/>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Link to={`/unidade/${u.id}?t=${u.publico_token}`} target="_blank"><Button size="sm">Ver detalhes</Button></Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {obras.filter(o => !unidades.some(u => u.obra_id === o.id)).length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
          {obras.map(o => (
            unidades.some(u => u.obra_id === o.id) ? null :
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{o.nome}</h3>
                  <p className="text-sm text-muted-foreground">{o.endereco}</p>
                </div>
                <Badge variant="outline">{o.status}</Badge>
              </div>
              <div className="h-40 -mx-2"><AnimatedHouse stage={o.etapa_atual}/></div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1"><span>Etapa: {o.etapa_atual}</span><span className="font-bold">{o.percentual}%</span></div>
                <Progress value={o.percentual} className="h-2"/>
              </div>
              <div className="flex justify-between mt-4">
                <span className="text-xs text-muted-foreground">{o.data_fim_prevista ? `Prazo: ${new Date(o.data_fim_prevista).toLocaleDateString("pt-BR")}` : ""}</span>
                <Link to={`/app/obras/${o.id}`}><Button size="sm">Ver detalhes</Button></Link>
              </div>
            </Card>
          ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
