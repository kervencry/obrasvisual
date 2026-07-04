-- Resumos semanais gerados por IA
CREATE TABLE public.resumos_semanais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumos_semanais TO authenticated;
GRANT ALL ON public.resumos_semanais TO service_role;
ALTER TABLE public.resumos_semanais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resumos_select_member" ON public.resumos_semanais FOR SELECT
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "resumos_insert_member" ON public.resumos_semanais FOR INSERT
  WITH CHECK (public.is_obra_member(obra_id, auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "resumos_delete_own" ON public.resumos_semanais FOR DELETE
  USING (auth.uid() = user_id);
CREATE INDEX resumos_obra_created_idx ON public.resumos_semanais(obra_id, created_at DESC);

-- Checklist técnico por etapa
CREATE TABLE public.checklist_etapa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id UUID NOT NULL REFERENCES public.etapas(id) ON DELETE CASCADE,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  concluido BOOLEAN NOT NULL DEFAULT false,
  concluido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_etapa TO authenticated;
GRANT ALL ON public.checklist_etapa TO service_role;
ALTER TABLE public.checklist_etapa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_select_member" ON public.checklist_etapa FOR SELECT
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "checklist_insert_editor" ON public.checklist_etapa FOR INSERT
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY "checklist_update_editor" ON public.checklist_etapa FOR UPDATE
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY "checklist_delete_editor" ON public.checklist_etapa FOR DELETE
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE INDEX checklist_etapa_idx ON public.checklist_etapa(etapa_id, ordem);

-- Tarefas / kanban leve por obra
CREATE TABLE public.tarefas_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  criado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo DATE,
  status TEXT NOT NULL DEFAULT 'a_fazer',
  foto_url TEXT,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas_obra TO authenticated;
GRANT ALL ON public.tarefas_obra TO service_role;
ALTER TABLE public.tarefas_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tarefas_select_member" ON public.tarefas_obra FOR SELECT
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "tarefas_insert_editor" ON public.tarefas_obra FOR INSERT
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()) AND auth.uid() = criado_por);
CREATE POLICY "tarefas_update_editor_or_resp" ON public.tarefas_obra FOR UPDATE
  USING (public.is_obra_editor(obra_id, auth.uid()) OR auth.uid() = responsavel_id);
CREATE POLICY "tarefas_delete_editor" ON public.tarefas_obra FOR DELETE
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE INDEX tarefas_obra_idx ON public.tarefas_obra(obra_id, status);
CREATE TRIGGER tarefas_obra_updated_at BEFORE UPDATE ON public.tarefas_obra
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();