-- Invoices table
CREATE TYPE public.invoice_type AS ENUM ('sales', 'purchase');
CREATE TYPE public.payment_mode AS ENUM ('Cash', 'UPI', 'Bank');

CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  invoice_type public.invoice_type NOT NULL,
  customer_name TEXT NOT NULL,
  address TEXT,
  mobile TEXT NOT NULL,
  bike_model TEXT NOT NULL,
  registration_no TEXT,
  engine_no TEXT,
  chassis_no TEXT,
  km_driven INTEGER DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  payment_mode public.payment_mode DEFAULT 'Cash',
  delivery_date DATE,
  -- purchase fields
  rc_details TEXT,
  owner_details TEXT,
  advance NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  final_price NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view invoices" ON public.invoices FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Admins insert invoices" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Admins update invoices" ON public.invoices FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Admins delete invoices" ON public.invoices FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto invoice number: PBP-S-YYYY-0001 / PBP-P-YYYY-0001
CREATE OR REPLACE FUNCTION public.set_invoice_no()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  prefix TEXT;
  yr TEXT := to_char(now(),'YYYY');
  next_num INTEGER;
BEGIN
  IF NEW.invoice_no IS NOT NULL AND NEW.invoice_no <> '' THEN
    RETURN NEW;
  END IF;
  prefix := CASE WHEN NEW.invoice_type='sales' THEN 'PBP-S-' ELSE 'PBP-P-' END || yr || '-';
  SELECT COALESCE(MAX(CAST(split_part(invoice_no,'-',4) AS INTEGER)),0)+1
    INTO next_num FROM public.invoices
    WHERE invoice_no LIKE prefix || '%';
  NEW.invoice_no := prefix || lpad(next_num::TEXT, 4, '0');
  RETURN NEW;
END $$;

CREATE TRIGGER invoices_set_no BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_invoice_no();

-- Slider images
CREATE TABLE public.slider_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active slides" ON public.slider_images FOR SELECT TO public
  USING (is_active = true);
CREATE POLICY "Admins view all slides" ON public.slider_images FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Admins insert slides" ON public.slider_images FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Admins update slides" ON public.slider_images FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "Admins delete slides" ON public.slider_images FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- Slider images bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('slider-images','slider-images',true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read slider" ON storage.objects FOR SELECT
  USING (bucket_id = 'slider-images');
CREATE POLICY "Admins upload slider" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='slider-images' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')));
CREATE POLICY "Admins update slider" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='slider-images' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')));
CREATE POLICY "Admins delete slider" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='slider-images' AND has_role(auth.uid(),'admin'));