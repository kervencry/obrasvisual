
-- =========== Estoque de materiais ===========
CREATE TABLE public.materiais_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'un',
  saldo NUMERIC NOT NULL DEFAULT 0,
  estoque_minimo NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materiais_estoque TO authenticated;
GRANT ALL ON public.materiais_estoque TO service_role;
ALTER TABLE public.materiais_estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materiais_select_members" ON public.materiais_estoque FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "materiais_write_editors" ON public.materiais_estoque FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_materiais_updated BEFORE UPDATE ON public.materiais_estoque
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estoque_movimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materiais_estoque(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida','ajuste')),
  quantidade NUMERIC NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  responsavel TEXT,
  observacoes TEXT,
  financeiro_id UUID REFERENCES public.financeiro(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque_movimentos TO authenticated;
GRANT ALL ON public.estoque_movimentos TO service_role;
ALTER TABLE public.estoque_movimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estoque_mov_select_members" ON public.estoque_movimentos FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "estoque_mov_write_editors" ON public.estoque_movimentos FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));

-- Trigger que ajusta o saldo do material a cada movimento
CREATE OR REPLACE FUNCTION public.aplicar_movimento_estoque()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE delta NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    delta := CASE NEW.tipo WHEN 'entrada' THEN NEW.quantidade
                           WHEN 'saida'   THEN -NEW.quantidade
                           WHEN 'ajuste'  THEN NEW.quantidade END;
    UPDATE public.materiais_estoque SET saldo = saldo + delta WHERE id = NEW.material_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    delta := CASE OLD.tipo WHEN 'entrada' THEN -OLD.quantidade
                           WHEN 'saida'   THEN OLD.quantidade
                           WHEN 'ajuste'  THEN -OLD.quantidade END;
    UPDATE public.materiais_estoque SET saldo = saldo + delta WHERE id = OLD.material_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_estoque_movto_apply
AFTER INSERT OR DELETE ON public.estoque_movimentos
FOR EACH ROW EXECUTE FUNCTION public.aplicar_movimento_estoque();

-- =========== Inspeções de qualidade (FVS/FVM) ===========
CREATE TABLE public.inspecoes_qualidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('FVS','FVM')),
  titulo TEXT NOT NULL,
  etapa TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','conforme','nao_conforme')),
  responsavel TEXT,
  data_inspecao DATE NOT NULL DEFAULT CURRENT_DATE,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  nao_conformidade TEXT,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspecoes_qualidade TO authenticated;
GRANT ALL ON public.inspecoes_qualidade TO service_role;
ALTER TABLE public.inspecoes_qualidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inspecoes_select_members" ON public.inspecoes_qualidade FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "inspecoes_write_editors" ON public.inspecoes_qualidade FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_inspecoes_updated BEFORE UPDATE ON public.inspecoes_qualidade
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_materiais_obra ON public.materiais_estoque(obra_id);
CREATE INDEX idx_estoque_mov_obra ON public.estoque_movimentos(obra_id, data DESC);
CREATE INDEX idx_estoque_mov_material ON public.estoque_movimentos(material_id);
CREATE INDEX idx_inspecoes_obra ON public.inspecoes_qualidade(obra_id, data_inspecao DESC);
