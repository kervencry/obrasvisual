CREATE OR REPLACE FUNCTION public.debug_auth()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$ SELECT jsonb_build_object(
  'uid', auth.uid(),
  'role', auth.role(),
  'claims', current_setting('request.jwt.claims', true),
  'current_user', current_user
) $$;
GRANT EXECUTE ON FUNCTION public.debug_auth() TO authenticated, anon;