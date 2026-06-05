-- ============================================================
-- Café Céramique — RLS + fonctions RPC
-- Migration 008
-- ============================================================

-- ============================================================
-- RLS : activer sur toutes les tables
-- ============================================================
ALTER TABLE clients                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_tables           ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours             ENABLE ROW LEVEL SECURITY;
ALTER TABLE closed_dates              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_session_tables      ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_session_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE firing_batches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceramic_pieces            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies
-- ============================================================

-- opening_hours : lecture publique (calendrier de réservation)
CREATE POLICY "opening_hours_public_read" ON opening_hours
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "opening_hours_admin_all" ON opening_hours
  FOR ALL USING (auth.role() = 'authenticated');

-- closed_dates : lecture publique
CREATE POLICY "closed_dates_public_read" ON closed_dates
  FOR SELECT USING (TRUE);
CREATE POLICY "closed_dates_admin_all" ON closed_dates
  FOR ALL USING (auth.role() = 'authenticated');

-- physical_tables : lecture publique
CREATE POLICY "physical_tables_public_read" ON physical_tables
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "physical_tables_admin_all" ON physical_tables
  FOR ALL USING (auth.role() = 'authenticated');

-- clients : anon peut créer, admin voit tout
CREATE POLICY "clients_anon_insert" ON clients
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "clients_admin_all" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

-- reservations : anon peut créer via RPC, admin voit tout
CREATE POLICY "reservations_anon_insert" ON reservations
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "reservations_admin_all" ON reservations
  FOR ALL USING (auth.role() = 'authenticated');

-- group_sessions : lecture par token (QR scan), admin tout
CREATE POLICY "group_sessions_public_read" ON group_sessions
  FOR SELECT USING (TRUE);
CREATE POLICY "group_sessions_admin_all" ON group_sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "group_session_tables_public_read" ON group_session_tables
  FOR SELECT USING (TRUE);
CREATE POLICY "group_session_tables_admin_all" ON group_session_tables
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "group_session_reservations_admin_all" ON group_session_reservations
  FOR ALL USING (auth.role() = 'authenticated');

-- ceramic_pieces : anon insert, lecture via RPC seulement, admin tout
CREATE POLICY "ceramic_pieces_anon_insert" ON ceramic_pieces
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "ceramic_pieces_admin_all" ON ceramic_pieces
  FOR ALL USING (auth.role() = 'authenticated');

-- orders : anon insert, admin tout
CREATE POLICY "orders_anon_insert" ON orders
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- firing_batches : admin seulement
CREATE POLICY "firing_batches_admin_all" ON firing_batches
  FOR ALL USING (auth.role() = 'authenticated');

-- notifications_log : admin seulement
CREATE POLICY "notifications_log_admin_all" ON notifications_log
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- RPC : créneaux disponibles pour une date
-- Retourne tous les créneaux de 30 min + places dispo.
-- L'algorithme tient compte des chevauchements sur 2h30.
-- ============================================================
CREATE OR REPLACE FUNCTION get_available_slots(p_date DATE)
RETURNS TABLE (
  slot_start      TIMESTAMPTZ,
  slot_time_label TEXT,
  available_seats INTEGER,
  is_available    BOOLEAN
) AS $$
DECLARE
  v_dow       INTEGER := EXTRACT(DOW FROM p_date)::INTEGER;
  v_opens_at  TIME;
  v_closes_at TIME;
  v_slot      TIME;
  v_slot_ts   TIMESTAMPTZ;
  v_occupied  INTEGER;
