/*
  # Fix RLS policies to use role_id

  1. Changes
    - Drop all policies that reference the old role column
    - Create new policies using role_id with proper joins
    - Update all admin-only policies to use the correct role check

  2. Security
    - Maintain same security level
    - Use proper role_id references
    - Ensure admin checks are consistent
*/

-- Drop all existing admin-only policies
DROP POLICY IF EXISTS "Only admins can modify plans" ON plans;
DROP POLICY IF EXISTS "Only admins can modify subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Only admins can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON roles;

-- Create new policies using role_id with proper joins
CREATE POLICY "admin_manage_plans"
  ON plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      INNER JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "admin_manage_subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      INNER JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "admin_manage_storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      INNER JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "admin_manage_roles"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      INNER JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );