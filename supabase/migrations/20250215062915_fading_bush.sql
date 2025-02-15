/*
  # Database Schema List
  
  This migration contains queries to list the complete database schema information.
  The queries will show:
  1. Tables and their columns
  2. Indexes
  3. Foreign keys
  4. RLS policies
  5. Roles and permissions
  6. Triggers and functions
*/

-- List all tables and their columns
SELECT 
  t.table_schema,
  t.table_name,
  c.column_name,
  c.data_type,
  c.column_default,
  c.is_nullable,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale,
  c.datetime_precision
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_schema = c.table_schema 
  AND t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- List all indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- List all foreign keys
SELECT
  tc.table_schema,
  tc.table_name, 
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- List all RLS policies
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  pol.polname AS policy_name,
  CASE pol.polpermissive
    WHEN TRUE THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END AS permissive,
  CASE pol.polroles = '{0}'
    WHEN TRUE THEN 'PUBLIC'
    ELSE array_to_string(ARRAY(
      SELECT rolname
      FROM pg_roles
      WHERE oid = ANY(pol.polroles)
    ), ',')
  END AS roles,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
ORDER BY n.nspname, c.relname, pol.polname;

-- List all roles and their permissions
SELECT 
  r.rolname,
  r.rolsuper,
  r.rolinherit,
  r.rolcreaterole,
  r.rolcreatedb,
  r.rolcanlogin,
  r.rolreplication,
  r.rolconnlimit,
  r.rolvaliduntil,
  ARRAY(
    SELECT b.rolname
    FROM pg_catalog.pg_auth_members m
    JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
    WHERE m.member = r.oid
  ) as member_of,
  ARRAY(
    SELECT b.rolname
    FROM pg_catalog.pg_auth_members m
    JOIN pg_catalog.pg_roles b ON (m.member = b.oid)
    WHERE m.roleid = r.oid
  ) as members
FROM pg_catalog.pg_roles r
WHERE r.rolname !~ '^pg_'
ORDER BY 1;

-- List all triggers
SELECT 
  tgname AS trigger_name,
  relname AS table_name,
  proname AS function_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
  END AS status,
  pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND tgname NOT LIKE 'pg_%'
ORDER BY relname, tgname;

-- List all functions
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  l.lanname AS language,
  CASE p.prokind
    WHEN 'f' THEN 'function'
    WHEN 'p' THEN 'procedure'
    WHEN 'a' THEN 'aggregate'
    WHEN 'w' THEN 'window'
  END AS kind,
  pg_get_functiondef(p.oid) AS definition,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    WHEN 'v' THEN 'VOLATILE'
  END AS volatility,
  p.prosecdef AS security_definer,
  p.proleakproof AS leakproof,
  p.proisstrict AS strict,
  p.proretset AS returns_set,
  p.proparallel AS parallel
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
ORDER BY schema_name, function_name;