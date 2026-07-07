DROP POLICY IF EXISTS obras_insert_own ON public.obras;
CREATE POLICY obras_insert_own ON public.obras
  FOR INSERT TO authenticated
  WITH CHECK (true);