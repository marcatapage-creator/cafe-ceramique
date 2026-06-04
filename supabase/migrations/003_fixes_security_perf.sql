-- ============================================================
-- Café Céramique — Correctifs sécurité & performance
-- Migration 003 — Sprint 1
-- ============================================================

-- ============================================================
-- SÉCURITÉ : search_path fixé sur toutes les SECURITY DEFINER
-- Sans ça, un attaquant peut manipuler le search_path pour
-- rediriger les appels vers ses propres fonctions.
-- ============================================================

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
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

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
  FROM public.ceramic_pieces cp
  JOIN public.clients c ON c.id = cp.client_id
  WHERE cp.token = p_token
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION get_session_available_seats(p_session_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_capacity    INTEGER;
  v_reserved    INTEGER;
BEGIN
  SELECT capacity INTO v_capacity FROM public.sessions WHERE id = p_session_id;

  SELECT COALESCE(SUM(r.nb_participants), 0)
  INTO v_reserved
  FROM public.reservations r
  WHERE r.session_id = p_session_id
    AND r.status NOT IN ('cancelled');

  RETURN GREATEST(0, v_capacity - v_reserved);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION create_reservation(
  p_session_id      UUID,
  p_client_id       UUID,
  p_nb_participants INTEGER,
  p_notes           TEXT DEFAULT NULL
)
RETURNS public.reservations AS $$
DECLARE
  v_available INTEGER;
  v_resa      public.reservations;
BEGIN
  PERFORM id FROM public.sessions WHERE id = p_session_id FOR UPDATE;

  SELECT get_session_available_seats(p_session_id) INTO v_available;

  IF v_available < p_nb_participants THEN
    RAISE EXCEPTION 'NOT_ENOUGH_SEATS: % places demandées, % disponibles',
      p_nb_participants, v_available;
  END IF;

  INSERT INTO public.reservations (session_id, client_id, nb_participants, status, notes, confirmed_at)
  VALUES (p_session_id, p_client_id, p_nb_participants, 'confirmed', p_notes, NOW())
  RETURNING * INTO v_resa;

  RETURN v_resa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ============================================================
-- PERFORMANCE : indexes manquants sur clés étrangères
-- Supabase signale chaque FK sans index comme "perf issue".
-- ============================================================

-- table_groups
CREATE INDEX IF NOT EXISTS idx_table_groups_session
  ON public.table_groups(session_id);

CREATE INDEX IF NOT EXISTS idx_table_groups_reference_table
  ON public.table_groups(reference_table);

-- table_group_members
CREATE INDEX IF NOT EXISTS idx_table_group_members_group
  ON public.table_group_members(table_group_id);

CREATE INDEX IF NOT EXISTS idx_table_group_members_table
  ON public.table_group_members(physical_table_id);

-- reservations
CREATE INDEX IF NOT EXISTS idx_reservations_table_group
  ON public.reservations(table_group_id);

-- ceramic_pieces
CREATE INDEX IF NOT EXISTS idx_ceramic_pieces_session
  ON public.ceramic_pieces(session_id);

CREATE INDEX IF NOT EXISTS idx_ceramic_pieces_table_group
  ON public.ceramic_pieces(table_group_id);

CREATE INDEX IF NOT EXISTS idx_ceramic_pieces_firing_batch
  ON public.ceramic_pieces(firing_batch_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_client
  ON public.orders(client_id);

-- notifications_log
CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON public.notifications_log(type);
