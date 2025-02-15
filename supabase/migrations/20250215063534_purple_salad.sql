/*
  # Fix Roles and Permissions System

  This migration:
  1. Ensures proper role-plan relationships
  2. Fixes missing indexes
  3. Updates RLS policies
  4. Adds missing constraints
  5. Updates functions to handle roles correctly
*/

-- Drop existing policies that need to be updated
DROP POLICY IF EXISTS "roles_read_policy" ON roles;
DROP POLICY IF EXISTS "roles_write_policy" ON roles;

-- Create new policies for roles table
CREATE POLICY "roles_read_policy"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "roles_write_policy"
  ON roles FOR ALL
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- Add missing constraints
ALTER TABLE profiles
ALTER COLUMN updated_at SET DEFAULT now();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Update handle_new_user function to better handle roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
  default_plan_id UUID;
  admin_role_id UUID;
BEGIN
  -- Get the default member role ID
  SELECT id INTO default_role_id 
  FROM roles 
  WHERE name = 'member';

  -- Get the admin role ID
  SELECT id INTO admin_role_id 
  FROM roles 
  WHERE name = 'admin';

  -- Get the default free plan ID
  SELECT id INTO default_plan_id 
  FROM plans 
  WHERE name = 'Free';

  -- If no default role found, raise an error
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'Default member role not found';
  END IF;

  -- Create the profile
  INSERT INTO public.profiles (
    id,
    full_name,
    role_id,
    plan_id,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    CASE 
      WHEN new.raw_user_meta_data->>'is_admin' = 'true' THEN admin_role_id
      ELSE default_role_id
    END,
    COALESCE(default_plan_id, (SELECT id FROM plans WHERE name = 'Free' LIMIT 1)),
    now(),
    now()
  );

  RETURN new;
END;
$$;

-- Ensure all profiles have a role_id
UPDATE profiles p
SET role_id = (SELECT id FROM roles WHERE name = 'member')
WHERE role_id IS NULL;

-- Ensure all profiles have a plan_id
UPDATE profiles p
SET plan_id = (SELECT id FROM plans WHERE name = 'Free')
WHERE plan_id IS NULL;

-- Add NOT NULL constraints after fixing data
ALTER TABLE profiles
ALTER COLUMN role_id SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;