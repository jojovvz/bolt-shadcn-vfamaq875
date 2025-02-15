/*
  # Fix RLS policies

  1. Changes
    - Drop all existing admin-only policies
    - Create new consolidated policies using role_id
    - Use INNER JOIN for better performance
    - Ensure consistent policy naming

  2. Security
    - Maintain same security level
    - Use proper role_id references
    - Ensure admin checks are consistent
*/

-- Drop all existing admin-only policies
DROP POLICY IF EXISTS "admin_manage_plans" ON plans;
DROP POLICY IF EXISTS "admin_manage_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "admin_manage_storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_roles" ON roles;
DROP POLICY IF EXISTS "roles_admin_policy" ON roles;
DROP POLICY IF EXISTS "roles_read_policy" ON roles;

-- Create new consolidated policies
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
      INNER JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "plans_admin_policy"
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

CREATE POLICY "subscriptions_admin_policy"
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

CREATE POLICY "storage_admin_policy"
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