
-- 1. Add status to inquiries
DO $$ BEGIN
  CREATE TYPE public.inquiry_status AS ENUM ('Pending', 'Open', 'Converted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS status public.inquiry_status NOT NULL DEFAULT 'Pending';

-- Allow admins/managers to update inquiries (for status changes)
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries"
ON public.inquiries
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- 2. Add rc_book_url to bikes
ALTER TABLE public.bikes
  ADD COLUMN IF NOT EXISTS rc_book_url text;

-- 3. Coupons table
DO $$ BEGIN
  CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type public.discount_type NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  expiry_date date,
  bike_id uuid REFERENCES public.bikes(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
ON public.coupons FOR SELECT
USING (is_active = true AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE));

CREATE POLICY "Admins can view all coupons"
ON public.coupons FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can insert coupons"
ON public.coupons FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can update coupons"
ON public.coupons FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete coupons"
ON public.coupons FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_coupons_bike_id ON public.coupons(bike_id);

-- 4. RC documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rc-documents', 'rc-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload RC documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rc-documents');

CREATE POLICY "Admins can view RC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'rc-documents' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));
