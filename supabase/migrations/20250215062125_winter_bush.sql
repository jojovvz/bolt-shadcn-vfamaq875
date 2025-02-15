/*
  # Fix plan_id column and relationships

  1. Changes
    - Add missing plan_id column to profiles table
    - Set default plan for existing profiles
    - Add proper indexes and constraints

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- Add plan_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN plan_id UUID REFERENCES plans(id),
    ADD COLUMN plan_started_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN plan_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for plan_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_plan_id'
  ) THEN
    CREATE INDEX idx_profiles_plan_id ON profiles(plan_id);
  END IF;
END $$;

-- Set default free plan for profiles without a plan
UPDATE profiles
SET plan_id = (
  SELECT id FROM plans WHERE name = 'Free' LIMIT 1
)
WHERE plan_id IS NULL;