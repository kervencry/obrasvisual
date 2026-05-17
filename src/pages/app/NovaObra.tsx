import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NovaObra() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", endereco: "", tipo: "casa", valor_previsto: "", data_inicio: "", data_fim_prevista: "", descricao: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("obras").insert({
      owner_id: user.id,
      nome: form.nome,
      endereco: form.endereco || null,
      tipo: form.tipo as any,
      valor_previsto: form.valor_previsto ? Number(form.valor_previsto) : null,
      data_inicio: form.data_inicio || null,
      data_fim_prevista: form.data_fim_prevista || null,
      descricao: form.descricao || null,
    }).select().single();
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Obra criada!");
    nav(`/app/obras/${data.id}`);
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-1">Nova obra</h1>
      <p className="text-muted-foreground mb-6">Cadastre uma nova obra para acompanhamento</p>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Nome da obra *</Label><Input required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></div>
          <div><Label>Endereço</Label><Input value={form.endereco} onChange={e=>setForm({...form,endereco:e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v=>setForm({...form,tipo:v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="predio">Prédio</SelectItem>
                  <SelectItem value="reforma">Reforma</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Valor previsto (R$)</Label><Input type="number" step="0.01" value={form.valor_previsto} onChange={e=>setForm({...form,valor_previsto:e.target.value})}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Data início</Label><Input type="date" value={form.data_inicio} onChange={e=>setForm({...form,data_inicio:e.target.value})}/></div>
            <div><Label>Prazo (entrega)</Label><Input type="date" value={form.data_fim_prevista} onChange={e=>setForm({...form,data_fim_prevista:e.target.value})}/></div>
          </div>
          <div><Label>Descrição</Label><Textarea rows={3} value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/></div>
          <Button type="submit" disabled={loading} className="w-full">{loading?"Criando...":"Criar obra"}</Button>
        </form>
      </Card>
    </div>
  );
}