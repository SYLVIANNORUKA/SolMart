-- Safe Fix for Duplicate Constraints
-- This script handles foreign key dependencies properly

-- 1. First, let's see all the constraints and their dependencies
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

-- 2. Check for foreign key dependencies
SELECT '=== FOREIGN KEY DEPENDENCIES ===' as info;

SELECT 
  tc.table_name as dependent_table,
  tc.constraint_name as foreign_key_name,
  kcu.column_name as foreign_key_column,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users';

-- 3. Safe approach: Drop foreign keys first, then fix primary keys, then recreate foreign keys
DO $$
DECLARE
    fk_rec RECORD;
    pk_rec RECORD;
    constraint_count INTEGER := 0;
BEGIN
    -- Step 1: Temporarily drop foreign keys that reference users table
    RAISE NOTICE 'Dropping foreign key constraints that reference users table...';
    
    FOR fk_rec IN 
        SELECT 
            tc.table_name,
            tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'users'
    LOOP
        EXECUTE 'ALTER TABLE public.' || fk_rec.table_name || ' DROP CONSTRAINT ' || fk_rec.constraint_name;
        RAISE NOTICE 'Dropped foreign key: % on table %', fk_rec.constraint_name, fk_rec.table_name;
    END LOOP;
    
    -- Step 2: Count primary key constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY';
    
    RAISE NOTICE 'Found % primary key constraints on users table', constraint_count;
    
    -- Step 3: If there are multiple primary key constraints, drop the duplicates
    IF constraint_count > 1 THEN
        -- Drop all primary key constraints except the first one
        FOR pk_rec IN 
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
            ORDER BY constraint_name
            OFFSET 1
        LOOP
            EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || pk_rec.constraint_name;
            RAISE NOTICE 'Dropped duplicate primary key constraint: %', pk_rec.constraint_name;
        END LOOP;
    END IF;
    
    -- Step 4: Ensure we have exactly one primary key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
        RAISE NOTICE 'Recreated primary key constraint on users table';
    END IF;
    
    -- Step 5: Recreate foreign key constraints
    RAISE NOTICE 'Recreating foreign key constraints...';
    
    -- Recreate products_seller_id_fkey
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_name = 'products_seller_id_fkey'
    ) THEN
        ALTER TABLE public.products 
        ADD CONSTRAINT products_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES public.users(id);
        RAISE NOTICE 'Recreated foreign key: products_seller_id_fkey';
    END IF;
    
    RAISE NOTICE 'Constraint fix completed successfully!';
END $$;

-- 4. Verify the fix
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

-- 5. Verify foreign keys are restored
SELECT '=== FOREIGN KEYS RESTORED ===' as info;

SELECT 
  tc.table_name as dependent_table,
  tc.constraint_name as foreign_key_name,
  kcu.column_name as foreign_key_column,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users';

-- 6. Final verification
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