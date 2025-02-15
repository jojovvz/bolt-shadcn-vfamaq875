/*
  # Fix roles policies and plans relationships

  1. Changes
    - Fix infinite recursion in roles policies
    - Add proper relationship between profiles and plans
    - Update existing policies to use role_id correctly
    - Add missing indexes for performance

  2. Security
    - Maintain proper access control
    - Ensure data integrity
*/

-- First, drop problematic policies
DROP POLICY IF EXISTS "Anyone can read roles" ON roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON roles;

-- Create new policies without recursion
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
      WHERE p.id = auth.uid()
      AND p.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Add foreign key for plans if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN plan_id UUID REFERENCES plans(id),
    ADD COLUMN plan_started_at TIMESTAMPTZ,
    ADD COLUMN plan_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create or replace plan expiration function
CREATE OR REPLACE FUNCTION check_plan_expiration()
RETURNS trigger AS $$
BEGIN
  IF NEW.plan_expires_at IS NOT NULL AND NEW.plan_expires_at < now() THEN
    -- Reset to free plan when subscription expires
    NEW.plan_id = (SELECT id FROM plans WHERE name = 'Free' LIMIT 1);
    NEW.plan_expires_at = NULL;
    NEW.plan_started_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace plan expiration trigger
DROP TRIGGER IF EXISTS check_plan_expiration_trigger ON profiles;
CREATE TRIGGER check_plan_expiration_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_plan_expiration();

-- Ensure default plans exist
INSERT INTO plans (name, description, price, features)
VALUES 
  ('Free', 'Plano gratuito com recursos básicos', 0, '[
    "Acesso ao dashboard",
    "Conteúdo básico",
    "Suporte via email"
  ]'::jsonb),
  ('Pro', 'Plano profissional com recursos avançados', 29.90, '[
    "Tudo do plano Free",
    "Acesso a todo conteúdo",
    "Suporte prioritário",
    "Downloads",
    "Certificados"
  ]'::jsonb),
  ('Enterprise', 'Plano empresarial com recursos exclusivos', 99.90, '[
    "Tudo do plano Pro",
    "API access",
    "Suporte 24/7",
    "Treinamento personalizado",
    "Ambiente dedicado"
  ]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  features = EXCLUDED.features;

-- Set free plan as default for users without a plan
UPDATE profiles
SET plan_id = (SELECT id FROM plans WHERE name = 'Free' LIMIT 1)
WHERE plan_id IS NULL;