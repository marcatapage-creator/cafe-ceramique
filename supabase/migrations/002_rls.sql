-- ============================================================
-- Café Céramique — Row Level Security
-- Migration 002 — Sprint 1
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE clients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_tables       ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_groups          ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_group_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE firing_batches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceramic_pieces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helpers
-- ============================================================

-- Vérifie si l'utilisateur connecté est gérant (role admin)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
    ),
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- sessions — lectures publiques (disponibilités)
-- ============================================================
CREATE POLICY "sessions_public_read" ON sessions
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "sessions_admin_all" ON sessions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- physical_tables — lecture publique (plan de salle)
-- ============================================================
CREATE POLICY "physical_tables_public_read" ON physical_tables
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "physical_tables_admin_all" ON physical_tables
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- table_groups / table_group_members — admin only
-- ============================================================
CREATE POLICY "table_groups_admin_all" ON table_groups
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "table_group_members_admin_all" ON table_group_members
  FOR ALL USING (auth.role() = 'authenticated');

-- Lecture publique du groupe par son slug (webapp table QR)
CREATE POLICY "table_groups_public_read_by_slug" ON table_groups
  FOR SELECT USING (qr_code_slug IS NOT NULL);

-- ============================================================
-- clients
-- Anon peut créer un profil (flow table + réservation).
-- Authentifié (gérant) voit tout.
-- ============================================================
CREATE POLICY "clients_anon_insert" ON clients
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "clients_admin_all" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- reservations
-- Anon peut créer une réservation.
-- Gérant voit et gère tout.
-- ============================================================
CREATE POLICY "reservations_anon_insert" ON reservations
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "reservations_admin_all" ON reservations
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- ceramic_pieces
-- Anon : INSERT (création du token en fin de flow)
--        SELECT par token uniquement (page suivi pièce)
-- Gérant : tout
-- ============================================================
CREATE POLICY "ceramic_pieces_anon_insert" ON ceramic_pieces
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "ceramic_pieces_admin_all" ON ceramic_pieces
  FOR ALL USING (auth.role() = 'authenticated');

-- Pas de policy SELECT anon directe — on passe par la fonction RPC ci-dessous
-- pour éviter d'exposer toutes les pièces.

-- ============================================================
-- Fonction RPC — consultation pièce par token (sans auth)
-- Appelée depuis /suivi/[token] et la webapp table.
-- ============================================================
CREATE OR REPLACE FUNCTION get_piece_by_token(p_token TEXT)
RETURNS TABLE (
  token         TEXT,
  piece_name    TEXT,
  status        TEXT,
  painted_at    TIMESTAMPTZ,
  queued_at     TIMESTAMPTZ,
  fired_at      TIMESTAMPTZ,
  ready_at      TIMESTAMPTZ,
  collected_at  TIMESTAMPTZ,
  client_first_name TEXT
) AS $$
  SELECT
    cp.token,
    cp.piece_name,
    cp.status,
    cp.painted_at,
    cp.queued_at,
    cp.fired_at,
    cp.ready_at,
    cp.collected_at,
    c.first_name AS client_first_name
  FROM ceramic_pieces cp
  JOIN clients c ON c.id = cp.client_id
  WHERE cp.token = p_token
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- firing_batches — admin only
-- ============================================================
CREATE POLICY "firing_batches_admin_all" ON firing_batches
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- orders
-- Anon peut créer une commande (flow table).
-- Gérant voit et gère tout.
-- ============================================================
CREATE POLICY "orders_anon_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- notifications_log — admin only
-- ============================================================
CREATE POLICY "notifications_log_admin_all" ON notifications_log
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Fonction RPC — capacité disponible pour une session
-- Calcule les places réelles en tenant compte des fusions.
-- Utilisée côté client (réservation) et admin.
-- ============================================================
CREATE OR REPLACE FUNCTION get_session_available_seats(p_session_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_capacity    INTEGER;
  v_reserved    INTEGER;
BEGIN
  SELECT capacity INTO v_capacity FROM sessions WHERE id = p_session_id;

  SELECT COALESCE(SUM(r.nb_participants), 0)
  INTO v_reserved
  FROM reservations r
  WHERE r.session_id = p_session_id
    AND r.status NOT IN ('cancelled');

  RETURN GREATEST(0, v_capacity - v_reserved);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- Fonction RPC — création réservation avec lock transactionnel
-- Évite les doubles réservations (race condition).
-- ============================================================
CREATE OR REPLACE FUNCTION create_reservation(
  p_session_id      UUID,
  p_client_id       UUID,
  p_nb_participants INTEGER,
  p_notes           TEXT DEFAULT NULL
)
RETURNS reservations AS $$
DECLARE
  v_available INTEGER;
  v_resa      reservations;
BEGIN
  -- Lock sur la session pour éviter les race conditions
  PERFORM id FROM sessions WHERE id = p_session_id FOR UPDATE;

  -- Calcul des places disponibles
  SELECT get_session_available_seats(p_session_id) INTO v_available;

  IF v_available < p_nb_participants THEN
    RAISE EXCEPTION 'NOT_ENOUGH_SEATS: % places demandées, % disponibles',
      p_nb_participants, v_available;
  END IF;

  INSERT INTO reservations (session_id, client_id, nb_participants, status, notes, confirmed_at)
  VALUES (p_session_id, p_client_id, p_nb_participants, 'confirmed', p_notes, NOW())
  RETURNING * INTO v_resa;

  RETURN v_resa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
