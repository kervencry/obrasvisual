import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getPlanoDoUsuario, PLANOS, type Plano, type PlanoConfig } from "@/lib/planos";

export function usePlano() {
  const { user } = useAuth();
  const [plano, setPlano] = useState<Plano>("gratuito");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getPlanoDoUsuario(user.id).then(p => { setPlano(p); setLoading(false); });
  }, [user]);

  const config: PlanoConfig = PLANOS[plano];
  const can = (f: keyof PlanoConfig["features"]) => config.features[f];
  return { plano, config, can, loading, setPlano };
}