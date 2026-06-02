import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { PLANOS, getPlanoDoUsuario, contarObrasDoUsuario, type Plano } from "@/lib/planos";

export default function NovaObra() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plano, setPlano] = useState<Plano>("gratuito");
  const [usadas, setUsadas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [form, setForm] = useState({
    nome: "", endereco: "", tipo: "casa",
    valor_previsto: "", data_inicio: "", data_fim_prevista: "", descricao: ""
  });

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) return;
      const [p, c] = await Promise.all([
        getPlanoDoUsuario(s.session.user.id),
        contarObrasDoUsuario(s.session.user.id),
      ]);
      setPlano(p); setUsadas(c);
      const max = PLANOS[p].maxObras;
      setBloqueado(max !== null && c >= max);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error("Nome da obra é obrigatório."); return; }
    if (bloqueado) {
      toast.error(`Limite do plano ${PLANOS[plano].nome} atingido. Faça upgrade.`);
      return;
    }
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      toast.error("Sessão expirada. Faça login novamente.");
      setLoading(false);
      nav("/auth");
      return;
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabase
      .from("obras")
      .insert({
        owner_id: userId,
        nome: form.nome.trim(),
        endereco: form.endereco || null,
        tipo: form.tipo as any,
        valor_previsto: form.valor_previsto ? Number(form.valor_previsto) : null,
        data_inicio: form.data_inicio || null,
        data_fim_prevista: form.data_fim_prevista || null,
        descricao: form.descricao || null,
        etapa_atual: "terreno",
        percentual: 0,
        status: "planejamento",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Erro ao criar obra:", error);
      toast.error(`Erro: ${error.message}`);
      return;
    }

    toast.success("Obra criada com sucesso!");
    nav(`/app/obras/${data.id}`);
  }

  if (bloqueado) {
    return (
      <div className="p-6 md:p-8 max-w-xl mx-auto">
        <Card className="p-8 text-center">
          <Crown className="h-12 w-12 mx-auto text-primary mb-3" />
          <h2 className="text-2xl font-bold mb-2">Limite do plano atingido</h2>
          <p className="text-muted-foreground mb-5">
            Seu plano <strong>{PLANOS[plano].nome}</strong> permite até <strong>{PLANOS[plano].maxObras}</strong> obras
            e você já cadastrou <strong>{usadas}</strong>. Faça upgrade para criar mais obras.
          </p>
          <Link to="/app/planos"><Button size="lg">Ver planos</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Nova obra</h1>
          <p className="text-muted-foreground">Cadastre uma nova obra para acompanhamento</p>
        </div>
        <span className="text-xs text-muted-foreground">
          Plano {PLANOS[plano].nome}: {usadas}/{PLANOS[plano].maxObras ?? "∞"} obras
        </span>
      </div>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Nome da obra *</Label>
            <Input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Residência Silva" />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro, cidade" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="predio">Prédio</SelectItem>
                  <SelectItem value="reforma">Reforma</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor previsto (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.valor_previsto} onChange={e => setForm({ ...form, valor_previsto: e.target.value })} placeholder="0,00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data início</Label>
              <Input type="date" value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} />
            </div>
            <div>
              <Label>Prazo (entrega)</Label>
              <Input type="date" value={form.data_fim_prevista} onChange={e => setForm({ ...form, data_fim_prevista: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea rows={3} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva a obra, detalhes importantes..." />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 text-base">
            {loading ? "Criando obra..." : "Criar obra"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
