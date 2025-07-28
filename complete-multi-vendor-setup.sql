-- Complete Multi-Vendor Setup for SolMart
-- This script adapts to your existing table structure and adds new features

-- 1. Update existing tables to support multi-vendor features

-- Update products table to add vendor-specific fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();

-- Only add vendor_name if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'vendor_name'
    ) THEN
        ALTER TABLE public.products ADD COLUMN vendor_name TEXT;
    END IF;
END $$;

-- Update orders table to support multi-vendor orders
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
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();

-- Only add vendor_orders if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'vendor_orders'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN vendor_orders JSONB DEFAULT '[]';
    END IF;
END $$;

-- Update users table to support vendor roles
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS banner TEXT,
ADD COLUMN IF NOT EXISTS business_address JSONB,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();

-- Only add vendor_status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'vendor_status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN vendor_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- 2. Create indexes for better performance (only if they don't exist)
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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for products (only if they don't exist)
DO $$
BEGIN
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
END $$;

-- 5. Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    user_wallet = auth.jwt() ->> 'wallet_address' OR
    buyer_wallet = auth.jwt() ->> 'wallet_address'
  );

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (
    user_wallet = auth.jwt() ->> 'wallet_address' OR
    buyer_wallet = auth.jwt() ->> 'wallet_address'
  );

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address' 
      AND role = 'admin'
    )
  );

-- 6. Create RLS policies for users (vendors)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (
    wallet_address = auth.jwt() ->> 'wallet_address'
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (
    wallet_address = auth.jwt() ->> 'wallet_address'
  );

CREATE POLICY "Anyone can view approved vendors" ON public.users
  FOR SELECT USING (
    vendor_status = 'approved' OR role = 'admin'
  );

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address' 
      AND role = 'admin'
    )
  );

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers to automatically update updated_at
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

-- 9. Create function to validate vendor status before product operations
CREATE OR REPLACE FUNCTION validate_vendor_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if vendor is approved before allowing product operations
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = NEW.seller_id AND (vendor_status = 'approved' OR role = 'admin')
  ) THEN
    RAISE EXCEPTION 'Vendor must be approved to create products';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger to validate vendor status
CREATE TRIGGER validate_vendor_status_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION validate_vendor_status();

-- 11. Create view for products with vendor information
CREATE OR REPLACE VIEW products_with_vendors AS
SELECT 
  p.*,
  u.business_name as vendor_name,
  u.wallet_address as vendor_wallet,
  u.vendor_status,
  u.role
FROM public.products p
JOIN public.users u ON p.seller_id = u.id
WHERE (u.vendor_status = 'approved' OR u.role = 'admin') AND p.is_active = true;

-- 12. Create function to get vendor statistics
CREATE OR REPLACE FUNCTION get_vendor_stats(vendor_id UUID)
RETURNS TABLE (
  total_products INTEGER,
  active_products INTEGER,
  total_revenue NUMERIC,
  total_orders INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(p.id)::INTEGER as total_products,
    COUNT(CASE WHEN p.is_active THEN 1 END)::INTEGER as active_products,
    COALESCE(SUM(
      CASE 
        WHEN o.status = 'delivered' THEN o.total_price_usdc
        ELSE 0 
      END
    ), 0) as total_revenue,
    COUNT(DISTINCT o.id)::INTEGER as total_orders
  FROM public.products p
  LEFT JOIN public.orders o ON o.product_id = p.id
  WHERE p.seller_id = vendor_id;
END;
$$ LANGUAGE plpgsql;

-- 13. Create function to migrate existing data to new structure
CREATE OR REPLACE FUNCTION migrate_existing_data()
RETURNS VOID AS $$
BEGIN
  -- Update existing orders to include user_wallet from buyer_wallet
  UPDATE public.orders 
  SET user_wallet = buyer_wallet 
  WHERE user_wallet IS NULL AND buyer_wallet IS NOT NULL;
  
  -- Update existing orders to include total_amount from total_price_usdc
  UPDATE public.orders 
  SET total_amount = total_price_usdc 
  WHERE total_amount IS NULL AND total_price_usdc IS NOT NULL;
  
  -- Update existing products to include vendor_name
  UPDATE public.products p
  SET vendor_name = u.business_name
  FROM public.users u
  WHERE p.seller_id = u.id AND p.vendor_name IS NULL;
  
  -- Set default vendor_status for existing users
  UPDATE public.users 
  SET vendor_status = 'approved' 
  WHERE vendor_status IS NULL AND role = 'admin';
  
  UPDATE public.users 
  SET vendor_status = 'pending' 
  WHERE vendor_status IS NULL AND role = 'buyer';
END;
$$ LANGUAGE plpgsql;

-- 14. Execute migration function
SELECT migrate_existing_data();

-- 15. Create helper functions for the application

-- Function to check if user is a vendor
CREATE OR REPLACE FUNCTION is_vendor(wallet_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE wallet_address = $1 AND vendor_status = 'approved'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get vendor by wallet
CREATE OR REPLACE FUNCTION get_vendor_by_wallet(wallet_address TEXT)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  business_description TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo TEXT,
  banner TEXT,
  business_address JSONB,
  vendor_status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.business_name,
    u.business_description,
    u.email,
    u.phone,
    u.website,
    u.logo,
    u.banner,
    u.business_address,
    u.vendor_status,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.wallet_address = $1;
END;
$$ LANGUAGE plpgsql;

-- Function to get approved vendors
CREATE OR REPLACE FUNCTION get_approved_vendors()
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  business_description TEXT,
  email TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.business_name,
    u.business_description,
    u.email,
    u.wallet_address,
    u.created_at
  FROM public.users u
  WHERE u.vendor_status = 'approved'
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 16. Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_products_vendor_name ON public.products(vendor_name);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_signature ON public.orders(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_users_business_name ON public.users(business_name);

-- 17. Add constraints for data integrity
ALTER TABLE public.users 
ADD CONSTRAINT check_vendor_status 
CHECK (vendor_status IN ('pending', 'approved', 'rejected', 'suspended'));

ALTER TABLE public.orders 
ADD CONSTRAINT check_order_status 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

-- 18. Create a function to update product vendor information
CREATE OR REPLACE FUNCTION update_product_vendor_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vendor_name when seller_id changes
  IF NEW.seller_id IS NOT NULL THEN
    SELECT business_name INTO NEW.vendor_name
    FROM public.users
    WHERE id = NEW.seller_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 19. Create trigger to update vendor information
CREATE TRIGGER update_product_vendor_info_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_vendor_info();

-- 20. Final cleanup and verification
-- Remove the migration function as it's no longer needed
DROP FUNCTION IF EXISTS migrate_existing_data();

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Multi-vendor setup completed successfully!';
  RAISE NOTICE 'Tables updated: products, orders, users';
  RAISE NOTICE 'Policies created: RLS enabled for all tables';
  RAISE NOTICE 'Functions created: vendor validation, statistics, helpers';
  RAISE NOTICE 'Views created: products_with_vendors';
  RAISE NOTICE 'Indexes created: performance optimized';
END $$; 