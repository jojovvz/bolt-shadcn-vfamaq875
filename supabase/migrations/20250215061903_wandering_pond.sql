/*
  # Fix RLS policies to use role instead of role_id

  1. Changes
    - Drop existing policies that use role_id
    - Create new policies using role column
    - Ensure consistent policy naming
    - Fix admin checks

  2. Security
    - Maintain same security level
    - Use proper role references
    - Ensure admin checks are consistent
*/

-- Drop existing policies
DROP POLICY IF EXISTS "roles_select_policy" ON roles;
DROP POLICY IF EXISTS "roles_admin_policy" ON roles;
DROP POLICY IF EXISTS "plans_admin_policy" ON plans;
DROP POLICY IF EXISTS "subscriptions_admin_policy" ON subscriptions;
DROP POLICY IF EXISTS "storage_admin_policy" ON storage.objects;

-- Create new policies using role
CREATE POLICY "roles_select_policy"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "roles_admin_policy"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "plans_admin_policy"
  ON plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "subscriptions_admin_policy"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "storage_admin_policy"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );