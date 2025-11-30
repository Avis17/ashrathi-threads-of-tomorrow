-- Create external_job_products table
CREATE TABLE external_job_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL UNIQUE,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create external_job_tasks table
CREATE TABLE external_job_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  product_id UUID REFERENCES external_job_products(id) ON DELETE CASCADE,
  is_common BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_name, product_id)
);

-- Enable RLS
ALTER TABLE external_job_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_job_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage external_job_products"
ON external_job_products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage external_job_tasks"
ON external_job_tasks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial products
INSERT INTO external_job_products (product_name, category) VALUES
  ('Polo Tshirt', 'Unisex'),
  ('V Neck Tshirt - Women', 'Women'),
  ('V Neck Tshirt - Men', 'Men'),
  ('Round Neck Tshirt - Men', 'Men'),
  ('Round Neck Tshirt - Boys', 'Kids'),
  ('7/8 High Waist Leggings', 'Women'),
  ('Ankle Length Leggings', 'Women'),
  ('Cotton Lycra Leggings', 'Women'),
  ('Straight Fit Leggings', 'Women'),
  ('Maternity Leggings', 'Women'),
  ('Women Top', 'Women'),
  ('Kids Set', 'Kids'),
  ('Pyjama', 'Unisex'),
  ('Rib Neck - Women', 'Women'),
  ('Track Pants', 'Unisex'),
  ('Shorts', 'Unisex'),
  ('Nightwear', 'Unisex'),
  ('Innerwear', 'Unisex');

-- Insert common tasks (available for all products)
INSERT INTO external_job_tasks (task_name, is_common, product_id) VALUES
  ('Thread Cutting', true, NULL),
  ('Excess Thread Cutting', true, NULL),
  ('Quality Check', true, NULL),
  ('Finishing', true, NULL);

-- Insert product-specific tasks for Leggings
INSERT INTO external_job_tasks (task_name, product_id) 
SELECT task_name, p.id FROM 
  (VALUES 
    ('Gusset Pouch'), ('Rise'), ('V Join'), ('Belt Elastic Joint'),
    ('Pocket Overlock Round'), ('Pocket Tower'), ('Leg Tower'),
    ('Waistband Attachment'), ('Side Seam'), ('Inseam')
  ) AS t(task_name)
CROSS JOIN external_job_products p 
WHERE p.product_name LIKE '%Leggings%';

-- Insert product-specific tasks for Rib Neck Women
INSERT INTO external_job_tasks (task_name, product_id)
SELECT task_name, p.id FROM
  (VALUES 
    ('Attam'), ('Munda'), ('Side'), ('Neck Piping'), 
    ('Hand Tower'), ('Body Tower'), ('Seeri'), 
    ('Neck Flat Lock'), ('Peek')
  ) AS t(task_name)
CROSS JOIN external_job_products p 
WHERE p.product_name = 'Rib Neck - Women';

-- Insert common tasks for T-shirts
INSERT INTO external_job_tasks (task_name, product_id)
SELECT task_name, p.id FROM
  (VALUES 
    ('Shoulder Join'), ('Side Seam'), ('Sleeve Attachment'),
    ('Neck Binding'), ('Hem Finish'), ('Label Attachment')
  ) AS t(task_name)
CROSS JOIN external_job_products p 
WHERE p.product_name LIKE '%Tshirt%';