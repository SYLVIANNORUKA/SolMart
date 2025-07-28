-- Fix price column issue in products table
-- Your table has 'price_usdc' but the code expects 'price'

-- Add price column (the code expects this)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Copy data from price_usdc to price if price_usdc exists
UPDATE public.products 
SET price = price_usdc 
WHERE price IS NULL AND price_usdc IS NOT NULL;

-- Set default value for price if it's still null
UPDATE public.products 
SET price = 0 
WHERE price IS NULL;

-- Also add other potentially missing columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('price', 'price_usdc', 'image', 'is_active', 'stock_quantity')
ORDER BY column_name; 