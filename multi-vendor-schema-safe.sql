-- Multi-Vendor Schema for SolMart (Safe Version)
-- Complete implementation with existing column checks

-- ============================================================================
-- 1. EXTEND EXISTING TABLES FOR MULTI-VENDOR FUNCTIONALITY
-- ============================================================================

-- Extend users table for vendor functionality (with safety checks)
DO $$
BEGIN
    -- Add business_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_name'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_name TEXT;
    END IF;
    
    -- Add business_description if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_description'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_description TEXT;
    END IF;
    
    -- Add phone if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;
    
    -- Add website if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'website'
    ) THEN
        ALTER TABLE public.users ADD COLUMN website TEXT;
    END IF;
    
    -- Add logo if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'logo'
    ) THEN
        ALTER TABLE public.users ADD COLUMN logo TEXT;
    END IF;
    
    -- Add banner if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'banner'
    ) THEN
        ALTER TABLE public.users ADD COLUMN banner TEXT;
    END IF;
    
    -- Add business_address if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_address'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_address JSONB;
    END IF;
    
    -- Add vendor_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'vendor_status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN vendor_status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
    END IF;
    
    RAISE NOTICE 'Users table extended successfully';
END $$;

-- Add vendor status constraint (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_name = 'users_vendor_status_check'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_vendor_status_check 
        CHECK (vendor_status IN ('pending', 'approved', 'rejected', 'suspended'));
    END IF;
END $$;

-- Extend products table for multi-vendor (with safety checks)
DO $$
BEGIN
    -- Add is_active if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
    END IF;
    
    -- Add vendor_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'vendor_name'
    ) THEN
        ALTER TABLE public.products ADD COLUMN vendor_name TEXT;
    END IF;
    
    RAISE NOTICE 'Products table extended successfully';
END $$;

-- Add product constraints (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_name = 'products_is_active_check'
    ) THEN
        ALTER TABLE public.products 
        ADD CONSTRAINT products_is_active_check 
        CHECK (is_active IN (true, false));
    END IF;
END $$;

-- Extend orders table for multi-vendor orders (with safety checks)
DO $$
BEGIN
    -- Add user_wallet if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_wallet'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN user_wallet TEXT;
    END IF;
    
    -- Add user_email if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_email'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN user_email TEXT;
    END IF;
    
    -- Add items if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'items'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB;
    END IF;
    
    -- Add total_amount if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN total_amount NUMERIC;
    END IF;
    
    -- Add transaction_signature if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'transaction_signature'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN transaction_signature TEXT;
    END IF;
    
    -- Add tracking_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
    
    -- Add estimated_delivery if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'estimated_delivery'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN estimated_delivery TEXT;
    END IF;
    
    -- Add shipping_address if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN shipping_address JSONB;
    END IF;
    
    -- Add notes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
    END IF;
    
    -- Add vendor_orders if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'vendor_orders'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN vendor_orders JSONB DEFAULT '[]';
    END IF;
    
    RAISE NOTICE 'Orders table extended successfully';
END $$;

-- Add order status constraint (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' AND constraint_name = 'orders_status_check'
    ) THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
    END IF;
END $$;

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE (SAFE)
-- ============================================================================

