/*
  # Fix roles and permissions structure

  1. Changes
    - Ensure roles table exists with correct structure
    - Fix profiles table structure
    - Update RLS policies
    - Fix handle_new_user function

  2. Security
    - Maintain existing permissions
    - Ensure data integrity during migration
*/

-- First, ensure the roles table exists with correct structure
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Ensure default roles exist
INSERT INTO roles (name, description, permissions)
VALUES 
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
  ])
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Update profiles table structure
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Set default role_id for existing profiles
DO $$
DECLARE
  member_role_id UUID;
BEGIN
  SELECT id INTO member_role_id FROM roles WHERE name = 'member';
  
  UPDATE profiles 
  SET role_id = member_role_id 
  WHERE role_id IS NULL;
END $$;

-- Make role_id NOT NULL
ALTER TABLE profiles
ALTER COLUMN role_id SET NOT NULL;

-- Update RLS policies
CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON roles
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
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