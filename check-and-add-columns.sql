-- Check and Add Missing Columns
-- This script checks what columns exist and adds the missing ones

-- ============================================================================
-- 1. CHECK CURRENT COLUMNS
-- ============================================================================

SELECT '=== CURRENT USER COLUMNS ===' as info;

SELECT 
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_name = 'users'
ORDER BY c.ordinal_position;

-- ============================================================================
-- 2. CHECK SPECIFIC VENDOR COLUMNS
-- ============================================================================

SELECT '=== CHECKING VENDOR COLUMNS ===' as info;

SELECT 
  required_columns.column_name,
  CASE 
    WHEN c.column_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM (
  SELECT 'business_name' as column_name
  UNION ALL SELECT 'business_description'
  UNION ALL SELECT 'phone'
  UNION ALL SELECT 'website'
  UNION ALL SELECT 'logo'
  UNION ALL SELECT 'banner'
  UNION ALL SELECT 'business_address'
  UNION ALL SELECT 'vendor_status'
  UNION ALL SELECT 'updated_at'
) required_columns
LEFT JOIN information_schema.columns c 
  ON c.table_name = 'users' 
  AND c.column_name = required_columns.column_name
ORDER BY required_columns.column_name;

-- ============================================================================
-- 3. ADD MISSING COLUMNS DIRECTLY
-- ============================================================================

-- Add business_name
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Add business_description
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_description TEXT;

-- Add phone
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add website
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website TEXT;

-- Add logo
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS logo TEXT;

-- Add banner
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner TEXT;

-- Add business_address
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_address JSONB;

-- Add vendor_status
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'pending';

-- Add updated_at
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();

-- ============================================================================
-- 4. VERIFY COLUMNS WERE ADDED
-- ============================================================================

SELECT '=== VERIFYING COLUMNS AFTER ADDING ===' as info;

SELECT 
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_name = 'users' 
  AND c.column_name IN (
    'business_name', 
    'business_description', 
    'phone', 
    'website', 
    'logo', 
    'banner', 
    'business_address', 
    'vendor_status', 
    'updated_at'
  )
ORDER BY c.column_name;

-- ============================================================================
-- 5. TEST INSERT WITH ALL COLUMNS
-- ============================================================================

SELECT '=== TESTING INSERT ===' as info;

DO $$
BEGIN
    -- Test insert with all vendor columns
    INSERT INTO public.users (
        wallet_address,
        business_name,
        business_description,
        email,
        phone,
        website,
        logo,
        banner,
        business_address,
        vendor_status,
        role
    ) VALUES (
        'test_wallet_' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'Test Business',
        'Test Description',
        'test' || EXTRACT(EPOCH FROM NOW())::TEXT || '@example.com',
        '1234567890',
        'https://test.com',
        '',
        '',
        '{"street": "Test St", "city": "Test City", "state": "Test State", "zip_code": "12345", "country": "Test Country"}',
        'pending',
        'buyer'
    );
    
    RAISE NOTICE 'Test insert successful - all vendor columns working!';
    
    -- Clean up test data
    DELETE FROM public.users WHERE wallet_address LIKE 'test_wallet_%';
    RAISE NOTICE 'Test data cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during test insert: %', SQLERRM;
        RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;

-- ============================================================================
-- 6. SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== COLUMN ADDITION COMPLETED ===';
  RAISE NOTICE 'All vendor columns have been added to the users table';
  RAISE NOTICE 'Try your vendor registration request again!';
  RAISE NOTICE 'If you still get errors, try refreshing your Supabase dashboard';
END $$; 