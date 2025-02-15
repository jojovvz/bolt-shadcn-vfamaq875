/*
  # Initial Schema Migration

  1. Tables Created:
    - roles (User roles and permissions)
    - plans (Subscription plans)
    - profiles (User profiles with role and plan)
    - categories (Course categories)
    - modules (Course modules)
    - lessons (Course lessons)
    - user_progress (User lesson progress)

  2. Security:
    - RLS enabled for all tables
    - Appropriate policies for each table
    - Role-based access control

  3. Relationships:
    - profiles -> roles (many-to-one)
    - profiles -> plans (many-to-one)
    - modules -> categories (many-to-one)
    - lessons -> modules (many-to-one)
    - user_progress -> profiles (many-to-one)
    - user_progress -> lessons (many-to-one)
*/

-- Create roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id) NOT NULL,
  plan_id UUID REFERENCES plans(id),
  plan_started_at TIMESTAMPTZ DEFAULT now(),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create modules table
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  order_index INTEGER NOT NULL,
  cover_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  module_id INTEGER REFERENCES modules(id),
  youtube_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  lesson_id UUID REFERENCES lessons(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Roles policies
CREATE POLICY "roles_read_policy"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "roles_write_policy"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Plans policies
CREATE POLICY "plans_read_policy"
  ON plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "plans_write_policy"
  ON plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Profiles policies
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "categories_read_policy"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "categories_write_policy"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Modules policies
CREATE POLICY "modules_read_policy"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "modules_write_policy"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Lessons policies
CREATE POLICY "lessons_read_policy"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "lessons_write_policy"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- User progress policies
CREATE POLICY "progress_read_own"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "progress_write_own"
  ON user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
CREATE INDEX idx_profiles_plan_id ON profiles(plan_id);
CREATE INDEX idx_modules_category_id ON modules(category_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);

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
  ])
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

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
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  features = EXCLUDED.features;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
  default_plan_id UUID;
BEGIN
  -- Get default role and plan
  SELECT id INTO default_role_id FROM roles WHERE name = 'member';
  SELECT id INTO default_plan_id FROM plans WHERE name = 'Free';
  
  INSERT INTO public.profiles (
    id,
    full_name,
    role_id,
    plan_id,
    created_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    default_role_id,
    default_plan_id,
    now()
  );
  RETURN new;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle plan expiration
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

-- Create trigger for plan expiration
DROP TRIGGER IF EXISTS check_plan_expiration_trigger ON profiles;
CREATE TRIGGER check_plan_expiration_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_plan_expiration();