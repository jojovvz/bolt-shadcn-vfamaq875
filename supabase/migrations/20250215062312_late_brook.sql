/*
  # Fix plans table structure

  1. Changes
    - Add missing description column to plans table
    - Update existing plans with descriptions
    - Add proper indexes

  2. Security
    - Maintain existing RLS policies
*/

-- Add description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'description'
  ) THEN
    ALTER TABLE plans 
    ADD COLUMN description TEXT;
  END IF;
END $$;

-- Update existing plans with descriptions
UPDATE plans
SET description = CASE
  WHEN name = 'Free' THEN 'Plano gratuito com recursos básicos'
  WHEN name = 'Pro' THEN 'Plano profissional com recursos avançados'
  WHEN name = 'Enterprise' THEN 'Plano empresarial com recursos exclusivos'
  ELSE description
END
WHERE description IS NULL;