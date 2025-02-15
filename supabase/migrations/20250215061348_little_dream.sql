/*
  # Fix role dependencies

  1. Changes
    - Drop dependent RLS policies
    - Update policies to use role_id
    - Drop role column safely

  2. Security
    - Maintain access control
    - Update policies to use new role structure
*/

-- First, drop dependent policies
DROP POLICY IF EXISTS "Only admins can modify plans" ON plans;
DROP POLICY IF EXISTS "Only admins can modify subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Only admins can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON roles;

-- Create new policies using role_id
CREATE POLICY "Only admins can modify plans"
  ON plans
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Only admins can modify subscriptions"
  ON subscriptions
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Only admins can upload covers"
  ON storage.objects
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Only admins can insert roles"
  ON roles
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Only admins can update roles"
  ON roles
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Only admins can delete roles"
  ON roles
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Now we can safely drop the role column
ALTER TABLE profiles
DROP COLUMN IF EXISTS role;