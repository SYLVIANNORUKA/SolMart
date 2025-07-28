-- Fix Users Table Constraints
-- This script ensures the users table has proper primary key and unique constraints

-- 1. First, let's see the current state of the users table
SELECT '=== CURRENT USERS TABLE STRUCTURE ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check current constraints on users table
SELECT '=== CURRENT USER CONSTRAINTS ===' as info;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. Check if id column exists and has proper data type
SELECT '=== ID COLUMN CHECK ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- 4. Fix the users table step by step
DO $$
DECLARE
    constraint_rec RECORD;
    column_exists BOOLEAN;
    pk_exists BOOLEAN;
BEGIN
    -- Check if id column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE EXCEPTION 'ID column does not exist in users table';
    END IF;
    
    -- Check if primary key exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
    ) INTO pk_exists;
    
    -- Drop all existing primary key constraints first
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
    LOOP
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || constraint_rec.constraint_name;
        RAISE NOTICE 'Dropped primary key constraint: %', constraint_rec.constraint_name;
    END LOOP;
    
    -- Ensure id column is NOT NULL
    ALTER TABLE public.users ALTER COLUMN id SET NOT NULL;
    RAISE NOTICE 'Set id column to NOT NULL';
    
    -- Add proper primary key constraint
    ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    RAISE NOTICE 'Added primary key constraint on id column';
    
    -- Ensure id has proper default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id' 
        AND column_default LIKE '%gen_random_uuid%'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();
        RAISE NOTICE 'Set default value for id column';
    END IF;
    
    RAISE NOTICE 'Users table constraints fixed successfully!';
END $$;

-- 5. Verify the fix
SELECT '=== AFTER FIX - USER CONSTRAINTS ===' as info;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 6. Check id column properties
SELECT '=== ID COLUMN PROPERTIES ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- 7. Now try to recreate the foreign key
SELECT '=== RECREATING FOREIGN KEY ===' as info;

DO $$
BEGIN
    -- Drop existing foreign key if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_name = 'products_seller_id_fkey'
    ) THEN
        ALTER TABLE public.products DROP CONSTRAINT products_seller_id_fkey;
        RAISE NOTICE 'Dropped existing products_seller_id_fkey';
    END IF;
    
    -- Recreate the foreign key
    ALTER TABLE public.products 
    ADD CONSTRAINT products_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES public.users(id);
    
    RAISE NOTICE 'Successfully recreated products_seller_id_fkey';
END $$;

-- 8. Final verification
SELECT '=== FINAL VERIFICATION ===' as info;

SELECT 
  table_name,
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('orders', 'products', 'users')
ORDER BY table_name, constraint_type, constraint_name; 