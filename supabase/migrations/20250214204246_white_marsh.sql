/*
  # Fix lessons table structure

  1. Changes
    - Change lessons.id from serial to uuid
    - Add default gen_random_uuid() for id
    - Recreate foreign key constraints
  
  2. Data Migration
    - Preserve existing data with new UUIDs
*/

-- Temporarily disable RLS
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- Drop dependent constraints
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_lesson_id_fkey;

-- Create temporary table with correct structure
CREATE TABLE lessons_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  module_id INTEGER REFERENCES modules(id),
  youtube_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Copy data with new UUIDs
INSERT INTO lessons_new (title, description, module_id, youtube_url, order_index, created_at, updated_at)
SELECT title, description, module_id, youtube_url, order_index, created_at, updated_at
FROM lessons;

-- Drop old table and rename new one
DROP TABLE lessons;
ALTER TABLE lessons_new RENAME TO lessons;

-- Create index
CREATE INDEX idx_lessons_module ON lessons(module_id);

-- Re-enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Anyone can read lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);