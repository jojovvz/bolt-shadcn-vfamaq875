/*
  # Lesson Portal Schema Setup

  1. New Tables
    - categories: Course categories
    - modules: Course modules within categories
    - lessons: Individual lessons within modules
    - user_progress: Track user progress through lessons
    - plans: Subscription plans
    - subscriptions: User subscriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where needed

  3. Relationships
    - Link modules to categories
    - Link lessons to modules
    - Link user_progress to users and lessons
    - Link subscriptions to users and plans
*/

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Modules Table
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  order_index INTEGER NOT NULL,
  cover_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published modules"
  ON modules FOR SELECT
  TO authenticated
  USING (status = 'published' OR status IS NULL);

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  module_id INTEGER REFERENCES modules(id),
  youtube_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  lesson_id INTEGER REFERENCES lessons(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration_days INTEGER,
  type TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plans"
  ON plans FOR SELECT
  TO authenticated
  USING (true);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES plans(id) NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert some sample data
INSERT INTO categories (name, description) VALUES
  ('Web Development', 'Learn modern web development technologies'),
  ('Mobile Development', 'Build mobile applications'),
  ('Data Science', 'Explore data analysis and machine learning')
ON CONFLICT DO NOTHING;

INSERT INTO modules (title, description, category_id, order_index, status, cover_url) VALUES
  ('React Fundamentals', 'Master the basics of React', 1, 1, 'published', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'),
  ('React Hooks', 'Learn modern React with Hooks', 1, 2, 'published', 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800'),
  ('State Management', 'Advanced state management in React', 1, 3, 'published', 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800')
ON CONFLICT DO NOTHING;

INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Introduction to React', 'Get started with React', 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Components and Props', 'Learn about React components', 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('State and Lifecycle', 'Understand React state', 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3)
ON CONFLICT DO NOTHING;

INSERT INTO plans (name, price, duration_days, type, features) VALUES
  ('Free', 0, NULL, 'free', '["Basic lessons", "Community support"]'),
  ('Pro', 9.99, 30, 'pro', '["All lessons", "Priority support", "Downloadable resources"]'),
  ('Enterprise', 99.99, 365, 'enterprise', '["All features", "Custom training", "Team management"]')
ON CONFLICT DO NOTHING;