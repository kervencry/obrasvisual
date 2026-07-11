import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Home, Building } from "lucide-react";

export default function UnidadePublica() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const token = sp.get("t") ?? "";
  const [data, setData] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: res, error } = await (supabase.rpc as any)("get_unidade_publica", { _id: id, _token: token });
      if (error) { setErro("Erro ao carregar"); return; }
      if (!res) { setErro("Link inválido ou expirado"); return; }
      setData(res);
    })();
  }, [id, token]);

  if (erro) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 max-w-md text-center space-y-3">
        <p className="font-bold text-lg">{erro}</p>
        <p className="text-sm text-muted-foreground">Verifique o link ou o token com o responsável pela obra.</p>
        <Link to="/"><Button variant="outline">Voltar</Button></Link>
      </Card>
    </div>
  );
  if (!data) return <div className="min-h-screen flex items-center justify-center">Carregando…</div>;

  const { unidade, obra, etapas } = data;
  const Icon = unidade.tipo === "casa" ? Home : Building;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">{obra.nome}</p>
              <div className="flex items-center gap-2 mt-1">
                <Icon className="h-6 w-6 text-primary"/>
                <h1 className="text-2xl font-extrabold">{unidade.nome}</h1>
              </div>
              {unidade.identificador && <p className="text-xs text-muted-foreground mt-1">{unidade.identificador}</p>}
            </div>
            {unidade.concluida
              ? <Badge className="gap-1"><Check className="h-3 w-3"/>Concluída</Badge>
              : <Badge variant="outline">Em andamento</Badge>}
          </div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="capitalize text-muted-foreground">Etapa: {unidade.etapa_atual}</span>
            <span className="font-extrabold text-primary">{unidade.percentual}%</span>
          </div>
          <Progress value={unidade.percentual} className="h-3"/>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold mb-3">Checklist de etapas</h2>
          <div className="space-y-2">
            {etapas.map((e: any) => (
              <div key={e.etapa} className={`flex items-center justify-between p-3 rounded-lg border ${e.concluida ? "bg-primary/5 border-primary/40" : "border-border"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${e.concluida ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                    {e.concluida && <Check className="h-3 w-3 text-primary-foreground"/>}
                  </div>
                  <span className="capitalize font-medium">{e.etapa}</span>
                </div>
                <span className="text-xs text-muted-foreground">{e.percentual}%</span>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Quer receber notificações? <Link to="/auth" className="underline">Crie sua conta</Link> e cole o token para salvar esta unidade no seu dashboard.
        </p>
      </div>
    </div>
  );
}