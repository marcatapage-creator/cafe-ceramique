-- ============================================================
-- Café Céramique — Refonte schéma Sprint 3
-- Migration 007 — Créneaux glissants + sessions groupe + réservations
-- ============================================================

-- ============================================================
-- Nettoyage — tout supprimer dans l'ordre inverse des FK
-- ============================================================
DROP TABLE IF EXISTS notifications_log        CASCADE;
DROP TABLE IF EXISTS orders                   CASCADE;
DROP TABLE IF EXISTS ceramic_pieces           CASCADE;
DROP TABLE IF EXISTS firing_batches           CASCADE;
DROP TABLE IF EXISTS reservations             CASCADE;
DROP TABLE IF EXISTS table_group_members      CASCADE;
DROP TABLE IF EXISTS table_groups             CASCADE;
DROP TABLE IF EXISTS sessions                 CASCADE;
DROP TABLE IF EXISTS physical_tables          CASCADE;
DROP TABLE IF EXISTS clients                  CASCADE;

DROP FUNCTION IF EXISTS get_table_page_state            CASCADE;
DROP FUNCTION IF EXISTS get_session_available_seats     CASCADE;
DROP FUNCTION IF EXISTS create_reservation              CASCADE;
DROP FUNCTION IF EXISTS get_piece_by_token              CASCADE;
DROP FUNCTION IF EXISTS is_admin                        CASCADE;
DROP FUNCTION IF EXISTS update_updated_at               CASCADE;

