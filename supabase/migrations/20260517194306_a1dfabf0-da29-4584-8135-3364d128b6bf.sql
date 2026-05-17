
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','cliente','engenheiro','arquiteto','mestre_obras');
CREATE TYPE public.obra_status AS ENUM ('planejamento','em_andamento','pausada','concluida','cancelada');
CREATE TYPE public.obra_tipo AS ENUM ('casa','predio','reforma','comercial','outro');
CREATE TYPE public.etapa_status AS ENUM ('nao_iniciado','em_andamento','concluido','aprovado');
CREATE TYPE public.etapa_id AS ENUM ('terreno','fundacao','estrutura','alvenaria','cobertura','instalacoes','acabamento','entregue');
CREATE TYPE public.fin_tipo AS ENUM ('orcamento','gasto');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  telefone TEXT,
  avatar_url TEXT,
  bio TEXT,
  empresa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_insert_self" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger: criar profile + role no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'cliente'));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- OBRAS
CREATE TABLE public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT,
  tipo public.obra_tipo NOT NULL DEFAULT 'casa',
  valor_previsto NUMERIC(14,2),
  data_inicio DATE,
  data_fim_prevista DATE,
  status public.obra_status NOT NULL DEFAULT 'planejamento',
  etapa_atual public.etapa_id NOT NULL DEFAULT 'terreno',
  percentual INT NOT NULL DEFAULT 0,
  capa_url TEXT,
  descricao TEXT,
  publico_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text,'-',''),
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_obras_upd BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- OBRA_MEMBERS
CREATE TABLE public.obra_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  papel public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(obra_id, user_id)
);
ALTER TABLE public.obra_members ENABLE ROW LEVEL SECURITY;

-- Helper: membro da obra?
CREATE OR REPLACE FUNCTION public.is_obra_member(_obra UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.obras o WHERE o.id = _obra AND o.owner_id = _user
    UNION
    SELECT 1 FROM public.obra_members m WHERE m.obra_id = _obra AND m.user_id = _user
  )
$$;

CREATE OR REPLACE FUNCTION public.is_obra_owner(_obra UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.obras WHERE id = _obra AND owner_id = _user)
$$;

-- OBRAS policies
CREATE POLICY "obras_select_member" ON public.obras FOR SELECT USING (public.is_obra_member(id, auth.uid()));
CREATE POLICY "obras_insert_own" ON public.obras FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "obras_update_owner" ON public.obras FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "obras_delete_owner" ON public.obras FOR DELETE USING (auth.uid() = owner_id);

-- OBRA_MEMBERS policies
CREATE POLICY "members_select" ON public.obra_members FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "members_insert_owner" ON public.obra_members FOR INSERT WITH CHECK (public.is_obra_owner(obra_id, auth.uid()));
CREATE POLICY "members_delete_owner" ON public.obra_members FOR DELETE USING (public.is_obra_owner(obra_id, auth.uid()));

-- ETAPAS
CREATE TABLE public.etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  etapa public.etapa_id NOT NULL,
  ordem INT NOT NULL,
  percentual INT NOT NULL DEFAULT 0,
  status public.etapa_status NOT NULL DEFAULT 'nao_iniciado',
  data_inicio DATE,
  data_fim_prevista DATE,
  data_fim_real DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(obra_id, etapa)
);
ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_etapas_upd BEFORE UPDATE ON public.etapas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "etapas_select_member" ON public.etapas FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "etapas_cud_owner" ON public.etapas FOR ALL USING (public.is_obra_owner(obra_id, auth.uid())) WITH CHECK (public.is_obra_owner(obra_id, auth.uid()));

