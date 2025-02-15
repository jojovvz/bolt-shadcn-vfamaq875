/*
  # Add sample lessons

  1. New Data
    - Sample lessons for existing modules
    - Each lesson has:
      - Title
      - Description
      - YouTube URL
      - Order index
      - Module reference

  2. Changes
    - Insert sample lessons for different modules
*/

-- Insert sample lessons for Module 0 (Boas vindas)
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Boas-vindas ao curso', 'Introdução e visão geral do curso', 19657, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Como aproveitar o máximo do curso', 'Dicas para maximizar seu aprendizado', 19657, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);

-- Insert sample lessons for Module 1 (Introdução ao Marketing)
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('O que é Marketing Digital', 'Fundamentos do marketing digital', 19669, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Estratégias de Marketing', 'Principais estratégias do marketing digital', 19669, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('Análise de Mercado', 'Como analisar seu mercado e concorrência', 19669, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);

-- Insert sample lessons for Module 2 (Facebook Ads)
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Introdução ao Facebook Ads', 'Visão geral da plataforma', 19670, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Configuração de Campanhas', 'Como configurar suas primeiras campanhas', 19670, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('Segmentação de Público', 'Estratégias de segmentação avançada', 19670, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3),
  ('Otimização de Anúncios', 'Como otimizar seus anúncios para melhor performance', 19670, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 4);

-- Insert sample lessons for Module 3 (Google Ads)
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Fundamentos do Google Ads', 'Introdução à plataforma Google Ads', 19671, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Pesquisa de Palavras-chave', 'Como encontrar as melhores palavras-chave', 19671, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('Estrutura de Campanhas', 'Organizando suas campanhas eficientemente', 19671, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);

-- Insert sample lessons for Module 5 (TikTok Ads)
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Introdução ao TikTok Ads', 'Conhecendo a plataforma de anúncios do TikTok', 19673, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Criação de Conteúdo', 'Como criar conteúdo viral para o TikTok', 19673, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('Estratégias de Campanha', 'Estratégias efetivas para TikTok Ads', 19673, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);

-- Insert sample lessons for Criativos Milionários
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Princípios de Design', 'Fundamentos de design para marketing', 19678, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Criação de Thumbnails', 'Como criar thumbnails que convertem', 19678, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('Design para Redes Sociais', 'Criação de conteúdo visual para redes sociais', 19678, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);

-- Insert sample lessons for Copys Milionárias
INSERT INTO lessons (title, description, module_id, youtube_url, order_index) VALUES
  ('Fundamentos de Copywriting', 'Princípios básicos de copywriting', 19680, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('Estrutura de Copy', 'Como estruturar uma copy que vende', 19680, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('Gatilhos Mentais', 'Usando gatilhos mentais em suas copies', 19680, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3),
  ('Call to Action', 'Criando CTAs irresistíveis', 19680, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 4);