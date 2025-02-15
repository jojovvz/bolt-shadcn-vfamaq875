/*
  # Fix lessons table structure

  1. Changes
    - Drop existing lessons table
    - Recreate lessons table with correct structure
    - Add RLS policies
    - Add sample lessons data
*/

-- Drop existing lessons table and recreate with correct structure
DROP TABLE IF EXISTS lessons CASCADE;

CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  module_id INTEGER REFERENCES modules(id),
  youtube_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample lessons
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Aula 1 - Introdução ao Curso', 'Boas vindas e visão geral do curso', 19657, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Aula 2 - Como aproveitar o curso', 'Dicas para maximizar seu aprendizado', 19657, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('Aula 3 - Mentalidade e Planejamento', 'Preparação para o sucesso', 19657, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);