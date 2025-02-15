/*
  # Fix profiles roles migration

  1. Changes
    - Drop existing role_id column if exists
    - Create role_id column
    - Migrate data correctly
    - Set constraints

  2. Data Migration
    - Ensure roles exist before migration
    - Map existing roles to new role_id values
    - Set default role for new entries
*/

-- First ensure the roles table exists and has the default roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'member') THEN
    INSERT INTO roles (name, description, permissions) VALUES
      ('member', 'Usuário padrão do sistema', ARRAY['view_dashboard']),
      ('admin', 'Administrador do sistema com acesso total', ARRAY['view_dashboard', 'manage_users', 'manage_roles', 'manage_content', 'view_reports', 'manage_settings']),
      ('support', 'Equipe de suporte com acesso limitado', ARRAY['view_dashboard', 'view_reports', 'manage_content'])
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;

-- Drop the role_id column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE profiles DROP COLUMN role_id;
  END IF;
END $$;

-- Add the role_id column (initially nullable)
ALTER TABLE profiles
ADD COLUMN role_id UUID REFERENCES roles(id);

-- Migrate the data
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

  -- Update profiles based on the 'role' text column
  UPDATE profiles 
  SET role_id = CASE
    WHEN role = 'admin' THEN admin_role_id
    WHEN role = 'support' THEN support_role_id
    ELSE member_role_id
  END;

  -- Set default role_id for any remaining NULL values
  UPDATE profiles 
  SET role_id = member_role_id 
  WHERE role_id IS NULL;
END $$;

-- Make role_id NOT NULL after data migration
ALTER TABLE profiles
ALTER COLUMN role_id SET NOT NULL;

-- Drop the old role column
ALTER TABLE profiles
DROP COLUMN IF EXISTS role;

-- Update the handle_new_user function
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