DO $$
BEGIN
    -- Products indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_seller_id') THEN
        CREATE INDEX idx_products_seller_id ON public.products(seller_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_category') THEN
        CREATE INDEX idx_products_category ON public.products(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_is_active') THEN
        CREATE INDEX idx_products_is_active ON public.products(is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_created_at') THEN
        CREATE INDEX idx_products_created_at ON public.products(created_at);
    END IF;
    
    -- Orders indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_user_wallet') THEN
        CREATE INDEX idx_orders_user_wallet ON public.orders(user_wallet);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_status') THEN
        CREATE INDEX idx_orders_status ON public.orders(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_created_at') THEN
        CREATE INDEX idx_orders_created_at ON public.orders(created_at);
    END IF;
    
    -- Users indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_wallet_address') THEN
        CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_vendor_status') THEN
        CREATE INDEX idx_users_vendor_status ON public.users(vendor_status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_role') THEN
        CREATE INDEX idx_users_role ON public.users(role);
    END IF;
    
    RAISE NOTICE 'Indexes created successfully';
END $$;

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES (SAFE)
-- ============================================================================

DO $$
BEGIN
    -- Products policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Anyone can view active products from approved vendors'
    ) THEN
        CREATE POLICY "Anyone can view active products from approved vendors" ON public.products
          FOR SELECT USING (
            is_active = true AND
            seller_id IN (
              SELECT id FROM public.users 
              WHERE vendor_status = 'approved' OR role = 'admin'
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Vendors can manage their own products'
    ) THEN
        CREATE POLICY "Vendors can manage their own products" ON public.products
          FOR ALL USING (
            seller_id IN (
              SELECT id FROM public.users 
              WHERE wallet_address = auth.jwt() ->> 'wallet_address'
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Admins can manage all products'
    ) THEN
        CREATE POLICY "Admins can manage all products" ON public.products
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE wallet_address = auth.jwt() ->> 'wallet_address' 
              AND role = 'admin'
            )
          );
    END IF;

    -- Orders policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Users can view their own orders'
    ) THEN
        CREATE POLICY "Users can view their own orders" ON public.orders
          FOR SELECT USING (user_wallet = auth.jwt() ->> 'wallet_address');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Users can create their own orders'
    ) THEN
        CREATE POLICY "Users can create their own orders" ON public.orders
          FOR INSERT WITH CHECK (user_wallet = auth.jwt() ->> 'wallet_address');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Admins can view all orders'
    ) THEN
        CREATE POLICY "Admins can view all orders" ON public.orders
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE wallet_address = auth.jwt() ->> 'wallet_address' 
              AND role = 'admin'
            )
          );
    END IF;

    -- Users policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON public.users
          FOR SELECT USING (wallet_address = auth.jwt() ->> 'wallet_address');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.users
          FOR UPDATE USING (wallet_address = auth.jwt() ->> 'wallet_address');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Anyone can create a user profile'
    ) THEN
        CREATE POLICY "Anyone can create a user profile" ON public.users
          FOR INSERT WITH CHECK (true);
    END IF;
    
    RAISE NOTICE 'RLS policies created successfully';
END $$;

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
-- 6. CREATE ADDITIONAL FUNCTIONS
-- ============================================================================

-- Auto-populate vendor name function
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

-- ============================================================================
-- 7. CREATE TRIGGERS (SAFE)
-- ============================================================================

DO $$
BEGIN
    -- Update timestamp triggers
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at'
    ) THEN
        CREATE TRIGGER update_products_updated_at 
          BEFORE UPDATE ON public.products 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at'
    ) THEN
        CREATE TRIGGER update_orders_updated_at 
          BEFORE UPDATE ON public.orders 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON public.users 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Vendor status validation trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'validate_vendor_status_trigger'
    ) THEN
        CREATE TRIGGER validate_vendor_status_trigger
          BEFORE INSERT OR UPDATE ON public.products
          FOR EACH ROW
          EXECUTE FUNCTION validate_vendor_status();
    END IF;
    
    -- Auto-populate vendor name trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_vendor_info_trigger'
    ) THEN
        CREATE TRIGGER update_product_vendor_info_trigger
          BEFORE INSERT OR UPDATE ON public.products
          FOR EACH ROW
          EXECUTE FUNCTION update_product_vendor_info();
    END IF;
    
    RAISE NOTICE 'Triggers created successfully';
END $$;

-- ============================================================================
-- 8. CREATE VIEWS FOR EASY DATA ACCESS
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
-- 9. DATA MIGRATION
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
-- 10. SUCCESS MESSAGE
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