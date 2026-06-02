
-- ============== EDITOR FUNCTION (owner OR engenheiro/arquiteto/mestre_obras membro) ==============
CREATE OR REPLACE FUNCTION public.is_obra_editor(_obra uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.obras o WHERE o.id = _obra AND o.owner_id = _user
    UNION
    SELECT 1 FROM public.obra_members m
      WHERE m.obra_id = _obra
        AND m.user_id = _user
        AND m.papel::text IN ('engenheiro','arquiteto','mestre_obras')
  )
$$;

-- ============== POLICIES DE EDIÇÃO PARA EDITORES ==============
-- ETAPAS
DROP POLICY IF EXISTS etapas_cud_editor ON public.etapas;
CREATE POLICY etapas_cud_editor ON public.etapas
  FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));

-- FINANCEIRO
DROP POLICY IF EXISTS fin_insert_editor ON public.financeiro;
CREATE POLICY fin_insert_editor ON public.financeiro
  FOR INSERT TO authenticated
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()) AND auth.uid() = user_id);
DROP POLICY IF EXISTS fin_update_editor ON public.financeiro;
CREATE POLICY fin_update_editor ON public.financeiro
  FOR UPDATE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()));
DROP POLICY IF EXISTS fin_delete_editor ON public.financeiro;
CREATE POLICY fin_delete_editor ON public.financeiro
  FOR DELETE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()));

-- ============== PROFILES: PLANO ==============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plano text NOT NULL DEFAULT 'gratuito';

-- ============== CHAT SCOPE: cliente fala apenas com seus editores ==============
-- O chat já é por obra. Adicionamos coluna destinatario para mensagens privadas opcional (cliente -> equipe).
ALTER TABLE public.mensagens
  ADD COLUMN IF NOT EXISTS para_cliente boolean NOT NULL DEFAULT false;

-- ============== NOTIFICAÇÕES: garantir replica identity para realtime ==============
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;

-- garantir que a tabela esteja na publication realtime (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notificacoes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'mensagens'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens';
  END IF;
END $$;
