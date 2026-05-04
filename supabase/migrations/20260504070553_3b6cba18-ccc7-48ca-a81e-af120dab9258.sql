ALTER TABLE public.slider_images
ADD COLUMN IF NOT EXISTS display_seconds integer NOT NULL DEFAULT 5;