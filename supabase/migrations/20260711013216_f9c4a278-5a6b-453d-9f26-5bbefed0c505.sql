-- Unidades (apartamentos/casas dentro de uma obra) com token próprio
CREATE TABLE public.unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'apartamento',
  identificador TEXT,
  ordem INT NOT NULL DEFAULT 0,
  etapa_atual TEXT NOT NULL DEFAULT 'terreno',
  percentual INT NOT NULL DEFAULT 0,
  concluida BOOLEAN NOT NULL DEFAULT false,
  publico_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(12),'hex') UNIQUE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unidades TO authenticated;
GRANT ALL ON public.unidades TO service_role;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unidades_select_members" ON public.unidades FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "unidades_write_editors" ON public.unidades FOR ALL TO authenticated
  USING (public.is_obra_editor(obra_id, auth.uid()))
  WITH CHECK (public.is_obra_editor(obra_id, auth.uid()));

CREATE TRIGGER trg_unidades_updated_at BEFORE UPDATE ON public.unidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_unidades_obra ON public.unidades(obra_id);
CREATE INDEX idx_unidades_token ON public.unidades(publico_token);

-- Etapas por unidade
CREATE TABLE public.unidade_etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL,
  ordem INT NOT NULL,
  percentual INT NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  data_conclusao TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (unidade_id, etapa)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unidade_etapas TO authenticated;
GRANT ALL ON public.unidade_etapas TO service_role;
ALTER TABLE public.unidade_etapas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unid_etapas_select_members" ON public.unidade_etapas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.unidades u WHERE u.id = unidade_id AND public.is_obra_member(u.obra_id, auth.uid())));
CREATE POLICY "unid_etapas_write_editors" ON public.unidade_etapas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.unidades u WHERE u.id = unidade_id AND public.is_obra_editor(u.obra_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.unidades u WHERE u.id = unidade_id AND public.is_obra_editor(u.obra_id, auth.uid())));

CREATE INDEX idx_unid_etapas_unidade ON public.unidade_etapas(unidade_id);

-- Seed etapas padrão ao criar unidade
CREATE OR REPLACE FUNCTION public.seed_unidade_etapas()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.unidade_etapas (unidade_id, etapa, ordem, percentual) VALUES
    (NEW.id,'terreno',1,5),(NEW.id,'fundacao',2,15),(NEW.id,'estrutura',3,30),
    (NEW.id,'alvenaria',4,50),(NEW.id,'cobertura',5,65),(NEW.id,'instalacoes',6,80),
    (NEW.id,'acabamento',7,95),(NEW.id,'entregue',8,100);
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_seed_unidade_etapas AFTER INSERT ON public.unidades
  FOR EACH ROW EXECUTE FUNCTION public.seed_unidade_etapas();

-- Coluna em obra_members para escopar cliente a uma unidade
ALTER TABLE public.obra_members ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES public.unidades(id) ON DELETE SET NULL;

-- Flag na obra
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS tem_unidades BOOLEAN NOT NULL DEFAULT false;

-- RPC: vincular cliente por token da unidade
CREATE OR REPLACE FUNCTION public.vincular_unidade_por_token(_token text)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u public.unidades%ROWTYPE;
  o public.obras%ROWTYPE;
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _token IS NULL OR length(trim(_token)) = 0 THEN RAISE EXCEPTION 'token_required'; END IF;

  SELECT * INTO u FROM public.unidades WHERE publico_token = trim(_token) LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT * INTO o FROM public.obras WHERE id = u.obra_id;

  INSERT INTO public.obra_members (obra_id, user_id, papel, unidade_id)
  VALUES (u.obra_id, uid, 'cliente'::public.app_role, u.id)
  ON CONFLICT (obra_id, user_id) DO UPDATE SET unidade_id = EXCLUDED.unidade_id;

  RETURN jsonb_build_object(
    'obra_id', o.id, 'obra_nome', o.nome,
    'unidade_id', u.id, 'unidade_nome', u.nome,
    'etapa_atual', u.etapa_atual, 'percentual', u.percentual
  );
END; $$;

-- RPC público: ver unidade por id+token (sem login)
CREATE OR REPLACE FUNCTION public.get_unidade_publica(_id uuid, _token text)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u public.unidades%ROWTYPE;
  o public.obras%ROWTYPE;
  etapas_json JSONB;
BEGIN
  SELECT * INTO u FROM public.unidades WHERE id = _id AND publico_token = _token;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT * INTO o FROM public.obras WHERE id = u.obra_id;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'etapa',etapa,'ordem',ordem,'percentual',percentual,'concluida',concluida,'data_conclusao',data_conclusao
  ) ORDER BY ordem),'[]'::jsonb) INTO etapas_json FROM public.unidade_etapas WHERE unidade_id = u.id;
  RETURN jsonb_build_object(
    'unidade', jsonb_build_object('id',u.id,'nome',u.nome,'tipo',u.tipo,'identificador',u.identificador,'etapa_atual',u.etapa_atual,'percentual',u.percentual,'concluida',u.concluida),
    'obra', jsonb_build_object('id',o.id,'nome',o.nome,'endereco',o.endereco),
    'etapas', etapas_json
  );
END; $$;