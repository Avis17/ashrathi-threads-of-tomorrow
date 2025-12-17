-- Create enum for shop types
CREATE TYPE public.shop_type AS ENUM ('retail_showroom', 'wholesale_dealer', 'distributor', 'boutique', 'department_store', 'online_seller', 'factory_outlet', 'other');

-- Create enum for visit purpose
CREATE TYPE public.visit_purpose AS ENUM ('new_lead', 'follow_up', 'order_collection', 'payment_collection', 'complaint', 'market_survey', 'competitor_analysis', 'other');

-- Create enum for shop interest level
CREATE TYPE public.interest_level AS ENUM ('hot', 'warm', 'cold', 'not_interested');

-- Create enum for payment terms preference
CREATE TYPE public.payment_terms AS ENUM ('advance', 'cod', 'credit_7', 'credit_15', 'credit_30', 'credit_45', 'credit_60');

-- Create shops table (master data for unique shops)
CREATE TABLE public.market_intel_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  pincode TEXT,
  landmark TEXT,
  gst_number TEXT,
  shop_type shop_type NOT NULL,
  established_year INTEGER,
  shop_size TEXT,
  employee_count TEXT,
  monthly_purchase_volume TEXT,
  current_brands TEXT[],
  product_categories TEXT[],
  price_segment TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(phone, city)
);

-- Create shop visits table (each visit record)
CREATE TABLE public.market_intel_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.market_intel_shops(id) ON DELETE CASCADE NOT NULL,
  visited_by UUID REFERENCES auth.users(id) NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_time TIME NOT NULL DEFAULT CURRENT_TIME,
  visit_purpose visit_purpose NOT NULL,
  interest_level interest_level,
  products_shown TEXT[],
  products_interested TEXT[],
  sample_given BOOLEAN DEFAULT false,
  sample_details TEXT,
  order_taken BOOLEAN DEFAULT false,
  order_amount NUMERIC,
  payment_collected BOOLEAN DEFAULT false,
  payment_amount NUMERIC,
  payment_terms_preferred payment_terms,
  competitor_products TEXT[],
  competitor_prices JSONB,
  market_feedback TEXT,
  next_visit_date DATE,
  next_action TEXT,
  visit_outcome TEXT,
  visit_rating INTEGER CHECK (visit_rating >= 1 AND visit_rating <= 5),
  photos TEXT[],
  location_lat NUMERIC,
  location_lng NUMERIC,
  notes TEXT,
  is_synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create market intel field staff table
CREATE TABLE public.market_intel_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  staff_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  territory TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_shops_city ON public.market_intel_shops(city);
CREATE INDEX idx_shops_phone ON public.market_intel_shops(phone);
CREATE INDEX idx_visits_shop ON public.market_intel_visits(shop_id);
CREATE INDEX idx_visits_date ON public.market_intel_visits(visit_date);
CREATE INDEX idx_visits_staff ON public.market_intel_visits(visited_by);

-- Enable RLS
ALTER TABLE public.market_intel_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intel_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intel_staff ENABLE ROW LEVEL SECURITY;

-- RLS policies for shops - all authenticated users can view, only creators/admins can modify
CREATE POLICY "Authenticated users can view shops"
  ON public.market_intel_shops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create shops"
  ON public.market_intel_shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Staff can update their shops or admins can update all"
  ON public.market_intel_shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for visits
CREATE POLICY "Staff can view their visits, admins view all"
  ON public.market_intel_visits FOR SELECT
  TO authenticated
  USING (visited_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can create visits"
  ON public.market_intel_visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = visited_by);

CREATE POLICY "Staff can update their visits"
  ON public.market_intel_visits FOR UPDATE
  TO authenticated
  USING (visited_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for staff
CREATE POLICY "Staff can view their own record, admins view all"
  ON public.market_intel_staff FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage staff"
  ON public.market_intel_staff FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_market_intel_shops_updated_at
  BEFORE UPDATE ON public.market_intel_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();