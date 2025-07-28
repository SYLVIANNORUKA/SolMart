-- Multi-Vendor Schema for SolMart
-- Complete implementation in a single file

-- ============================================================================
-- 1. EXTEND EXISTING TABLES FOR MULTI-VENDOR FUNCTIONALITY
-- ============================================================================

-- Extend users table for vendor functionality
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS banner TEXT,
ADD COLUMN IF NOT EXISTS business_address JSONB,
ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();

-- Add vendor status constraint
ALTER TABLE public.users 
ADD CONSTRAINT users_vendor_status_check 
CHECK (vendor_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Extend products table for multi-vendor
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS vendor_name TEXT;

-- Add product constraints
ALTER TABLE public.products 
ADD CONSTRAINT products_is_active_check 
CHECK (is_active IN (true, false));

-- Extend orders table for multi-vendor orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_wallet TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS items JSONB,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC,
ADD COLUMN IF NOT EXISTS transaction_signature TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS vendor_orders JSONB DEFAULT '[]';

-- Add order status constraint
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_wallet ON public.orders(user_wallet);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_vendor_status ON public.users(vendor_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================

-- Products policies
CREATE POLICY "Anyone can view active products from approved vendors" ON public.products
  FOR SELECT USING (
    is_active = true AND
    seller_id IN (
      SELECT id FROM public.users 
      WHERE vendor_status = 'approved' OR role = 'admin'
    )
  );

CREATE POLICY "Vendors can manage their own products" ON public.products
  FOR ALL USING (
    seller_id IN (
      SELECT id FROM public.users 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address' 
      AND role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_wallet = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (user_wallet = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address' 
      AND role = 'admin'
    )
  );

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Anyone can create a user profile" ON public.users
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Vendor status validation function
CREATE OR REPLACE FUNCTION validate_vendor_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.seller_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = NEW.seller_id 
      AND (vendor_status = 'approved' OR role = 'admin')
    ) THEN
      RAISE EXCEPTION 'Only approved vendors can create/update products';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Get vendor statistics function
CREATE OR REPLACE FUNCTION get_vendor_stats(vendor_id UUID)
RETURNS TABLE(
  total_products BIGINT,
  active_products BIGINT,
  total_revenue NUMERIC,
  total_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(p.id)::BIGINT as total_products,
    COUNT(CASE WHEN p.is_active = true THEN 1 END)::BIGINT as active_products,
    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
    COUNT(DISTINCT o.id)::BIGINT as total_orders
  FROM public.users u
  LEFT JOIN public.products p ON u.id = p.seller_id
  LEFT JOIN public.orders o ON p.id = o.product_id
  WHERE u.id = vendor_id;
END;
$$ language 'plpgsql';

-- Check if wallet is vendor function
CREATE OR REPLACE FUNCTION is_vendor(wallet_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE wallet_address = $1 
    AND vendor_status = 'approved'
  );
END;
$$ language 'plpgsql';

-- Get vendor by wallet function
CREATE OR REPLACE FUNCTION get_vendor_by_wallet(wallet_address TEXT)
RETURNS TABLE(
  id UUID,
  business_name TEXT,
  vendor_status TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.business_name,
    u.vendor_status,
    u.role
  FROM public.users u
  WHERE u.wallet_address = $1;
END;
$$ language 'plpgsql';

-- Get approved vendors function
CREATE OR REPLACE FUNCTION get_approved_vendors()
RETURNS TABLE(
  id UUID,
  business_name TEXT,
  vendor_status TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.business_name,
    u.vendor_status,
    u.created_at
  FROM public.users u
  WHERE u.vendor_status = 'approved'
  ORDER BY u.created_at DESC;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 6. CREATE TRIGGERS
-- ============================================================================

-- Update timestamp triggers
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Vendor status validation trigger
CREATE TRIGGER validate_vendor_status_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION validate_vendor_status();

-- Auto-populate vendor name trigger
CREATE OR REPLACE FUNCTION update_product_vendor_info()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.seller_id IS NOT NULL THEN
    SELECT business_name INTO NEW.vendor_name
    FROM public.users
    WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_vendor_info_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_vendor_info();

-- ============================================================================
-- 7. CREATE VIEWS FOR EASY DATA ACCESS
-- ============================================================================

-- Products with vendor information
CREATE OR REPLACE VIEW products_with_vendors AS
SELECT 
  p.*,
  u.business_name as vendor_name,
  u.wallet_address as vendor_wallet,
  u.vendor_status,
  u.role
FROM public.products p
LEFT JOIN public.users u ON p.seller_id = u.id
WHERE p.is_active = true;

-- Vendor statistics view
CREATE OR REPLACE VIEW vendor_stats AS
SELECT 
  u.id as vendor_id,
  u.business_name,
  u.vendor_status,
  COUNT(p.id) as total_products,
  COUNT(CASE WHEN p.is_active = true THEN 1 END) as active_products,
  COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
  COUNT(DISTINCT o.id) as total_orders
FROM public.users u
LEFT JOIN public.products p ON u.id = p.seller_id
LEFT JOIN public.orders o ON p.id = o.product_id
WHERE u.vendor_status = 'approved'
GROUP BY u.id, u.business_name, u.vendor_status;

-- ============================================================================
-- 8. DATA MIGRATION
-- ============================================================================

-- Migrate existing order data
UPDATE public.orders 
SET user_wallet = buyer_wallet 
WHERE user_wallet IS NULL AND buyer_wallet IS NOT NULL;

UPDATE public.orders 
SET total_amount = total_price_usdc 
WHERE total_amount IS NULL AND total_price_usdc IS NOT NULL;

-- Migrate existing product data
UPDATE public.products p
SET vendor_name = u.business_name
FROM public.users u
WHERE p.seller_id = u.id AND p.vendor_name IS NULL;

-- Set default vendor status for existing users
UPDATE public.users 
SET vendor_status = 'approved' 
WHERE vendor_status IS NULL AND role = 'admin';

UPDATE public.users 
SET vendor_status = 'pending' 
WHERE vendor_status IS NULL AND role = 'buyer';

-- ============================================================================
-- 9. SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Multi-vendor schema implementation completed successfully!';
  RAISE NOTICE 'Features added:';
  RAISE NOTICE '- Vendor management in users table';
  RAISE NOTICE '- Multi-vendor product support';
  RAISE NOTICE '- Enhanced order tracking';
  RAISE NOTICE '- Row Level Security policies';
  RAISE NOTICE '- Performance indexes';
  RAISE NOTICE '- Helper functions and triggers';
  RAISE NOTICE '- Data views for easy access';
  RAISE NOTICE '- Existing data migration completed';
END $$; 