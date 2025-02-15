/*
  # Add plans and update roles structure

  1. New Tables
    - `plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `features` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. New Columns
    - Add `plan_id` to `profiles` table
    - Add `plan_expires_at` to `profiles` table

  3. Security
    - Enable RLS on `plans` table
    - Add policies for reading plans
    - Add policies for admins to manage plans
*/

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read plans"
  ON plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert plans"
  ON plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update plans"
  ON plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete plans"
  ON plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add plan columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id),
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Insert default plans
INSERT INTO plans (name, description, price, features) VALUES
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
ON CONFLICT DO NOTHING;

-- Update roles with plan-related permissions
UPDATE roles 
SET permissions = array_cat(permissions, ARRAY['manage_plans'::text])
WHERE name = 'admin';

-- Create function to handle plan expiration
CREATE OR REPLACE FUNCTION check_plan_expiration()
RETURNS trigger AS $$
BEGIN
  IF NEW.plan_expires_at IS NOT NULL AND NEW.plan_expires_at < now() THEN
    -- Reset to free plan when subscription expires
    NEW.plan_id = (SELECT id FROM plans WHERE name = 'Free' LIMIT 1);
    NEW.plan_expires_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan expiration
DROP TRIGGER IF EXISTS on_profile_update ON profiles;
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_plan_expiration();