BEGIN
  -- Fermeture exceptionnelle ?
  IF EXISTS (SELECT 1 FROM public.closed_dates cd WHERE cd.date = p_date) THEN
    RETURN;
  END IF;

  -- Horaires du jour
  SELECT oh.opens_at, oh.closes_at INTO v_opens_at, v_closes_at
  FROM public.opening_hours oh
  WHERE oh.day_of_week = v_dow AND oh.is_active = TRUE;

  IF NOT FOUND THEN RETURN; END IF;

  -- Générer créneaux de 30 min
  -- Dernier créneau doit commencer au plus tard à closes_at - 2h30
  v_slot := v_opens_at;
  WHILE v_slot + INTERVAL '2 hours 30 minutes' <= v_closes_at LOOP
    v_slot_ts := (p_date + v_slot) AT TIME ZONE 'Europe/Paris';

    -- Places occupées = somme des participants des réservations confirmées
    -- dont la fenêtre [starts_at ; starts_at+2h30[ chevauche ce créneau
    SELECT COALESCE(SUM(r.nb_participants), 0)
    INTO v_occupied
    FROM public.reservations r
    WHERE r.status = 'confirmed'
      AND r.starts_at < v_slot_ts + INTERVAL '2 hours 30 minutes'
      AND r.ends_at > v_slot_ts;

    slot_start      := v_slot_ts;
    slot_time_label := TO_CHAR(v_slot, 'HH24:MI');
    available_seats := GREATEST(0, 29 - v_occupied);
    is_available    := available_seats > 0;
    RETURN NEXT;

    v_slot := v_slot + INTERVAL '30 minutes';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- ============================================================
-- RPC : créer une réservation (avec protection race condition)
-- ============================================================
CREATE OR REPLACE FUNCTION create_reservation(
  p_client_id       UUID,
  p_starts_at       TIMESTAMPTZ,
  p_nb_participants INTEGER,
  p_notes           TEXT DEFAULT NULL
)
RETURNS public.reservations AS $$
DECLARE
  v_date   DATE := (p_starts_at AT TIME ZONE 'Europe/Paris')::DATE;
  v_time   TIME := (p_starts_at AT TIME ZONE 'Europe/Paris')::TIME;
  v_dow    INTEGER := EXTRACT(DOW FROM v_date)::INTEGER;
  v_occupied INTEGER;
  v_resa   public.reservations;
BEGIN
  -- Créneau dans les horaires d'ouverture ?
  IF NOT EXISTS (
    SELECT 1 FROM public.opening_hours oh
    WHERE oh.day_of_week = v_dow
      AND oh.is_active = TRUE
      AND v_time >= oh.opens_at
      AND v_time + INTERVAL '2 hours 30 minutes' <= oh.closes_at
  ) THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE: créneau hors des horaires d''ouverture';
  END IF;

  -- Fermeture exceptionnelle ?
  IF EXISTS (SELECT 1 FROM public.closed_dates cd WHERE cd.date = v_date) THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE: date fermée';
  END IF;

  -- Lock sur la tranche horaire pour éviter les race conditions
  PERFORM pg_advisory_xact_lock(
    ('x' || encode(sha256(p_starts_at::text::bytea), 'hex'))::bit(64)::bigint
  );

  -- Capacité disponible ?
  SELECT COALESCE(SUM(r.nb_participants), 0)
  INTO v_occupied
  FROM public.reservations r
  WHERE r.status = 'confirmed'
    AND r.starts_at < p_starts_at + INTERVAL '2 hours 30 minutes'
    AND r.ends_at > p_starts_at;

  IF v_occupied + p_nb_participants > 29 THEN
    RAISE EXCEPTION 'NOT_ENOUGH_SEATS: % demandées, % disponibles',
      p_nb_participants, GREATEST(0, 29 - v_occupied);
  END IF;

  INSERT INTO public.reservations (client_id, starts_at, nb_participants, status, notes)
  VALUES (p_client_id, p_starts_at, p_nb_participants, 'confirmed', p_notes)
  RETURNING * INTO v_resa;

  RETURN v_resa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================
-- RPC : annuler une réservation via cancel_token
-- Retourne si des frais s'appliquent (< 24h avant)
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_reservation(p_cancel_token TEXT)
RETURNS JSON AS $$
DECLARE
  v_resa  public.reservations;
  v_fee   BOOLEAN;
BEGIN
  SELECT * INTO v_resa
  FROM public.reservations r
  WHERE r.cancel_token = p_cancel_token
    AND r.status = 'confirmed';

  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'reason', 'NOT_FOUND');
  END IF;

  IF v_resa.starts_at < NOW() THEN
    RETURN json_build_object('success', FALSE, 'reason', 'PAST_SESSION');
  END IF;

  -- Frais si annulation < 24h avant
  v_fee := (v_resa.starts_at - NOW()) < INTERVAL '24 hours';

  UPDATE public.reservations
  SET status       = 'cancelled',
      cancelled_at = NOW()
  WHERE id = v_resa.id;

  RETURN json_build_object(
    'success',     TRUE,
    'fee_applies', v_fee,
    'fee_amount',  CASE WHEN v_fee THEN 20 ELSE 0 END,
    'reservation', row_to_json(v_resa)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================
-- RPC : récupérer une session active par token QR
-- Expire après ends_at + 30 min (sécurité)
-- ============================================================
CREATE OR REPLACE FUNCTION get_group_session_by_token(p_token TEXT)
RETURNS JSON AS $$
DECLARE
  v_session public.group_sessions;
  v_tables  JSON;
BEGIN
  SELECT * INTO v_session
  FROM public.group_sessions gs
  WHERE gs.qr_token = p_token
    AND NOW() < gs.ends_at + INTERVAL '30 minutes';

  IF NOT FOUND THEN
    RETURN json_build_object('found', FALSE);
  END IF;

  SELECT json_agg(
    json_build_object('id', pt.id, 'label', pt.label, 'seats', pt.seats)
    ORDER BY pt.id
  )
  INTO v_tables
  FROM public.group_session_tables gst
  JOIN public.physical_tables pt ON pt.id = gst.physical_table_id
  WHERE gst.group_session_id = v_session.id;

  RETURN json_build_object(
    'found',   TRUE,
    'expired', v_session.status = 'closed',
    'session', row_to_json(v_session),
    'tables',  COALESCE(v_tables, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- ============================================================
-- RPC : consultation pièce par token (sans auth)
-- ============================================================
CREATE OR REPLACE FUNCTION get_piece_by_token(p_token TEXT)
RETURNS TABLE (
  token             TEXT,
  piece_name        TEXT,
  status            TEXT,
  painted_at        TIMESTAMPTZ,
  queued_at         TIMESTAMPTZ,
  fired_at          TIMESTAMPTZ,
  ready_at          TIMESTAMPTZ,
  collected_at      TIMESTAMPTZ,
  client_first_name TEXT
) AS $$
  SELECT
    cp.token, cp.piece_name, cp.status,
    cp.painted_at, cp.queued_at, cp.fired_at, cp.ready_at, cp.collected_at,
    c.first_name
  FROM public.ceramic_pieces cp
  JOIN public.clients c ON c.id = cp.client_id
  WHERE cp.token = p_token
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';
