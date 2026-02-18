
-- Pre-Production Planner: Style Master table
CREATE TABLE IF NOT EXISTS public.pp_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code TEXT NOT NULL UNIQUE,
  style_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Nightwear',
  buyer TEXT,
  season TEXT,
  fabric_type TEXT,
  gsm TEXT,
  construction_type TEXT,
  stitch_type TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  description TEXT,
  color_palette TEXT[],
  target_market TEXT,
  created_by TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Style version history
CREATE TABLE IF NOT EXISTS public.pp_style_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES public.pp_styles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  changed_by TEXT,
  change_summary TEXT,
  ai_diff TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Measurement Sheet per style
CREATE TABLE IF NOT EXISTS public.pp_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES public.pp_styles(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL DEFAULT 'Standard',
  rows JSONB NOT NULL DEFAULT '[]',
  size_set TEXT[] NOT NULL DEFAULT ARRAY['XS','S','M','L','XL','XXL'],
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Technical Diagrams / Flat Sketches
CREATE TABLE IF NOT EXISTS public.pp_diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES public.pp_styles(id) ON DELETE CASCADE,
  diagram_type TEXT NOT NULL DEFAULT 'front',
  title TEXT NOT NULL,
  file_url TEXT,
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pattern & Marker Library
CREATE TABLE IF NOT EXISTS public.pp_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES public.pp_styles(id) ON DELETE CASCADE,
  pattern_version TEXT NOT NULL DEFAULT 'V1',
  size_set TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'PDF',
  created_by TEXT,
  notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tech Pack Generated Records
CREATE TABLE IF NOT EXISTS public.pp_tech_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES public.pp_styles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'generating',
  includes JSONB,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sampling records linked to style
CREATE TABLE IF NOT EXISTS public.pp_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES public.pp_styles(id) ON DELETE CASCADE,
  sample_type TEXT NOT NULL DEFAULT 'Proto',
  sample_number TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  sent_date DATE,
  received_date DATE,
  approval_status TEXT DEFAULT 'Pending',
  comments TEXT,
  factory TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Approval workflow
CREATE TABLE IF NOT EXISTS public.pp_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES public.pp_styles(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL,
  approver TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pp_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_style_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_tech_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pp_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin access)
CREATE POLICY "Authenticated users can manage pp_styles" ON public.pp_styles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pp_style_versions" ON public.pp_style_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pp_measurements" ON public.pp_measurements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pp_diagrams" ON public.pp_diagrams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pp_patterns" ON public.pp_patterns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pp_tech_packs" ON public.pp_tech_packs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pp_samples" ON public.pp_samples FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pp_approvals" ON public.pp_approvals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Timestamps trigger
CREATE TRIGGER update_pp_styles_updated_at BEFORE UPDATE ON public.pp_styles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pp_measurements_updated_at BEFORE UPDATE ON public.pp_measurements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pp_diagrams_updated_at BEFORE UPDATE ON public.pp_diagrams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pp_patterns_updated_at BEFORE UPDATE ON public.pp_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pp_samples_updated_at BEFORE UPDATE ON public.pp_samples FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for tech diagrams and patterns
INSERT INTO storage.buckets (id, name, public) VALUES ('pp-assets', 'pp-assets', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public read pp-assets" ON storage.objects FOR SELECT USING (bucket_id = 'pp-assets');
CREATE POLICY "Auth upload pp-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pp-assets');
CREATE POLICY "Auth update pp-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pp-assets');
CREATE POLICY "Auth delete pp-assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pp-assets');
