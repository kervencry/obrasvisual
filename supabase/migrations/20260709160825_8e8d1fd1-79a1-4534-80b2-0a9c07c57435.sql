
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS foto_projeto_url TEXT;

CREATE OR REPLACE FUNCTION public.vincular_obra_por_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  o public.obras%ROWTYPE;
  uid UUID := auth.uid();
  urole public.app_role;
  papel_final public.app_role;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF _token IS NULL OR length(trim(_token)) = 0 THEN
    RAISE EXCEPTION 'token_required';
  END IF;

  SELECT * INTO o FROM public.obras WHERE publico_token = trim(_token) LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT role INTO urole FROM public.user_roles WHERE user_id = uid LIMIT 1;

  papel_final := CASE urole
    WHEN 'engenheiro'   THEN 'engenheiro'::public.app_role
    WHEN 'arquiteto'    THEN 'arquiteto'::public.app_role
    WHEN 'mestre_obras' THEN 'mestre_obras'::public.app_role
    ELSE 'cliente'::public.app_role
  END;

  INSERT INTO public.obra_members (obra_id, user_id, papel)
  VALUES (o.id, uid, papel_final)
  ON CONFLICT (obra_id, user_id) DO UPDATE SET papel = EXCLUDED.papel;

  RETURN jsonb_build_object(
    'id', o.id, 'nome', o.nome, 'endereco', o.endereco,
    'percentual', o.percentual, 'etapa_atual', o.etapa_atual,
    'status', o.status, 'data_fim_prevista', o.data_fim_prevista,
    'papel', papel_final
  );
END;
$function$;
