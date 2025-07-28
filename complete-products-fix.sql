-- Complete fix for products table column mismatches
-- This handles the difference between your schema and the code expectations

-- 1. Add missing columns that the code expects
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- 2. Copy data from existing columns to new columns
-- Copy price_usdc to price
UPDATE public.products 
SET price = price_usdc 
WHERE price IS NULL AND price_usdc IS NOT NULL;

-- Copy image_url to image if image is empty
UPDATE public.products 
SET image = image_url 
WHERE image IS NULL AND image_url IS NOT NULL;

-- Copy image to image_url if image_url is empty
UPDATE public.products 
SET image_url = image 
WHERE image_url IS NULL AND image IS NOT NULL;

-- 3. Set default values for null columns
UPDATE public.products 
SET price = 0 
WHERE price IS NULL;

UPDATE public.products 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE public.products 
SET stock_quantity = 0 
WHERE stock_quantity IS NULL;

-- 4. Populate vendor_name from users table
UPDATE public.products 
SET vendor_name = users.business_name
FROM public.users 
WHERE products.seller_id = users.id 
  AND products.vendor_name IS NULL 
  AND users.business_name IS NOT NULL;

-- 5. Create trigger for updated_at
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

-- 6. Show the final schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 7. Show sample data to verify
SELECT 
  id,
  name,
  price,
  price_usdc,
  image,
  image_url,
  is_active,
  stock_quantity,
  vendor_name
FROM public.products 
LIMIT 5; 