-- Add missing image column to products table
-- This script adds the image column that's referenced in the ProductService

-- Add image column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image_url column as well (in case the code expects both)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing products to have a default image if needed
UPDATE public.products 
SET image = image_url 
WHERE image IS NULL AND image_url IS NOT NULL;

UPDATE public.products 
SET image_url = image 
WHERE image_url IS NULL AND image IS NOT NULL;

-- Verify the columns exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('image', 'image_url')
ORDER BY column_name; 