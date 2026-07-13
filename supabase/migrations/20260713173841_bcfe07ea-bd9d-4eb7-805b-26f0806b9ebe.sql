
-- PONTO DA EQUIPE
CREATE TABLE public.ponto_registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  user_id uuid,
  colaborador text NOT NULL,
  funcao text,
  data date NOT NULL DEFAULT CURRENT_DATE,
  entrada time,
  saida time,
  horas numeric,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ponto_registros TO authenticated;
GRANT ALL ON public.ponto_registros TO service_role;
ALTER TABLE public.ponto_registros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ponto select membros" ON public.ponto_registros FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "ponto insert editores" ON public.ponto_registros FOR INSERT TO authenticated
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY "ponto update editores" ON public.ponto_registros FOR UPDATE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY "ponto delete editores" ON public.ponto_registros FOR DELETE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_ponto_updated BEFORE UPDATE ON public.ponto_registros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEGURANÇA / NR-18
CREATE TABLE public.seguranca_registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  user_id uuid,
  tipo text NOT NULL DEFAULT 'checklist',
  item text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  descricao text,
  data date NOT NULL DEFAULT CURRENT_DATE,
  foto_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seguranca_registros TO authenticated;
GRANT ALL ON public.seguranca_registros TO service_role;
ALTER TABLE public.seguranca_registros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seg select membros" ON public.seguranca_registros FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "seg insert editores" ON public.seguranca_registros FOR INSERT TO authenticated
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY "seg update editores" ON public.seguranca_registros FOR UPDATE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE POLICY "seg delete editores" ON public.seguranca_registros FOR DELETE TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()));
CREATE TRIGGER trg_seg_updated BEFORE UPDATE ON public.seguranca_registros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
