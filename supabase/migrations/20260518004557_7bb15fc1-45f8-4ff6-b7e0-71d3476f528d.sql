
CREATE OR REPLACE FUNCTION public.buscar_usuario_por_email(_email TEXT)
RETURNS TABLE(id UUID, nome TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nome
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(u.email) = lower(_email)
  LIMIT 1;
END;
$$;
GRANT EXECUTE ON FUNCTION public.buscar_usuario_por_email(TEXT) TO authenticated;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferencias JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
