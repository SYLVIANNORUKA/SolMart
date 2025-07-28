-- Simple Vendor Setup
-- Bypasses duplicate column issues by using a minimal approach

-- ============================================================================
-- 1. CREATE VENDOR FUNCTIONS (SAFE)
-- ============================================================================

-- Check if wallet is vendor function
CREATE OR REPLACE FUNCTION is_vendor(wallet_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE wallet_address = $1 
    AND (role = 'admin' OR role = 'vendor')
  );
END;
$$ language 'plpgsql';

-- Get vendor by wallet function
CREATE OR REPLACE FUNCTION get_vendor_by_wallet(wallet_address TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.role
  FROM public.users u
  WHERE u.wallet_address = $1;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 2. ADD ONLY ESSENTIAL COLUMNS (SAFE)
-- ============================================================================

-- Add vendor status to users (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'vendor_status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN vendor_status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added vendor_status to users table';
    ELSE
        RAISE NOTICE 'vendor_status column already exists';
    END IF;
END $$;

-- Add is_active to products (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active to products table';
    ELSE
        RAISE NOTICE 'is_active column already exists';
    END IF;
END $$;

-- Add order tracking to orders (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_wallet'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN user_wallet TEXT;
        RAISE NOTICE 'Added user_wallet to orders table';
    ELSE
        RAISE NOTICE 'user_wallet column already exists';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN total_amount NUMERIC;
        RAISE NOTICE 'Added total_amount to orders table';
    ELSE
        RAISE NOTICE 'total_amount column already exists';
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE BASIC INDEXES (SAFE)
-- ============================================================================

DO $$
BEGIN
    -- Only create indexes that don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_role') THEN
        CREATE INDEX idx_users_role ON public.users(role);
        RAISE NOTICE 'Created role index';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_seller_id') THEN
        CREATE INDEX idx_products_seller_id ON public.products(seller_id);
        RAISE NOTICE 'Created seller_id index';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_user_wallet') THEN
        CREATE INDEX idx_orders_user_wallet ON public.orders(user_wallet);
        RAISE NOTICE 'Created user_wallet index';
    END IF;
END $$;

-- ============================================================================
-- 4. ENABLE RLS (SAFE)
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE BASIC POLICIES (SAFE)
-- ============================================================================

DO $$
BEGIN
    -- Simple policies that allow all access for now
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Allow all access'
    ) THEN
        CREATE POLICY "Allow all access" ON public.products FOR ALL USING (true);
        RAISE NOTICE 'Created product policy';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Allow all access'
    ) THEN
        CREATE POLICY "Allow all access" ON public.orders FOR ALL USING (true);
        RAISE NOTICE 'Created order policy';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Allow all access'
    ) THEN
        CREATE POLICY "Allow all access" ON public.users FOR ALL USING (true);
        RAISE NOTICE 'Created user policy';
    END IF;
END $$;

-- ============================================================================
-- 6. MIGRATE EXISTING DATA (SAFE)
-- ============================================================================

-- Migrate existing order data
UPDATE public.orders 
SET user_wallet = buyer_wallet 
WHERE user_wallet IS NULL AND buyer_wallet IS NOT NULL;

UPDATE public.orders 
SET total_amount = total_price_usdc 
WHERE total_amount IS NULL AND total_price_usdc IS NOT NULL;

-- Set vendor status based on existing role
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
  RAISE NOTICE 'Simple vendor setup completed successfully!';
  RAISE NOTICE 'Features added:';
  RAISE NOTICE '- Vendor helper functions';
  RAISE NOTICE '- Essential columns (if missing)';
  RAISE NOTICE '- Basic indexes';
  RAISE NOTICE '- RLS enabled';
  RAISE NOTICE '- Basic policies';
  RAISE NOTICE '- Data migration';
  RAISE NOTICE 'Your multi-vendor system is now ready!';
END $$; 