
CREATE OR REPLACE FUNCTION public.vincular_obra_por_token(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o public.obras%ROWTYPE;
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF _token IS NULL OR length(trim(_token)) = 0 THEN
    RAISE EXCEPTION 'token_required';
  END IF;

  SELECT * INTO o FROM public.obras WHERE publico_token = trim(_token) LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.obra_members (obra_id, user_id, papel)
  VALUES (o.id, uid, 'cliente')
  ON CONFLICT (obra_id, user_id) DO NOTHING;

  RETURN jsonb_build_object(
    'id', o.id,
    'nome', o.nome,
    'endereco', o.endereco,
    'percentual', o.percentual,
    'etapa_atual', o.etapa_atual,
    'status', o.status,
    'data_fim_prevista', o.data_fim_prevista
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.vincular_obra_por_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vincular_obra_por_token(TEXT) TO authenticated;