-- Trigger: criar 8 etapas padrão ao criar obra
CREATE OR REPLACE FUNCTION public.seed_etapas()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.etapas (obra_id, etapa, ordem, percentual) VALUES
    (NEW.id,'terreno',1,5),(NEW.id,'fundacao',2,15),(NEW.id,'estrutura',3,30),
    (NEW.id,'alvenaria',4,50),(NEW.id,'cobertura',5,65),(NEW.id,'instalacoes',6,80),
    (NEW.id,'acabamento',7,95),(NEW.id,'entregue',8,100);
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_obra_seed_etapas AFTER INSERT ON public.obras FOR EACH ROW EXECUTE FUNCTION public.seed_etapas();

-- FOTOS
CREATE TABLE public.fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  etapa public.etapa_id,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  legenda TEXT,
  tipo TEXT DEFAULT 'foto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fotos_select_member" ON public.fotos FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "fotos_insert_member" ON public.fotos FOR INSERT WITH CHECK (public.is_obra_member(obra_id, auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "fotos_delete_owner" ON public.fotos FOR DELETE USING (auth.uid() = user_id OR public.is_obra_owner(obra_id, auth.uid()));

-- MENSAGENS
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  etapa public.etapa_id,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select_member" ON public.mensagens FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "msg_insert_member" ON public.mensagens FOR INSERT WITH CHECK (public.is_obra_member(obra_id, auth.uid()) AND auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;

-- APROVACOES
CREATE TABLE public.aprovacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  etapa public.etapa_id NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aprovado BOOLEAN NOT NULL DEFAULT true,
  assinatura TEXT,
  comentario TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aprovacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aprov_select_member" ON public.aprovacoes FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "aprov_insert_member" ON public.aprovacoes FOR INSERT WITH CHECK (public.is_obra_member(obra_id, auth.uid()) AND auth.uid() = user_id);

-- DIARIO
CREATE TABLE public.diario_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  titulo TEXT,
  conteudo TEXT NOT NULL,
  clima TEXT,
  trabalhadores INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diario_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diario_select_member" ON public.diario_obra FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "diario_insert_member" ON public.diario_obra FOR INSERT WITH CHECK (public.is_obra_member(obra_id, auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "diario_update_own" ON public.diario_obra FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diario_delete_own" ON public.diario_obra FOR DELETE USING (auth.uid() = user_id);

-- FINANCEIRO
CREATE TABLE public.financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  etapa public.etapa_id,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo public.fin_tipo NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(14,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  nota_fiscal_url TEXT,
  categoria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_select_member" ON public.financeiro FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "fin_insert_owner" ON public.financeiro FOR INSERT WITH CHECK (public.is_obra_owner(obra_id, auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "fin_update_owner" ON public.financeiro FOR UPDATE USING (public.is_obra_owner(obra_id, auth.uid()));
CREATE POLICY "fin_delete_owner" ON public.financeiro FOR DELETE USING (public.is_obra_owner(obra_id, auth.uid()));

-- NOTIFICACOES
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT DEFAULT 'info',
  link TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON public.notificacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notificacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_member" ON public.notificacoes FOR INSERT WITH CHECK (
  obra_id IS NULL OR public.is_obra_member(obra_id, auth.uid())
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;

-- TIMELINE
CREATE TABLE public.timeline_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tl_select_member" ON public.timeline_eventos FOR SELECT USING (public.is_obra_member(obra_id, auth.uid()));
CREATE POLICY "tl_insert_member" ON public.timeline_eventos FOR INSERT WITH CHECK (public.is_obra_member(obra_id, auth.uid()));

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES
  ('fotos-obras','fotos-obras',true),
  ('documentos','documentos',false),
  ('avatars','avatars',true);

CREATE POLICY "fotos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'fotos-obras');
CREATE POLICY "fotos_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id='fotos-obras' AND auth.uid() IS NOT NULL);
CREATE POLICY "fotos_owner_del" ON storage.objects FOR DELETE USING (bucket_id='fotos-obras' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "docs_owner_read" ON storage.objects FOR SELECT USING (bucket_id='documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_owner_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id='documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_owner_del" ON storage.objects FOR DELETE USING (bucket_id='documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id='avatars');
CREATE POLICY "avatars_owner_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
