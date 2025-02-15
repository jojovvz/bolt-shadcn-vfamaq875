/*
  # Add roles table and update profiles structure

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `permissions` (text[])
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `roles` table
    - Add policies for authenticated users to read roles
    - Add policies for admins to manage roles
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete roles"
  ON roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Administrador do sistema com acesso total', ARRAY[
    'view_dashboard',
    'manage_users',
    'manage_roles',
    'manage_content',
    'view_reports',
    'manage_settings'
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