-- Add weight field to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_grams numeric NOT NULL DEFAULT 250,
ADD CONSTRAINT products_weight_positive CHECK (weight_grams > 0);

-- Add district field to customer_addresses table
ALTER TABLE customer_addresses 
ADD COLUMN IF NOT EXISTS district text;

-- Create shipping_settings table for zone configurations
CREATE TABLE IF NOT EXISTS shipping_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL UNIQUE,
  states text[] NOT NULL,
  charge_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shipping_config table for free delivery criteria
CREATE TABLE IF NOT EXISTS shipping_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_order_value numeric NOT NULL DEFAULT 999,
  min_items_for_free_delivery integer NOT NULL DEFAULT 3,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_settings
CREATE POLICY "Anyone can view shipping settings" 
ON shipping_settings FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage shipping settings" 
ON shipping_settings FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for shipping_config
CREATE POLICY "Anyone can view shipping config" 
ON shipping_config FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage shipping config" 
ON shipping_config FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial shipping zone data
INSERT INTO shipping_settings (zone_name, states, charge_amount) VALUES
  ('LOCAL', ARRAY['TN', 'PY'], 40),
  ('ZONE_A', ARRAY['KA', 'KL', 'AP', 'TS'], 50),
  ('ZONE_B', ARRAY['MH', 'DL', 'WB', 'GJ'], 60),
  ('ZONE_C', ARRAY['RJ', 'UP', 'HR', 'PB', 'MP', 'CG', 'BR', 'OR', 'JK', 'HP', 'UK'], 70),
  ('ZONE_D', ARRAY['AS', 'AR', 'MN', 'ML', 'MZ', 'NL', 'SK', 'TR', 'AN', 'LD'], 90)
ON CONFLICT (zone_name) DO NOTHING;

-- Seed initial shipping config
INSERT INTO shipping_config (min_order_value, min_items_for_free_delivery)
VALUES (999, 3)
ON CONFLICT DO NOTHING;