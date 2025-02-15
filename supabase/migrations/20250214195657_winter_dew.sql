/*
  # Import modules data
  
  1. Updates
    - Clear existing modules data
    - Import new modules data with correct status mapping
    - Update sequences after import
  
  2. Data Changes
    - Maps 'Ativo' status to 'published'
    - Preserves all original data including URLs and order
*/

-- First, clear existing modules data
TRUNCATE modules RESTART IDENTITY CASCADE;

-- Insert new modules data
INSERT INTO modules (id, title, description, cover_url, order_index, status, created_at, category_id)
VALUES
  (19657, 'Módulo 0 - Boas vindas', 'modulo-0-boas-vindas', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens-land/cn260220/imagens-land-21025.jpeg', 1, 'published', '2025-02-14 16:25:47.734+00', 1),
  (19669, 'Módulo 1 - Introdução ao Marketing', 'modulo-1-introducao-ao-marketing', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-27323.jpeg', 2, 'published', '2025-02-14 16:25:47.735+00', 1),
  (19670, 'Módulo 2 - Facebook Ads', 'modulo-2-facebook-ads', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-27324.jpeg', 14, 'published', '2025-02-14 16:25:47.735+00', 3),
  (19671, 'Módulo 3 - Google Ads', 'modulo-3-google-ads', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-27334.jpeg', 18, 'published', '2025-02-14 16:25:47.735+00', 3),
  (19673, 'Módulo 5 - TikTok Ads', 'modulo-5-tiktok-ads', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-27345.jpeg', 17, 'published', '2025-02-14 16:25:47.735+00', 3),
  (19677, 'Módulo 8 - Automações', 'modulo-8-automacoes', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-27350.jpeg', 7, 'published', '2025-02-14 16:25:47.735+00', 1),
  (19678, 'Módulo 9 - Criativos Milionários', 'modulo-9-criativos-milionarios', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-27352.jpeg', 26, 'published', '2025-02-14 16:25:47.735+00', 5),
  (19680, 'Módulo 10 - Copys Milionárias', 'modulo-10-copys-milionarias', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29150.jpeg', 23, 'published', '2025-02-14 16:25:47.735+00', 5),
  (19689, 'Módulo 11 - Criando sua Marca Milionária', 'modulo-11-criando-sua-marca-milionaria', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-27354.jpeg', 27, 'published', '2025-02-14 16:25:47.735+00', 6),
  (19748, 'Rosa Amazônica', 'rosa-amazonica', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-43995.jpg', 19, 'published', '2025-02-14 16:25:47.735+00', 4),
  (19762, 'Regenere', 'regenere', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-43996.jpg', 20, 'published', '2025-02-14 16:25:47.735+00', 4),
  (20857, 'Módulo 12 - Tráfego Orgânico', 'modulo-12-trafego-organico', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29135.jpeg', 8, 'published', '2025-02-14 16:25:47.735+00', 2),
  (20858, 'Módulo 13 - Pinterest', 'modulo-13-pinterest', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29136.jpeg', 9, 'published', '2025-02-14 16:25:47.735+00', 2),
  (20859, 'Módulo 14 - YouTube', 'modulo-14-youtube', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29138.jpeg', 11, 'published', '2025-02-14 16:25:47.735+00', 2),
  (20860, 'Módulo 15 - TikTok', 'modulo-15-tiktok', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29139.jpeg', 10, 'published', '2025-02-14 16:25:47.735+00', 2),
  (20861, 'Módulo 16 - Instagram', 'modulo-16-instagram', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29140.jpeg', 12, 'published', '2025-02-14 16:25:47.735+00', 2),
  (20862, 'Módulo 17 - Facebook', 'modulo-17-facebook', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29141.jpeg', 13, 'published', '2025-02-14 16:25:47.735+00', 2),
  (20901, 'Módulo 19 - Copys Milionárias Tráfego Pago', 'modulo-19-copys-milionarias-trafego-pago', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29151.jpeg', 24, 'published', '2025-02-14 16:25:47.735+00', 5),
  (21086, 'Aulas Ao vivo', 'aulas-ao-vivo', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29377.jpeg', 3, 'published', '2025-02-14 16:25:47.735+00', 1),
  (21385, 'Módulo 20 - Canva Milionário', 'modulo-20-canva-milionario', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-29845.jpeg', 25, 'published', '2025-02-14 16:25:47.735+00', 5),
  (22419, 'Módulo 21 - Contingência Avançado', 'modulo-21-contigencia-avancado', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-31192.jpg', 15, 'published', '2025-02-14 16:25:47.735+00', 3),
  (25222, 'Ebooks', 'ebooks', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-35003.jpeg', 5, 'published', '2025-02-14 16:25:47.735+00', 1),
  (30683, 'Estrutura e Otimização', 'estrutura-e-otimizacao', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-42360.jpg', 16, 'published', '2025-02-14 16:25:47.735+00', 3),
  (35546, 'Módulo de Tráfego Local com Manoel Dias', 'modulo-de-trafego-local-com-manoel-dias', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-49236.jpg', 4, 'published', '2025-02-14 16:25:47.735+00', 1),
  (76080, 'Nullam', 'nullam', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-107553.jpg', 6, 'published', '2025-02-14 16:25:47.735+00', 1),
  (77753, 'Vita Pro Nobis', 'vita-pro-nobis', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-110072.png', 21, 'published', '2025-02-14 16:25:47.735+00', 4),
  (77772, 'Cannabinoid Active System (CBA Serum)', 'cannabinoid-active-system-cba-serum', 'https://ams3.cdnastron.com.br/modelo-v1-2/mod_cursos/ext_imagens/cn290500/imagens-153153.png', 22, 'published', '2025-02-14 16:25:47.735+00', 4);

-- Update the sequence
SELECT setval('modules_id_seq', (SELECT MAX(id) FROM modules));