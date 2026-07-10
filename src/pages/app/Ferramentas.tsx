import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calculator, CalendarClock, Contact2, Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Ferramentas úteis para engenheiro/arquiteto/mestre FORA de uma obra específica:
 *  - Calculadora de materiais (concreto, alvenaria, piso)
 *  - Agenda unificada de visitas de todas as obras
 *  - Lista de contatos rápidos dos clientes/equipe
 */
export default function Ferramentas() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold flex items-center gap-2"><Wrench className="h-7 w-7 text-primary"/>Ferramentas</h1>
        <p className="text-muted-foreground text-sm">Utilitários para o dia a dia do profissional — funciona para todas as suas obras.</p>
      </div>

      <Tabs defaultValue="calc">
        <TabsList>
          <TabsTrigger value="calc"><Calculator className="h-4 w-4 mr-1"/>Calculadora</TabsTrigger>
          <TabsTrigger value="agenda"><CalendarClock className="h-4 w-4 mr-1"/>Agenda</TabsTrigger>
          <TabsTrigger value="contatos"><Contact2 className="h-4 w-4 mr-1"/>Contatos</TabsTrigger>
        </TabsList>

        <TabsContent value="calc" className="mt-4">
          <CalculadoraMateriais />
        </TabsContent>
        <TabsContent value="agenda" className="mt-4">
          <AgendaUnificada />
        </TabsContent>
        <TabsContent value="contatos" className="mt-4">
          <ContatosRapidos />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CalculadoraMateriais() {
  const [area, setArea] = useState("");
  const [altura, setAltura] = useState("2.8");
  const [espessura, setEspessura] = useState("10");
  const a = Number(area) || 0;
  const h = Number(altura) || 0;
  const e = Number(espessura) || 0;

  // Estimativas usadas: valores médios de mercado (referência TCPO)
  const tijolos = Math.round(a * 25); // 25 tijolos/m² (bloco cerâmico 9x19x19)
  const cimento = Math.round(a * 0.4); // sacos 50kg — reboco médio
  const areia = (a * 0.06).toFixed(2); // m³
  const concreto = ((a * (e / 100))).toFixed(2); // m³ contrapiso
  const pintura = Math.ceil((a * h * 2) / 60); // latões 18L (2 demãos, 60m²/lata)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-bold">Entrada</h3>
        <div><Label>Área (m²)</Label><Input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="Ex: 120"/></div>
        <div><Label>Pé-direito (m)</Label><Input type="number" step="0.1" value={altura} onChange={e => setAltura(e.target.value)}/></div>
        <div><Label>Espessura contrapiso (cm)</Label><Input type="number" value={espessura} onChange={e => setEspessura(e.target.value)}/></div>
        <p className="text-xs text-muted-foreground">Estimativas baseadas em índices médios de mercado. Consulte o orçamento detalhado.</p>
      </Card>
      <Card className="p-4 space-y-2">
        <h3 className="font-bold">Resultado estimado</h3>
        {a > 0 ? (
          <ul className="text-sm space-y-2">
            <li className="flex justify-between border-b pb-2"><span>Tijolos (9×19×19)</span><strong>{tijolos.toLocaleString("pt-BR")} un</strong></li>
            <li className="flex justify-between border-b pb-2"><span>Cimento (sacos 50kg)</span><strong>{cimento} sc</strong></li>
            <li className="flex justify-between border-b pb-2"><span>Areia média</span><strong>{areia} m³</strong></li>
            <li className="flex justify-between border-b pb-2"><span>Concreto contrapiso</span><strong>{concreto} m³</strong></li>
            <li className="flex justify-between"><span>Tinta (latões 18L, 2 demãos)</span><strong>{pintura} lt</strong></li>
          </ul>
        ) : <p className="text-sm text-muted-foreground">Informe a área para calcular.</p>}
      </Card>
    </div>
  );
}

function AgendaUnificada() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      if (!user) return;
      // Obras onde o usuário é owner
      const { data: obras } = await supabase.from("obras").select("id, nome").eq("owner_id", user.id);
      const ids = (obras ?? []).map((o: any) => o.id);
      if (ids.length === 0) { setRows([]); return; }
      const { data: vis } = await supabase.from("visitas_obra").select("*").in("obra_id", ids).order("data_visita");
      const map: Record<string, string> = {};
      (obras ?? []).forEach((o: any) => { map[o.id] = o.nome; });
      setRows((vis ?? []).map((v: any) => ({ ...v, obra_nome: map[v.obra_id] })));
    })();
  }, [user]);
  const proximas = useMemo(() => rows.filter(r => new Date(r.data_visita) >= new Date()), [rows]);
  return (
    <Card className="p-4">
      <h3 className="font-bold mb-3">Próximas visitas em todas as suas obras</h3>
      {proximas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem visitas agendadas.</p>
      ) : (
        <div className="space-y-2">
          {proximas.map(v => (
            <div key={v.id} className="flex flex-wrap justify-between border-b pb-2 last:border-0 text-sm gap-2">
              <div>
                <p className="font-semibold">{v.obra_nome}</p>
                <p className="text-xs text-muted-foreground">{v.observacoes ?? "Visita à obra"}</p>
              </div>
              <span className="text-xs font-mono">{format(new Date(v.data_visita), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ContatosRapidos() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: obras } = await supabase.from("obras").select("id, nome").eq("owner_id", user.id);
      const ids = (obras ?? []).map((o: any) => o.id);
      if (ids.length === 0) { setRows([]); return; }
      const { data: mem } = await supabase.from("obra_members").select("obra_id, user_id, papel").in("obra_id", ids);
      const userIds = Array.from(new Set((mem ?? []).map((m: any) => m.user_id)));
      const { data: profs } = await supabase.from("profiles").select("id, nome, telefone").in("id", userIds);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      const obraMap = new Map((obras ?? []).map((o: any) => [o.id, o.nome]));
      setRows((mem ?? []).map((m: any) => ({
        ...m,
        nome: map.get(m.user_id)?.nome ?? "—",
        telefone: map.get(m.user_id)?.telefone ?? "",
        obra_nome: obraMap.get(m.obra_id),
      })));
    })();
  }, [user]);
  return (
    <Card className="p-4">
      <h3 className="font-bold mb-3">Contatos das suas obras</h3>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">Sem contatos vinculados.</p> : (
        <div className="grid sm:grid-cols-2 gap-2">
          {rows.map((r, i) => (
            <div key={i} className="p-3 border rounded-lg text-sm">
              <p className="font-semibold">{r.nome}</p>
              <p className="text-xs text-muted-foreground capitalize">{r.papel} · {r.obra_nome}</p>
              {r.telefone && (
                <a href={`https://wa.me/${r.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                   className="text-xs text-primary underline mt-1 inline-block">
                  WhatsApp: {r.telefone}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}