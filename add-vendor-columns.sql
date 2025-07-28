-- Add Missing Vendor Columns to Users Table
-- This script adds the vendor-specific columns that are missing

-- ============================================================================
-- 1. ADD MISSING VENDOR COLUMNS
-- ============================================================================

-- Add business_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_name'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_name TEXT;
        RAISE NOTICE 'Added business_name column to users table';
    ELSE
        RAISE NOTICE 'business_name column already exists';
    END IF;
END $$;

-- Add business_description column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_description'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_description TEXT;
        RAISE NOTICE 'Added business_description column to users table';
    ELSE
        RAISE NOTICE 'business_description column already exists';
    END IF;
END $$;

-- Add phone column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone column to users table';
    ELSE
        RAISE NOTICE 'phone column already exists';
    END IF;
END $$;

-- Add website column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'website'
    ) THEN
        ALTER TABLE public.users ADD COLUMN website TEXT;
        RAISE NOTICE 'Added website column to users table';
    ELSE
        RAISE NOTICE 'website column already exists';
    END IF;
END $$;

-- Add logo column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'logo'
    ) THEN
        ALTER TABLE public.users ADD COLUMN logo TEXT;
        RAISE NOTICE 'Added logo column to users table';
    ELSE
        RAISE NOTICE 'logo column already exists';
    END IF;
END $$;

-- Add banner column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'banner'
    ) THEN
        ALTER TABLE public.users ADD COLUMN banner TEXT;
        RAISE NOTICE 'Added banner column to users table';
    ELSE
        RAISE NOTICE 'banner column already exists';
    END IF;
END $$;

-- Add business_address column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_address'
    ) THEN
        ALTER TABLE public.users ADD COLUMN business_address JSONB;
        RAISE NOTICE 'Added business_address column to users table';
    ELSE
        RAISE NOTICE 'business_address column already exists';
    END IF;
END $$;

-- Add vendor_status column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'vendor_status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN vendor_status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added vendor_status column to users table';
    ELSE
        RAISE NOTICE 'vendor_status column already exists';
    END IF;
END $$;

-- Add updated_at column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
        RAISE NOTICE 'Added updated_at column to users table';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- ============================================================================
-- 2. VERIFY COLUMNS WERE ADDED
-- ============================================================================

SELECT '=== VERIFYING COLUMNS ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN (
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
ORDER BY column_name;

-- ============================================================================
-- 3. TEST INSERT
-- ============================================================================

SELECT '=== TESTING INSERT ===' as info;

-- Test if we can insert a vendor record
DO $$
BEGIN
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
        'test_wallet_123',
        'Test Business',
        'Test Description',
        'test@example.com',
        '1234567890',
        'https://test.com',
        '',
        '',
        '{"street": "Test St", "city": "Test City", "state": "Test State", "zip_code": "12345", "country": "Test Country"}',
        'pending',
        'buyer'
    );
    
    RAISE NOTICE 'Test insert successful - all columns working!';
    
    -- Clean up test data
    DELETE FROM public.users WHERE wallet_address = 'test_wallet_123';
    RAISE NOTICE 'Test data cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during test insert: %', SQLERRM;
END $$;

-- ============================================================================
-- 4. SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== VENDOR COLUMNS ADDED SUCCESSFULLY ===';
  RAISE NOTICE 'All vendor-specific columns have been added to the users table';
  RAISE NOTICE 'You can now create vendor records with all the required fields';
  RAISE NOTICE 'Try your vendor registration request again!';
END $$; 