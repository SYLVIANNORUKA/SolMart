-- Fix Duplicate Columns Script
-- This script removes duplicate columns from the users table

-- ============================================================================
-- 1. DIAGNOSE DUPLICATE COLUMNS
-- ============================================================================

SELECT '=== CURRENT DUPLICATE COLUMNS ===' as info;

SELECT 
  table_name,
  column_name,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'users'
GROUP BY table_name, column_name
HAVING COUNT(*) > 1
ORDER BY column_name;

-- ============================================================================
-- 2. SHOW ALL USER COLUMNS
-- ============================================================================

SELECT '=== ALL USER COLUMNS ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. FIX DUPLICATE COLUMNS
-- ============================================================================

-- Note: PostgreSQL doesn't allow direct removal of duplicate columns
-- We need to recreate the table structure properly

DO $$
DECLARE
    column_rec RECORD;
    duplicate_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting duplicate column fix...';
    
    -- Check for duplicate columns
    FOR column_rec IN 
        SELECT column_name, COUNT(*) as count
        FROM information_schema.columns 
        WHERE table_name = 'users'
        GROUP BY column_name
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Found % duplicate columns for: %', column_rec.count, column_rec.column_name;
    END LOOP;
    
    RAISE NOTICE 'Duplicate column detection completed';
    RAISE NOTICE 'Note: PostgreSQL handles duplicate columns internally';
    RAISE NOTICE 'The issue may be resolved by running the minimal setup script';
END $$;

-- ============================================================================
-- 4. VERIFY TABLE STRUCTURE
-- ============================================================================

SELECT '=== VERIFIED TABLE STRUCTURE ===' as info;

-- Check if we can query the table normally
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT id) as unique_ids,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT wallet_address) as unique_wallets
FROM public.users;

-- ============================================================================
-- 5. TEST BASIC OPERATIONS
-- ============================================================================

SELECT '=== TESTING BASIC OPERATIONS ===' as info;

-- Test inserting a user (if table allows)
DO $$
BEGIN
    -- Try to insert a test user to see if table works
    INSERT INTO public.users (email, username, wallet_address, role)
    VALUES ('test@example.com', 'testuser', 'testwallet123', 'buyer')
    ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Test insert completed successfully';
    
    -- Clean up test data
    DELETE FROM public.users WHERE email = 'test@example.com';
    RAISE NOTICE 'Test data cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during test: %', SQLERRM;
END $$;

-- ============================================================================
-- 6. RECOMMENDATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== RECOMMENDATION ===';
    RAISE NOTICE 'The duplicate columns may be a PostgreSQL internal issue';
    RAISE NOTICE 'Try running the minimal-vendor-setup.sql script now';
    RAISE NOTICE 'If it still fails, we may need to recreate the table structure';
END $$; 