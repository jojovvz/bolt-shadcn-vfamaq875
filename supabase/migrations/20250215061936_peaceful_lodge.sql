/*
  # Fix roles integration

  1. Changes
    - Drop existing policies
    - Recreate roles table with proper structure
    - Update profiles table to use role_id
    - Create proper RLS policies
    - Add default roles

  2. Security
    - Maintain proper access control
    - Ensure data integrity
    - Set up proper relationships
*/

-- Drop existing policies
DROP POLICY IF EXISTS "roles_select_policy" ON roles;
DROP POLICY IF EXISTS "roles_admin_policy" ON roles;
DROP POLICY IF EXISTS "plans_admin_policy" ON plans;
DROP POLICY IF EXISTS "subscriptions_admin_policy" ON subscriptions;
DROP POLICY IF EXISTS "storage_admin_policy" ON storage.objects;

-- Recreate roles table
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Administrador do sistema com acesso total', ARRAY[
    'view_dashboard',
    'manage_users',
    'manage_roles',
    'manage_content',
    'view_reports',
    'manage_settings',
    'manage_plans'
  ]),
  ('support', 'Equipe de suporte com acesso limitado', ARRAY[
    'view_dashboard',
    'view_reports',
    'manage_content'
  ]),
  ('member', 'Usuário padrão do sistema', ARRAY[
    'view_dashboard'
  ]);

-- Update profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS role_id CASCADE;

ALTER TABLE profiles
ADD COLUMN role_id UUID REFERENCES roles(id);

-- Set default role for existing profiles
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'member')
WHERE role_id IS NULL;

ALTER TABLE profiles
ALTER COLUMN role_id SET NOT NULL;

-- Create RLS policies
CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role_id = (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
BEGIN
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