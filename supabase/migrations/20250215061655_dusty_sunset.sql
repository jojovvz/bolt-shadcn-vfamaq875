/*
  # Fix roles policies

  1. Changes
    - Drop all existing policies for roles table
    - Create new consolidated policies with unique names
    - Ensure proper access control

  2. Security
    - Maintain read access for all authenticated users
    - Restrict management to admins only
    - Use role_id for admin checks
*/

-- First, drop all existing policies for roles
DROP POLICY IF EXISTS "Anyone can read roles" ON roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON roles;
DROP POLICY IF EXISTS "Enable management for admins" ON roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON roles;

-- Create new consolidated policies
CREATE POLICY "roles_read_policy"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "roles_admin_policy"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );