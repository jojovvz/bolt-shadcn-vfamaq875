/*
  # Update profiles table to use role_id

  1. Changes
    - Add role_id column referencing roles table
    - Migrate existing role values to role_id references
    - Drop old role column
    - Update RLS policies

  2. Data Migration
    - Map existing role values to new role IDs
    - Preserve user role assignments
*/

-- First, add the new role_id column
ALTER TABLE profiles
ADD COLUMN role_id UUID REFERENCES roles(id);

-- Migrate existing role values to role_id references
DO $$
DECLARE
  admin_role_id UUID;
  support_role_id UUID;
  member_role_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO support_role_id FROM roles WHERE name = 'support';
  SELECT id INTO member_role_id FROM roles WHERE name = 'member';

  -- Update profiles with corresponding role_ids
  UPDATE profiles SET role_id = admin_role_id WHERE role = 'admin';
  UPDATE profiles SET role_id = support_role_id WHERE role = 'support';
  UPDATE profiles SET role_id = member_role_id WHERE role = 'member';
  
  -- Set default role_id for any remaining NULL values
  UPDATE profiles SET role_id = member_role_id WHERE role_id IS NULL;
END $$;

-- Make role_id NOT NULL after migration
ALTER TABLE profiles
ALTER COLUMN role_id SET NOT NULL;

-- Drop the old role column and its constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
DROP COLUMN role;

-- Update RLS policies for the new role_id structure
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Update the handle_new_user function to use role_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the default member role ID
  SELECT id INTO default_role_id FROM roles WHERE name = 'member';
  
  INSERT INTO public.profiles (
    id,
    full_name,
    role_id,
    created_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    default_role_id,
    now()
  );
  RETURN new;
END;
$$;