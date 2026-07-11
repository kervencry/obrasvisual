import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Key, Building2, ArrowRight } from "lucide-react";

interface Props {
  onVinculada?: (obra: any) => void;
  compact?: boolean;
}

export default function VincularObraToken({ onVinculada, compact }: Props) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function vincular() {
    const t = token.trim();
    if (!t) { toast.error("Digite o token da obra"); return; }
    setLoading(true);
    // 1) tenta como token de obra
    const { data: obraData, error: obraErr } = await (supabase.rpc as any)("vincular_obra_por_token", { _token: t });
    if (!obraErr && obraData) {
      setLoading(false);
      toast.success(`Obra vinculada: ${obraData.nome}`);
      setToken("");
      onVinculada?.(obraData);
      return;
    }
    // 2) tenta como token de unidade
    const { data: uniData, error: uniErr } = await (supabase.rpc as any)("vincular_unidade_por_token", { _token: t });
    setLoading(false);
    if (uniErr) { toast.error("Não foi possível vincular. Tente novamente."); return; }
    if (!uniData) { toast.error("Token inválido. Verifique com seu engenheiro."); return; }
    toast.success(`Unidade vinculada: ${uniData.unidade_nome}`);
    setToken("");
    onVinculada?.({ id: uniData.obra_id, nome: uniData.obra_nome, unidade: uniData });
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && (
        <div className="text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Key className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold">Vincule sua primeira obra</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Cole o token que seu engenheiro enviou para você
          </p>
        </div>
      )}
      <Input
        placeholder="Cole o token aqui..."
        value={token}
        onChange={e => setToken(e.target.value)}
        onKeyDown={e => e.key === "Enter" && vincular()}
        className="h-12 text-center text-lg font-mono tracking-widest"
      />
      <Button onClick={vincular} disabled={loading} className="w-full h-12 text-base">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Vinculando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Vincular obra
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}