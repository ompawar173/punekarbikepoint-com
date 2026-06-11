
-- 1. Remove rc_book_url from publicly readable bikes table.
--    RC documents must live only in the private 'rc-documents' bucket.
ALTER TABLE public.bikes DROP COLUMN IF EXISTS rc_book_url;

-- 2. Restrict UPDATE/DELETE on rc-documents storage bucket to admins/managers.
DROP POLICY IF EXISTS "Admins and managers can update rc-documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins and managers can delete rc-documents" ON storage.objects;

CREATE POLICY "Admins and managers can update rc-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rc-documents'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
)
WITH CHECK (
  bucket_id = 'rc-documents'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

CREATE POLICY "Admins and managers can delete rc-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'rc-documents'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);
