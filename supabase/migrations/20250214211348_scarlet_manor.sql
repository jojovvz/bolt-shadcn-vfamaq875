/*
  # Add sample categories

  1. Changes
    - Insert sample categories for the course
  
  2. Security
    - Maintains existing RLS policies
*/

-- Insert sample categories if they don't exist
INSERT INTO categories (name, description) VALUES
  ('Introdução', 'Módulos introdutórios e boas-vindas'),
  ('Redes Sociais', 'Marketing em redes sociais'),
  ('Tráfego Pago', 'Estratégias de tráfego pago'),
  ('Produtos', 'Produtos disponíveis'),
  ('Criação de Conteúdo', 'Criação de conteúdo e design'),
  ('Branding', 'Desenvolvimento de marca')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- Add RLS policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users"
      ON categories FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;