-- ============================================================
-- Café Céramique — Sprint 2 : QR codes fixes + statuts session
-- Migration 004
-- ============================================================

-- sessions.status : cycle de vie d'un créneau
ALTER TABLE sessions
  ADD COLUMN status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'active', 'closed'));

-- physical_tables.qr_url : chemin statique encodé dans le QR imprimé
ALTER TABLE physical_tables
  ADD COLUMN qr_url TEXT;

-- Peupler qr_url pour les 15 tables existantes
UPDATE physical_tables SET qr_url = '/table/' || id;

-- Index sur sessions.status pour la détection rapide au scan
CREATE INDEX idx_sessions_status ON sessions(status);

-- ============================================================
-- RPC : état de la page table au moment du scan
-- Retourne : state ('active'|'waiting'), session courante, prochaine session
-- ============================================================
CREATE OR REPLACE FUNCTION get_table_page_state(p_table_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_now        TIME    := NOW()::TIME;
  v_today      DATE    := CURRENT_DATE;
  v_active     RECORD;
  v_next       RECORD;
BEGIN
  -- Session active : statut forcé par le gérant OU fenêtre horaire courante
  SELECT * INTO v_active
  FROM public.sessions
  WHERE is_active = TRUE
    AND (
      status = 'active'
      OR (date = v_today AND start_time <= v_now AND end_time > v_now AND status != 'closed')
    )
  ORDER BY date, start_time
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'state',   'active',
      'session', row_to_json(v_active)
    );
  END IF;

  -- Prochaine session planifiée
  SELECT * INTO v_next
  FROM public.sessions
  WHERE is_active = TRUE
    AND status NOT IN ('closed')
    AND (date > v_today OR (date = v_today AND start_time > v_now))
  ORDER BY date, start_time
  LIMIT 1;

  RETURN json_build_object(
    'state',        'waiting',
    'next_session', CASE WHEN v_next IS NOT NULL THEN row_to_json(v_next) ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';
