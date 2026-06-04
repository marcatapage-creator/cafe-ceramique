-- ============================================================
-- Café Céramique — Schéma principal
-- Migration 001 — Sprint 1
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- ============================================================
-- clients
-- Profil client. Créé lors de la première interaction
-- (réservation OU flow table QR).
-- ============================================================
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL UNIQUE,
  first_name  TEXT NOT NULL,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- sessions
-- Créneaux de 2h disponibles à la réservation.
-- Le gérant crée les sessions en amont (ex: 10h-12h, 14h-16h).
-- ============================================================
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  capacity      INTEGER NOT NULL DEFAULT 30,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (date, start_time)
);

-- ============================================================
-- physical_tables
-- Les 15 tables physiques du café.
-- Peuplées une seule fois au setup (seed).
-- ============================================================
CREATE TABLE physical_tables (
  id          INTEGER PRIMARY KEY,      -- 1 à 15
  label       TEXT NOT NULL,            -- ex: "Table 3"
  seats       INTEGER NOT NULL DEFAULT 2,
  pos_x       NUMERIC(6,2),             -- position SVG plan de salle
  pos_y       NUMERIC(6,2),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- table_groups
-- Fusion de tables pour une session donnée.
-- Créé par le gérant depuis le plan de salle.
-- ============================================================
CREATE TABLE table_groups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  -- Table référente = numéro le plus bas du groupe
  reference_table INTEGER NOT NULL REFERENCES physical_tables(id),
  label           TEXT NOT NULL,          -- ex: "Groupe T3"
  qr_code_url     TEXT,                   -- URL ou data-URL du QR généré
  qr_code_slug    TEXT UNIQUE,            -- slug pour /table/[slug]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tables appartenant au groupe (table de liaison)
CREATE TABLE table_group_members (
  table_group_id  UUID NOT NULL REFERENCES table_groups(id) ON DELETE CASCADE,
  physical_table_id INTEGER NOT NULL REFERENCES physical_tables(id),
  PRIMARY KEY (table_group_id, physical_table_id)
);

-- ============================================================
-- reservations
-- Réservation d'un groupe client pour une session.
-- ============================================================
CREATE TABLE reservations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE RESTRICT,
  client_id         UUID NOT NULL REFERENCES clients(id),
  table_group_id    UUID REFERENCES table_groups(id),
  nb_participants   INTEGER NOT NULL CHECK (nb_participants >= 1),
  status            TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('pending','confirmed','cancelled','no_show')),
  notes             TEXT,
  confirmed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- firing_batches
-- Fournées cuisson. Créées par le gérant.
-- ============================================================
CREATE TABLE firing_batches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label         TEXT NOT NULL,           -- ex: "Fournée du 06/06 — 14h"
  planned_date  DATE,
  fired_at      TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','firing','done')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ceramic_pieces
-- Pièce peinte par un client. Générée à la fin du flow table.
-- Le token est l'identifiant public visible par le client.
-- ============================================================
CREATE TABLE ceramic_pieces (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token             TEXT NOT NULL UNIQUE,   -- CER-MMDD-T00-XXX
  client_id         UUID NOT NULL REFERENCES clients(id),
  session_id        UUID NOT NULL REFERENCES sessions(id),
  table_group_id    UUID REFERENCES table_groups(id),
  firing_batch_id   UUID REFERENCES firing_batches(id),
  piece_name        TEXT,                   -- nom de la pièce choisie dans le catalogue
  piece_price       NUMERIC(8,2),
  status            TEXT NOT NULL DEFAULT 'painted'
                    CHECK (status IN ('painted','queued','firing','ready','collected')),
  painted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  queued_at         TIMESTAMPTZ,
  fired_at          TIMESTAMPTZ,
  ready_at          TIMESTAMPTZ,
  collected_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- orders
-- Commandes boissons / pâtisseries passées depuis la webapp table.
-- items est un JSONB : [{ name, price, qty }]
-- ============================================================
CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES clients(id),
  session_id    UUID NOT NULL REFERENCES sessions(id),
  table_group_id UUID REFERENCES table_groups(id),
  items         JSONB NOT NULL DEFAULT '[]',
  total         NUMERIC(8,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','served','cancelled')),
  notes         TEXT,
  ordered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  served_at     TIMESTAMPTZ
);

-- ============================================================
-- notifications_log
-- Historique de toutes les notifications envoyées.
-- ============================================================
CREATE TABLE notifications_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID REFERENCES clients(id),
  type        TEXT NOT NULL,    -- 'reservation_confirmed' | 'piece_ready' | 'reminder_j1' | etc.
  channel     TEXT NOT NULL     CHECK (channel IN ('email','sms','admin')),
  payload     JSONB,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error       TEXT              -- null si succès
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_reservations_session ON reservations(session_id);
CREATE INDEX idx_reservations_client ON reservations(client_id);
CREATE INDEX idx_ceramic_pieces_token ON ceramic_pieces(token);
CREATE INDEX idx_ceramic_pieces_client ON ceramic_pieces(client_id);
CREATE INDEX idx_ceramic_pieces_status ON ceramic_pieces(status);
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_table_group ON orders(table_group_id);
CREATE INDEX idx_notifications_client ON notifications_log(client_id);

-- ============================================================
-- updated_at trigger (clients)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Seed — 15 tables physiques
-- ============================================================
INSERT INTO physical_tables (id, label, seats, pos_x, pos_y) VALUES
  (1,  'Table 1',  2, 100, 100),
  (2,  'Table 2',  2, 220, 100),
  (3,  'Table 3',  2, 340, 100),
  (4,  'Table 4',  2, 460, 100),
  (5,  'Table 5',  2, 580, 100),
  (6,  'Table 6',  2, 100, 240),
  (7,  'Table 7',  2, 220, 240),
  (8,  'Table 8',  2, 340, 240),
  (9,  'Table 9',  2, 460, 240),
  (10, 'Table 10', 2, 580, 240),
  (11, 'Table 11', 2, 100, 380),
  (12, 'Table 12', 2, 220, 380),
  (13, 'Table 13', 2, 340, 380),
  (14, 'Table 14', 2, 460, 380),
  (15, 'Table 15', 2, 580, 380);
