import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Building2 } from "lucide-react";

export default function Obras() {
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("obras").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setObras(data ?? []); setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Minhas obras</h1>
          <p className="text-muted-foreground">Acompanhe todas as suas obras em um só lugar</p>
        </div>
        <Link to="/app/obras/nova"><Button><Plus className="h-4 w-4 mr-2"/>Nova obra</Button></Link>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> :
       obras.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3"/>
          <h3 className="font-bold text-lg mb-1">Nenhuma obra ainda</h3>
          <p className="text-muted-foreground mb-4">Cadastre sua primeira obra para começar</p>
          <Link to="/app/obras/nova"><Button><Plus className="h-4 w-4 mr-2"/>Criar primeira obra</Button></Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obras.map(o => (
            <Link key={o.id} to={`/app/obras/${o.id}`}>
              <Card className="p-4 hover:shadow-lg transition cursor-pointer h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{o.nome}</h3>
                  <Badge variant="outline">{o.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{o.endereco || "Sem endereço"}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Progresso</span><span className="font-bold">{o.percentual}%</span></div>
                  <Progress value={o.percentual} className="h-2"/>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Etapa: <span className="font-medium text-foreground">{o.etapa_atual}</span></p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}