-- ============================================================
-- clients
-- ============================================================
CREATE TABLE clients (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name  TEXT,
  phone      TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- physical_tables — 15 tables physiques
-- ============================================================
CREATE TABLE physical_tables (
  id        INTEGER PRIMARY KEY,
  label     TEXT NOT NULL,
  seats     INTEGER NOT NULL DEFAULT 2,
  pos_x     NUMERIC(6,2),
  pos_y     NUMERIC(6,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- opening_hours — plages d'ouverture du café
-- day_of_week : 0 = dimanche … 6 = samedi
-- Les créneaux disponibles = toutes les 30 min entre opens_at
-- et closes_at - 2h30 (durée fixe de session).
-- ============================================================
CREATE TABLE opening_hours (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week  INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at     TIME NOT NULL,
  closes_at    TIME NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- closed_dates — fermetures exceptionnelles
-- ============================================================
CREATE TABLE closed_dates (
  id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date   DATE NOT NULL UNIQUE,
  reason TEXT
);

-- ============================================================
-- reservations — réservation client (créneaux glissants)
-- starts_at : début choisi par le client (TIMESTAMPTZ UTC)
-- ends_at   : calculé = starts_at + 2h30 (colonne générée)
-- ============================================================
CREATE TABLE reservations (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id                UUID NOT NULL REFERENCES clients(id),
  starts_at                TIMESTAMPTZ NOT NULL,
  ends_at                  TIMESTAMPTZ,
  nb_participants          INTEGER NOT NULL CHECK (nb_participants BETWEEN 1 AND 29),
  status                   TEXT NOT NULL DEFAULT 'confirmed'
                             CHECK (status IN ('pending','confirmed','cancelled','no_show')),
  cancel_token             TEXT NOT NULL UNIQUE
                             DEFAULT replace(uuid_generate_v4()::text, '-', '')
                                 || replace(uuid_generate_v4()::text, '-', ''),
  cancelled_at             TIMESTAMPTZ,
  stripe_payment_method_id TEXT,
  cancellation_fee_charged BOOLEAN NOT NULL DEFAULT FALSE,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- group_sessions — session active créée par l'opérateur
-- Un groupe physiquement à table, avec son QR code.
-- Peut correspondre à une ou plusieurs réservations, ou à un
-- walk-in sans réservation.
-- ============================================================
CREATE TABLE group_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_token        TEXT NOT NULL UNIQUE
                    DEFAULT replace(uuid_generate_v4()::text, '-', ''),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'closed')),
  nb_participants INTEGER NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at       TIMESTAMPTZ
);

-- Tables physiques assignées à la session
CREATE TABLE group_session_tables (
  group_session_id  UUID NOT NULL REFERENCES group_sessions(id) ON DELETE CASCADE,
  physical_table_id INTEGER NOT NULL REFERENCES physical_tables(id),
  PRIMARY KEY (group_session_id, physical_table_id)
);

-- Lien optionnel entre session active et réservation(s)
CREATE TABLE group_session_reservations (
  group_session_id UUID NOT NULL REFERENCES group_sessions(id) ON DELETE CASCADE,
  reservation_id   UUID NOT NULL REFERENCES reservations(id),
  PRIMARY KEY (group_session_id, reservation_id)
);

-- ============================================================
-- firing_batches — fournées cuisson
-- ============================================================
CREATE TABLE firing_batches (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label        TEXT NOT NULL,
  planned_date DATE,
  fired_at     TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open','firing','done')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ceramic_pieces — pièce peinte + token de suivi
-- ============================================================
CREATE TABLE ceramic_pieces (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token            TEXT NOT NULL UNIQUE,
  client_id        UUID NOT NULL REFERENCES clients(id),
  group_session_id UUID NOT NULL REFERENCES group_sessions(id),
  firing_batch_id  UUID REFERENCES firing_batches(id),
  piece_name       TEXT,
  piece_price      NUMERIC(8,2),
  status           TEXT NOT NULL DEFAULT 'painted'
                     CHECK (status IN ('painted','queued','firing','ready','collected')),
  painted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  queued_at        TIMESTAMPTZ,
  fired_at         TIMESTAMPTZ,
  ready_at         TIMESTAMPTZ,
  collected_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- orders — commandes boissons / pâtisseries
-- ============================================================
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id        UUID NOT NULL REFERENCES clients(id),
  group_session_id UUID NOT NULL REFERENCES group_sessions(id),
  items            JSONB NOT NULL DEFAULT '[]',
  total            NUMERIC(8,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','served','cancelled')),
  notes            TEXT,
  ordered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  served_at        TIMESTAMPTZ
);

-- ============================================================
-- notifications_log
-- ============================================================
CREATE TABLE notifications_log (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  type      TEXT NOT NULL,
  channel   TEXT NOT NULL CHECK (channel IN ('email','sms','push','admin')),
  payload   JSONB,
  sent_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error     TEXT
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_reservations_starts_at   ON reservations(starts_at);
CREATE INDEX idx_reservations_client      ON reservations(client_id);
CREATE INDEX idx_reservations_status      ON reservations(status);
CREATE INDEX idx_reservations_cancel_tok  ON reservations(cancel_token);
CREATE INDEX idx_group_sessions_token     ON group_sessions(qr_token);
CREATE INDEX idx_group_sessions_status    ON group_sessions(status);
CREATE INDEX idx_group_sessions_starts    ON group_sessions(starts_at);
CREATE INDEX idx_ceramic_pieces_token     ON ceramic_pieces(token);
CREATE INDEX idx_ceramic_pieces_client    ON ceramic_pieces(client_id);
CREATE INDEX idx_ceramic_pieces_session   ON ceramic_pieces(group_session_id);
CREATE INDEX idx_ceramic_pieces_status    ON ceramic_pieces(status);
CREATE INDEX idx_orders_session           ON orders(group_session_id);
CREATE INDEX idx_orders_client            ON orders(client_id);
CREATE INDEX idx_notifications_client     ON notifications_log(client_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calcul automatique de ends_at = starts_at + 2h30
CREATE OR REPLACE FUNCTION set_ends_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ends_at := NEW.starts_at + INTERVAL '2 hours 30 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER reservations_set_ends_at
  BEFORE INSERT OR UPDATE OF starts_at ON reservations
  FOR EACH ROW EXECUTE FUNCTION set_ends_at();

CREATE TRIGGER group_sessions_set_ends_at
  BEFORE INSERT OR UPDATE OF starts_at ON group_sessions
  FOR EACH ROW EXECUTE FUNCTION set_ends_at();

-- ============================================================
-- Seed — 15 tables physiques
-- ============================================================
INSERT INTO physical_tables (id, label, seats, pos_x, pos_y) VALUES
  (1,  'Table 1',  2, 100, 100), (2,  'Table 2',  2, 220, 100),
  (3,  'Table 3',  2, 340, 100), (4,  'Table 4',  2, 460, 100),
  (5,  'Table 5',  2, 580, 100), (6,  'Table 6',  2, 100, 240),
  (7,  'Table 7',  2, 220, 240), (8,  'Table 8',  2, 340, 240),
  (9,  'Table 9',  2, 460, 240), (10, 'Table 10', 2, 580, 240),
  (11, 'Table 11', 2, 100, 380), (12, 'Table 12', 2, 220, 380),
  (13, 'Table 13', 2, 340, 380), (14, 'Table 14', 2, 460, 380),
  (15, 'Table 15', 2, 580, 380);

-- Seed — horaires d'ouverture par défaut (configurable)
-- Mardi à dimanche : 10h → 20h (dernier créneau 17h30)
INSERT INTO opening_hours (day_of_week, opens_at, closes_at) VALUES
  (2, '10:00', '20:00'), -- mardi
  (3, '10:00', '20:00'), -- mercredi
  (4, '10:00', '20:00'), -- jeudi
  (5, '10:00', '20:00'), -- vendredi
  (6, '10:00', '22:00'), -- samedi (dernier créneau 19h30)
  (0, '10:00', '19:00'); -- dimanche (dernier créneau 16h30)
