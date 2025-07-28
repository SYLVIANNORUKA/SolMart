-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  logo TEXT,
  banner TEXT,
  address JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(20, 6) NOT NULL,
  category TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  image TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update orders table to include vendor information
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_orders JSONB DEFAULT '[]';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_wallet_address ON vendors(wallet_address);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Vendor policies
CREATE POLICY "Vendors can view their own profile" ON vendors
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Vendors can update their own profile" ON vendors
  FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Anyone can view approved vendors" ON vendors
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage all vendors" ON vendors
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Product policies
CREATE POLICY "Vendors can manage their own products" ON products
  FOR ALL USING (
    seller_id IN (
      SELECT id FROM vendors 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

CREATE POLICY "Anyone can view active products from approved vendors" ON products
  FOR SELECT USING (
    is_active = true AND
    seller_id IN (
      SELECT id FROM vendors 
      WHERE status = 'approved'
    )
  );

CREATE POLICY "Admins can manage all products" ON products
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON vendors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate vendor status before product operations
CREATE OR REPLACE FUNCTION validate_vendor_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if vendor is approved before allowing product operations
  IF NOT EXISTS (
    SELECT 1 FROM vendors 
    WHERE id = NEW.seller_id AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Vendor must be approved to create products';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to validate vendor status
CREATE TRIGGER validate_vendor_status_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_vendor_status();

-- Create view for products with vendor information
CREATE OR REPLACE VIEW products_with_vendors AS
SELECT 
  p.*,
  v.business_name as vendor_name,
  v.wallet_address as vendor_wallet,
  v.status as vendor_status
FROM products p
JOIN vendors v ON p.seller_id = v.id
WHERE v.status = 'approved' AND p.is_active = true;

-- Create function to get vendor statistics
CREATE OR REPLACE FUNCTION get_vendor_stats(vendor_id UUID)
RETURNS TABLE (
  total_products INTEGER,
  active_products INTEGER,
  total_revenue DECIMAL(20, 6),
  total_orders INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(p.id)::INTEGER as total_products,
    COUNT(CASE WHEN p.is_active THEN 1 END)::INTEGER as active_products,
    COALESCE(SUM(
      CASE 
        WHEN o.status = 'delivered' THEN 
          (SELECT SUM(item.price * item.quantity) 
           FROM jsonb_array_elements(o.items) AS item 
           WHERE (item->>'vendor_id')::UUID = vendor_id)
        ELSE 0 
      END
    ), 0) as total_revenue,
    COUNT(DISTINCT o.id)::INTEGER as total_orders
  FROM products p
  LEFT JOIN orders o ON 
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(o.items) AS item 
      WHERE (item->>'vendor_id')::UUID = vendor_id
    )
  WHERE p.seller_id = vendor_id;
END;
$$ LANGUAGE plpgsql; 