-- Safe Multi-Vendor Setup for SolMart
-- This script safely adapts to your existing table structure

-- 1. Check and add columns safely

-- Products table updates
DO $$
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
    END IF;
    
    -- Add vendor_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'vendor_name'
    ) THEN
        ALTER TABLE public.products ADD COLUMN vendor_name TEXT;
    END IF;
END $$;

-- Orders table updates
DO $$
BEGIN
    -- Add new columns to orders table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_wallet'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN user_wallet TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_email'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN user_email TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'items'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN total_amount NUMERIC;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'transaction_signature'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN transaction_signature TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'estimated_delivery'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN estimated_delivery TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN shipping_address JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'vendor_orders'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN vendor_orders JSONB DEFAULT '[]';
    END IF;
END $$;

-- Users table updates
DO $$
BEGIN
    -- Add vendor-related columns to users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_name'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_description'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_description TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'website'
    ) THEN
        ALTER TABLE public.users ADD COLUMN website TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'logo'
    ) THEN
        ALTER TABLE public.users ADD COLUMN logo TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'banner'
    ) THEN
        ALTER TABLE public.users ADD COLUMN banner TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_address'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_address JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'vendor_status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN vendor_status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
    END IF;
END $$;

-- 2. Create indexes safely
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
END $$;

-- 3. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create basic RLS policies (simplified)
DO $$
BEGIN
    -- Products policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Allow all product access'
    ) THEN
        CREATE POLICY "Allow all product access" ON public.products FOR ALL USING (true);
    END IF;
    
    -- Orders policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Allow all order access'
    ) THEN
        CREATE POLICY "Allow all order access" ON public.orders FOR ALL USING (true);
    END IF;
    
    -- Users policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Allow all user access'
    ) THEN
        CREATE POLICY "Allow all user access" ON public.users FOR ALL USING (true);
    END IF;
END $$;

-- 5. Create helper functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers
DO $$
BEGIN
    -- Products trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at'
    ) THEN
        CREATE TRIGGER update_products_updated_at 
          BEFORE UPDATE ON public.products 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Orders trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at'
    ) THEN
        CREATE TRIGGER update_orders_updated_at 
          BEFORE UPDATE ON public.orders 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Users trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON public.users 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Create view for products with vendor info
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

-- 8. Migrate existing data
UPDATE public.orders 
SET user_wallet = buyer_wallet 
WHERE user_wallet IS NULL AND buyer_wallet IS NOT NULL;

UPDATE public.orders 
SET total_amount = total_price_usdc 
WHERE total_amount IS NULL AND total_price_usdc IS NOT NULL;

UPDATE public.products p
SET vendor_name = u.business_name
FROM public.users u
WHERE p.seller_id = u.id AND p.vendor_name IS NULL;

UPDATE public.users 
SET vendor_status = 'approved' 
WHERE vendor_status IS NULL AND role = 'admin';

UPDATE public.users 
SET vendor_status = 'pending' 
WHERE vendor_status IS NULL AND role = 'buyer';

-- 9. Success message
DO $$
BEGIN
  RAISE NOTICE 'Safe multi-vendor setup completed successfully!';
  RAISE NOTICE 'All existing data preserved';
  RAISE NOTICE 'New columns added safely';
  RAISE NOTICE 'Indexes and triggers created';
END $$; 