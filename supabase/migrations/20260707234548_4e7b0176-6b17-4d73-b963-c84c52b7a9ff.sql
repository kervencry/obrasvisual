
-- Fix obras RLS: recreate insert policy explicitly for authenticated role
DROP POLICY IF EXISTS obras_insert_own ON public.obras;
CREATE POLICY obras_insert_own ON public.obras
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Fase 1: visitas_obra
CREATE TABLE public.visitas_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  criado_por UUID NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_minutos INT NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel','agendado','cancelado','realizado')),
  agendado_por UUID,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitas_obra TO authenticated;
GRANT ALL ON public.visitas_obra TO service_role;
ALTER TABLE public.visitas_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY visitas_select_member ON public.visitas_obra FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY visitas_insert_editor ON public.visitas_obra FOR INSERT TO authenticated
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY visitas_update_editor ON public.visitas_obra FOR UPDATE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY visitas_update_member_book ON public.visitas_obra FOR UPDATE TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()) AND status = 'disponivel')
  WITH CHECK (public.is_obra_member(obra_id, auth.uid()) AND status = 'agendado' AND agendado_por = auth.uid());
CREATE POLICY visitas_delete_editor ON public.visitas_obra FOR DELETE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_visitas_upd BEFORE UPDATE ON public.visitas_obra FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fase 2: orcamentos_fornecedores
CREATE TABLE public.orcamentos_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  fornecedor TEXT NOT NULL,
  valor NUMERIC(14,2) NOT NULL,
  prazo_entrega TEXT,
  arquivo_url TEXT,
  observacoes TEXT,
  selecionado BOOLEAN NOT NULL DEFAULT false,
  criado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orcamentos_fornecedores TO authenticated;
GRANT ALL ON public.orcamentos_fornecedores TO service_role;
ALTER TABLE public.orcamentos_fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY orc_select_member ON public.orcamentos_fornecedores FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY orc_cud_editor ON public.orcamentos_fornecedores FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_orc_upd BEFORE UPDATE ON public.orcamentos_fornecedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fase 3: orcamento_planejado
CREATE TABLE public.orcamento_planejado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  etapa etapa_id NOT NULL,
  valor_planejado NUMERIC(14,2) NOT NULL,
  mes_referencia DATE NOT NULL,
  criado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orcamento_planejado TO authenticated;
GRANT ALL ON public.orcamento_planejado TO service_role;
ALTER TABLE public.orcamento_planejado ENABLE ROW LEVEL SECURITY;
CREATE POLICY orcp_select_member ON public.orcamento_planejado FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY orcp_cud_editor ON public.orcamento_planejado FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_orcp_upd BEFORE UPDATE ON public.orcamento_planejado FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fase 4: documentos_obra
CREATE TABLE public.documentos_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'outro',
  nome TEXT NOT NULL,
  arquivo_url TEXT,
  data_validade DATE,
  criado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_obra TO authenticated;
GRANT ALL ON public.documentos_obra TO service_role;
ALTER TABLE public.documentos_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY doc_select_member ON public.documentos_obra FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY doc_cud_editor ON public.documentos_obra FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_doc_upd BEFORE UPDATE ON public.documentos_obra FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fase 5: paralisacoes_obra
CREATE TABLE public.paralisacoes_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL DEFAULT 'outro',
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  criado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paralisacoes_obra TO authenticated;
GRANT ALL ON public.paralisacoes_obra TO service_role;
ALTER TABLE public.paralisacoes_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY par_select_member ON public.paralisacoes_obra FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY par_cud_editor ON public.paralisacoes_obra FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_par_upd BEFORE UPDATE ON public.paralisacoes_obra FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
