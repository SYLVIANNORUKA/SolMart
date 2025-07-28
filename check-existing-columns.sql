-- Check Existing Columns Script
-- Run this to see what columns already exist

-- Check users table columns
SELECT '=== USERS TABLE COLUMNS ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check products table columns
SELECT '=== PRODUCTS TABLE COLUMNS ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Check orders table columns
SELECT '=== ORDERS TABLE COLUMNS ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check for duplicate columns
SELECT '=== CHECKING FOR DUPLICATE COLUMNS ===' as info;

SELECT 
  table_name,
  column_name,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_name IN ('users', 'products', 'orders')
GROUP BY table_name, column_name
HAVING COUNT(*) > 1; 