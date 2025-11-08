-- Create product_inventory table
CREATE TABLE product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- Index for fast lookups
CREATE INDEX idx_product_inventory_product ON product_inventory(product_id);
CREATE INDEX idx_product_inventory_lookup ON product_inventory(product_id, size, color);

-- RLS Policies
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inventory" ON product_inventory
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory" ON product_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_product_inventory_updated_at
  BEFORE UPDATE ON product_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create inventory validation function
CREATE OR REPLACE FUNCTION check_inventory_available(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT available_quantity INTO v_available
  FROM product_inventory
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN COALESCE(v_available, 0) >= p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create inventory deduction function
CREATE OR REPLACE FUNCTION deduct_inventory(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Get current available quantity with row lock
  SELECT available_quantity INTO v_available
  FROM product_inventory
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color
  FOR UPDATE;
  
  -- Check if enough stock
  IF COALESCE(v_available, 0) < p_quantity THEN
    RAISE EXCEPTION 'Insufficient inventory for product % (Size: %, Color: %)', p_product_id, p_size, p_color;
  END IF;
  
  -- Deduct inventory
  UPDATE product_inventory
  SET available_quantity = available_quantity - p_quantity,
      updated_at = NOW()
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  -- Update product's total stock
  UPDATE products
  SET current_total_stock = (
    SELECT COALESCE(SUM(available_quantity), 0)
    FROM product_inventory
    WHERE product_id = p_product_id
  )
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;