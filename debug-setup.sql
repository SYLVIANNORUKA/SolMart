-- Debug Setup Script for SolMart
-- Run this to check your current database state

-- 1. Check current table structure
SELECT '=== CURRENT TABLE STRUCTURE ===' as info;

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('orders', 'products', 'users')
ORDER BY table_name, ordinal_position;

-- 2. Check for duplicate columns
SELECT '=== CHECKING FOR DUPLICATE COLUMNS ===' as info;

SELECT 
  table_name,
  column_name,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_name IN ('orders', 'products', 'users')
GROUP BY table_name, column_name
HAVING COUNT(*) > 1;

-- 3. Check existing indexes
SELECT '=== EXISTING INDEXES ===' as info;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('orders', 'products', 'users')
ORDER BY tablename, indexname;

-- 4. Check existing policies
SELECT '=== EXISTING POLICIES ===' as info;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'products', 'users')
ORDER BY tablename, policyname;

-- 5. Check RLS status
SELECT '=== RLS STATUS ===' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('orders', 'products', 'users')
ORDER BY tablename;

-- 6. Sample data check
SELECT '=== SAMPLE DATA ===' as info;

SELECT 'Products:' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Orders:' as table_name, COUNT(*) as count FROM orders  
UNION ALL
SELECT 'Users:' as table_name, COUNT(*) as count FROM users;

-- 7. Check for any constraints that might conflict
SELECT '=== CONSTRAINTS ===' as info;

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('orders', 'products', 'users')
ORDER BY tc.table_name, tc.constraint_name; 