DROP POLICY IF EXISTS obras_insert_own ON public.obras;
CREATE POLICY obras_insert_own ON public.obras
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS obras_select_member ON public.obras;
CREATE POLICY obras_select_member ON public.obras
  FOR SELECT TO authenticated, anon
  USING (auth.uid() = owner_id OR public.is_obra_member(id, auth.uid()));