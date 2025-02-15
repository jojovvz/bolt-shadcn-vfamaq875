/*
  # Fix Database Functions
  
  This migration updates the database functions to ensure proper functionality:
  1. Updates handle_new_user to properly handle role_id and plan_id
  2. Updates check_plan_expiration to handle plan transitions
  3. Ensures proper triggers are in place
*/

-- Drop existing functions and triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS check_plan_expiration_trigger ON profiles;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS check_plan_expiration();

-- Recreate handle_new_user function with proper role and plan handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
  default_plan_id UUID;
BEGIN
  -- Get the default member role ID
  SELECT id INTO default_role_id 
  FROM roles 
  WHERE name = 'member';

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
    COALESCE(new.raw_user_meta_data->>'role_id', default_role_id),
    COALESCE(default_plan_id, (SELECT id FROM plans WHERE name = 'Free' LIMIT 1)),
    now(),
    now()
  );

  RETURN new;
END;
$$;

-- Recreate check_plan_expiration function with better error handling
CREATE OR REPLACE FUNCTION public.check_plan_expiration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Only check expiration if there's an expiration date
  IF NEW.plan_expires_at IS NOT NULL AND NEW.plan_expires_at < now() THEN
    -- Get the free plan ID
    SELECT id INTO free_plan_id 
    FROM plans 
    WHERE name = 'Free' 
    LIMIT 1;

    -- If no free plan found, raise an error
    IF free_plan_id IS NULL THEN
      RAISE EXCEPTION 'Free plan not found';
    END IF;

    -- Reset to free plan
    NEW.plan_id := free_plan_id;
    NEW.plan_expires_at := NULL;
    NEW.plan_started_at := NULL;
    NEW.updated_at := now();
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER check_plan_expiration_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_plan_expiration();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON profiles(plan_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_plan_expiration TO authenticated;