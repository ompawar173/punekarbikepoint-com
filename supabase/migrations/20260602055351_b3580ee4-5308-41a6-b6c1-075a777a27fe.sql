
-- Restrict bike-images storage write operations to admin/manager
DROP POLICY IF EXISTS "Authenticated users can delete bike images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update bike images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload bike images" ON storage.objects;

CREATE POLICY "Admins can delete bike images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'bike-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins/managers can update bike images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'bike-images' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

CREATE POLICY "Admins/managers can upload bike images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bike-images' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

-- Restrict RC document uploads to admin/manager (sensitive documents)
DROP POLICY IF EXISTS "Anyone can upload RC documents" ON storage.objects;
CREATE POLICY "Admins/managers can upload RC documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'rc-documents' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.set_invoice_no() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role must remain executable by authenticated since RLS policies invoke it
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
