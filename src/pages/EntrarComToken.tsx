import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2, Key, ArrowRight, HardHat } from "lucide-react";

export default function EntrarComToken() {
  const nav = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function buscarObra() {
    const t = token.trim();
    if (!t) { toast.error("Digite o token da obra"); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from("obras")
      .select("id, nome, publico_token, status, percentual, etapa_atual")
      .eq("publico_token", t)
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      toast.error("Token inválido. Verifique com seu engenheiro.");
      return;
    }

    toast.success(`Obra encontrada: ${data.nome}`);
    nav(`/obra-publica/${data.id}?t=${data.publico_token}`);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold text-foreground">ObraVisual</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Portal do cliente</p>
        </div>

        <Card className="p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Key className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Acessar minha obra</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Digite o token que seu engenheiro enviou para você
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="Cole o token aqui..."
                value={token}
                onChange={e => setToken(e.target.value)}
                onKeyDown={e => e.key === "Enter" && buscarObra()}
                className="h-12 text-center text-lg font-mono tracking-widest"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                O token é uma sequência de letras e números enviada pelo seu engenheiro
              </p>
            </div>

            <Button onClick={buscarObra} disabled={loading} className="w-full h-12 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Buscando obra...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Ver minha obra
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Prefere salvar isso na sua conta e ver depois sem precisar do link?{" "}
              <Link to="/auth" className="text-primary font-medium hover:underline">
                Crie uma conta
              </Link>{" "}
              e cole o token lá dentro.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              É engenheiro ou arquiteto?{" "}
              <Link to="/auth" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </Card>

        {/* Como funciona */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "📩", titulo: "Receba o token", desc: "Seu engenheiro envia um código único" },
            { icon: "🔑", titulo: "Cole aqui", desc: "Digite o token neste campo" },
            { icon: "🏗️", titulo: "Acompanhe", desc: "Veja o progresso em tempo real" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card border border-border rounded-xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-semibold text-foreground">{item.titulo}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
