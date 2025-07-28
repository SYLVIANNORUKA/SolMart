-- Minimal Multi-Vendor Setup
-- Only adds essential missing columns and features

-- ============================================================================
-- 1. ADD ONLY MISSING COLUMNS
-- ============================================================================

-- Add vendor status to users (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'vendor_status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN vendor_status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added vendor_status to users table';
    END IF;
END $$;

-- Add business fields to users (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_name'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_name TEXT;
        RAISE NOTICE 'Added business_name to users table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_description'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_description TEXT;
        RAISE NOTICE 'Added business_description to users table';
    END IF;
END $$;

-- Add is_active to products (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active to products table';
    END IF;
END $$;

-- Add order tracking fields (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_wallet'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN user_wallet TEXT;
        RAISE NOTICE 'Added user_wallet to orders table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN total_amount NUMERIC;
        RAISE NOTICE 'Added total_amount to orders table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'items'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB;
        RAISE NOTICE 'Added items to orders table';
    END IF;
END $$;

-- ============================================================================
-- 2. CREATE ESSENTIAL INDEXES
-- ============================================================================

DO $$
BEGIN
    -- Essential indexes only
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_vendor_status') THEN
        CREATE INDEX idx_users_vendor_status ON public.users(vendor_status);
        RAISE NOTICE 'Created vendor_status index';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_is_active') THEN
        CREATE INDEX idx_products_is_active ON public.products(is_active);
        RAISE NOTICE 'Created is_active index';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_user_wallet') THEN
        CREATE INDEX idx_orders_user_wallet ON public.orders(user_wallet);
        RAISE NOTICE 'Created user_wallet index';
    END IF;
END $$;

-- ============================================================================
-- 3. ENABLE RLS
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE BASIC POLICIES
-- ============================================================================

DO $$
BEGIN
    -- Basic product policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Allow all product access'
    ) THEN
        CREATE POLICY "Allow all product access" ON public.products FOR ALL USING (true);
        RAISE NOTICE 'Created basic product policy';
    END IF;
    
    -- Basic order policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Allow all order access'
    ) THEN
        CREATE POLICY "Allow all order access" ON public.orders FOR ALL USING (true);
        RAISE NOTICE 'Created basic order policy';
    END IF;
    
    -- Basic user policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Allow all user access'
    ) THEN
        CREATE POLICY "Allow all user access" ON public.users FOR ALL USING (true);
        RAISE NOTICE 'Created basic user policy';
    END IF;
END $$;

-- ============================================================================
-- 5. CREATE ESSENTIAL FUNCTIONS
-- ============================================================================

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

-- ============================================================================
-- 6. DATA MIGRATION
-- ============================================================================

-- Migrate existing order data
UPDATE public.orders 
SET user_wallet = buyer_wallet 
WHERE user_wallet IS NULL AND buyer_wallet IS NOT NULL;

UPDATE public.orders 
SET total_amount = total_price_usdc 
WHERE total_amount IS NULL AND total_price_usdc IS NOT NULL;

-- Set default vendor status for existing users
UPDATE public.users 
SET vendor_status = 'approved' 
WHERE vendor_status IS NULL AND role = 'admin';

UPDATE public.users 
SET vendor_status = 'pending' 
WHERE vendor_status IS NULL AND role = 'buyer';

-- ============================================================================
-- 7. SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Minimal multi-vendor setup completed successfully!';
  RAISE NOTICE 'Essential features added:';
  RAISE NOTICE '- Vendor status management';
  RAISE NOTICE '- Product activation control';
  RAISE NOTICE '- Enhanced order tracking';
  RAISE NOTICE '- Basic security policies';
  RAISE NOTICE '- Helper functions';
  RAISE NOTICE '- Data migration completed';
END $$; 