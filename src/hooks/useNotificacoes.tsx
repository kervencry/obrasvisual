import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useNotificacoes() {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotificacoes(data ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const ch = supabase
      .channel(`notif-${user.id}-${Math.random().toString(36).slice(2)}`);
    ch.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          if (cancelled) return;
          const n = payload.new;
          setNotificacoes(prev => [n, ...prev]);
          toast(n.titulo, { description: n.mensagem });
        },
      ).subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user]);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  async function marcarLida(id: string) {
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    setNotificacoes(prev => prev.map(n => (n.id === id ? { ...n, lida: true } : n)));
  }

  async function marcarTodasLidas() {
    if (!user) return;
    await supabase.from("notificacoes").update({ lida: true }).eq("user_id", user.id).eq("lida", false);
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  }

  return { notificacoes, naoLidas, marcarLida, marcarTodasLidas, reload: load };
}
