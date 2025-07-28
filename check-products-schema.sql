-- Check current products table schema
-- This will help identify any missing columns

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') 
    THEN 'image column EXISTS' 
    ELSE 'image column MISSING' 
  END as image_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') 
    THEN 'image_url column EXISTS' 
    ELSE 'image_url column MISSING' 
  END as image_url_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') 
    THEN 'is_active column EXISTS' 
    ELSE 'is_active column MISSING' 
  END as is_active_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') 
    THEN 'stock_quantity column EXISTS' 
    ELSE 'stock_quantity column MISSING' 
  END as stock_quantity_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'vendor_name') 
    THEN 'vendor_name column EXISTS' 
    ELSE 'vendor_name column MISSING' 
  END as vendor_name_status; 