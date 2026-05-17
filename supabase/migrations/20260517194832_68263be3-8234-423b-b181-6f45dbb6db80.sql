
CREATE OR REPLACE FUNCTION public.get_obra_publica(_id UUID, _token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o public.obras%ROWTYPE;
  fotos_json JSONB;
BEGIN
  SELECT * INTO o FROM public.obras WHERE id = _id AND publico_token = _token;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id',f.id,'url',f.url,'legenda',f.legenda,'etapa',f.etapa,'created_at',f.created_at) ORDER BY f.created_at DESC), '[]'::jsonb)
    INTO fotos_json FROM public.fotos f WHERE f.obra_id = _id;
  RETURN jsonb_build_object(
    'obra', jsonb_build_object('id',o.id,'nome',o.nome,'endereco',o.endereco,'percentual',o.percentual,'etapa_atual',o.etapa_atual,'status',o.status),
    'fotos', fotos_json
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_obra_publica(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_obra_publica(UUID, TEXT) TO anon, authenticated;
