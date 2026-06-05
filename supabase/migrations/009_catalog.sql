-- ============================================================
-- Café Céramique — Catalogue pièces + menu boissons
-- Migration 009
-- ============================================================

CREATE TABLE catalog_pieces (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(8,2) NOT NULL,
  photo_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE menu_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(8,2) NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('drink', 'food')),
  photo_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE catalog_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_pieces_public_read" ON catalog_pieces
  FOR SELECT USING (is_available = TRUE);
CREATE POLICY "catalog_pieces_admin_all" ON catalog_pieces
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "menu_items_public_read" ON menu_items
  FOR SELECT USING (is_available = TRUE);
CREATE POLICY "menu_items_admin_all" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed — pièces céramique (prix indicatifs à ajuster)
INSERT INTO catalog_pieces (name, description, price, sort_order) VALUES
  ('Bol medium',        'Bol polyvalent pour céréales ou soupe',     18.00, 1),
  ('Tasse à café',      'Tasse 20cl avec anse',                      14.00, 2),
  ('Assiette creuse',   'Assiette 22cm, idéale pour les pâtes',      20.00, 3),
  ('Mug',               'Grand mug 35cl pour le thé du matin',       16.00, 4),
  ('Vase haut',         'Vase cylindrique 20cm',                     24.00, 5),
  ('Coupelle',          'Petite coupelle décorative ou vide-poche',  12.00, 6),
  ('Bol large',         'Bol de service ou saladier individuel',     22.00, 7),
  ('Assiette plate',    'Assiette 25cm pour entrées et desserts',    18.00, 8);

-- Seed — menu boissons & snacks
INSERT INTO menu_items (name, description, price, category, sort_order) VALUES
  ('Café espresso',     'Café serré, grain de spécialité',   2.50, 'drink', 1),
  ('Café allongé',      'Café long doux',                    2.50, 'drink', 2),
  ('Cappuccino',        'Espresso + lait mousse',            3.50, 'drink', 3),
  ('Thé noir',          'Thé en feuilles, plusieurs saveurs',3.00, 'drink', 4),
  ('Thé vert matcha',   'Matcha latte chaud ou froid',       4.00, 'drink', 5),
  ('Jus d''orange',     'Pressé à la commande',              4.50, 'drink', 6),
  ('Eau plate',         'Carafe 50cl',                       2.00, 'drink', 7),
  ('Limonade maison',   'Citron menthe, sans alcool',        3.50, 'drink', 8),
  ('Croissant',         'Beurre, cuit le matin',             2.00, 'food',  9),
  ('Pain au chocolat',  'Deux barres de chocolat noir',      2.20, 'food', 10),
  ('Madeleine x3',      'Maison, citron ou vanille',         3.00, 'food', 11),
  ('Cookie',            'Chocolat noir et noix',             2.50, 'food', 12);
