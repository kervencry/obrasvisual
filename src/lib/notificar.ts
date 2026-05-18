import { supabase } from "@/integrations/supabase/client";

export type TipoNotificacao = "info" | "sucesso" | "alerta" | "erro";

export async function notificar(
  userId: string,
  obraId: string | null,
  titulo: string,
  mensagem: string,
  tipo: TipoNotificacao = "info",
  link: string | null = null,
) {
  if (!userId) return;
  await supabase.from("notificacoes").insert({
    user_id: userId,
    obra_id: obraId,
    titulo,
    mensagem,
    tipo,
    link,
  });
}

export async function notificarMembros(
  obraId: string,
  excludeUserId: string | null,
  titulo: string,
  mensagem: string,
  tipo: TipoNotificacao = "info",
  link: string | null = null,
) {
  const { data: obra } = await supabase.from("obras").select("owner_id").eq("id", obraId).maybeSingle();
  const { data: members } = await supabase.from("obra_members").select("user_id").eq("obra_id", obraId);
  const ids = new Set<string>();
  if (obra?.owner_id) ids.add(obra.owner_id);
  (members ?? []).forEach((m: any) => ids.add(m.user_id));
  if (excludeUserId) ids.delete(excludeUserId);
  if (ids.size === 0) return;
  const rows = Array.from(ids).map(uid => ({
    user_id: uid, obra_id: obraId, titulo, mensagem, tipo, link,
  }));
  await supabase.from("notificacoes").insert(rows);
}
