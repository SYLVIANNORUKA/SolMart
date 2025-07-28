-- Fix Duplicate Constraints Script
-- This script removes duplicate primary key constraints

-- 1. First, let's see all the constraints on the users table
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

-- 2. Drop duplicate primary key constraints
-- Keep only the first one, drop the others
DO $$
DECLARE
    constraint_rec RECORD;
    constraint_count INTEGER := 0;
BEGIN
    -- Count how many primary key constraints exist
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY';
    
    RAISE NOTICE 'Found % primary key constraints on users table', constraint_count;
    
    -- If there are multiple primary key constraints, drop the duplicates
    IF constraint_count > 1 THEN
        -- Drop all primary key constraints except the first one
        FOR constraint_rec IN 
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
            ORDER BY constraint_name
            OFFSET 1
        LOOP
            EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || constraint_rec.constraint_name;
            RAISE NOTICE 'Dropped duplicate primary key constraint: %', constraint_rec.constraint_name;
        END LOOP;
    END IF;
END $$;

-- 3. Verify the fix
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

-- 4. Check if we need to recreate the primary key
DO $$
BEGIN
    -- Check if primary key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        -- Recreate primary key if it doesn't exist
        ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
        RAISE NOTICE 'Recreated primary key constraint on users table';
    END IF;
END $$;

-- 5. Final verification
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