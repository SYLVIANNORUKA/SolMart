-- Fix products table by adding all missing columns
-- This script adds all the columns that the ProductService expects

-- Add missing columns to products table
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

-- Update existing products to have default values
UPDATE public.products 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE public.products 
SET stock_quantity = 0 
WHERE stock_quantity IS NULL;

-- Populate vendor_name from users table if it exists
UPDATE public.products 
SET vendor_name = users.business_name
FROM public.users 
WHERE products.seller_id = users.id 
  AND products.vendor_name IS NULL 
  AND users.business_name IS NOT NULL;

-- Verify all columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position; 