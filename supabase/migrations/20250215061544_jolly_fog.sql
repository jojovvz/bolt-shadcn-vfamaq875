/*
  # Fix duplicate roles policy

  1. Changes
    - Drop duplicate policy
    - Recreate policy with correct name
    - Ensure unique policy names

  2. Security
    - Maintain existing permissions
    - Ensure data integrity
*/

-- First, drop all existing read policies for roles
DROP POLICY IF EXISTS "Anyone can read roles" ON roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON roles;

-- Create new policies with unique names
CREATE POLICY "Enable read access for all authenticated users"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable management for admins"
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