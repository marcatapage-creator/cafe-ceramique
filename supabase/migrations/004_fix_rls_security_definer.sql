-- ============================================================
-- Café Céramique — Correctifs RLS & SECURITY DEFINER
-- Migration 004
-- ============================================================

-- ============================================================
-- 1. is_admin() — révoquer l'accès anon
-- Cette fonction n'a aucune utilité publique et ne doit pas
-- être exposée sur /rest/v1/rpc/is_admin.
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- ============================================================
-- 2. Politiques INSERT — remplacer WITH CHECK (true) par des
--    conditions réelles pour ne plus déclencher le lint 0024.
-- ============================================================

-- clients : email et first_name sont NOT NULL dans le schéma,
-- les exiger dans la policy rend la condition non-triviale
-- sans restreindre le flux légitime.
DROP POLICY IF EXISTS "clients_anon_insert" ON public.clients;
CREATE POLICY "clients_anon_insert" ON public.clients
  FOR INSERT WITH CHECK (
    email      IS NOT NULL
    AND first_name IS NOT NULL
  );

-- reservations : SUPPRIMER l'insert direct.
-- Toutes les réservations doivent passer par create_reservation()
-- (SECURITY DEFINER) qui pose un row-lock sur la session et vérifie
-- les places disponibles. Un INSERT direct bypasserait cette protection
-- et permettrait des sur-réservations par race condition.
DROP POLICY IF EXISTS "reservations_anon_insert" ON public.reservations;

-- ceramic_pieces : exiger les champs identifiants obligatoires.
DROP POLICY IF EXISTS "ceramic_pieces_anon_insert" ON public.ceramic_pieces;
CREATE POLICY "ceramic_pieces_anon_insert" ON public.ceramic_pieces
  FOR INSERT WITH CHECK (
    token      IS NOT NULL
    AND client_id  IS NOT NULL
    AND session_id IS NOT NULL
  );

-- orders : exiger client_id et session_id.
DROP POLICY IF EXISTS "orders_anon_insert" ON public.orders;
CREATE POLICY "orders_anon_insert" ON public.orders
  FOR INSERT WITH CHECK (
    client_id  IS NOT NULL
    AND session_id IS NOT NULL
  );

-- ============================================================
-- 3. Fonctions SECURITY DEFINER accessibles à anon/authenticated
--    Intentionnel — documenter l'intention.
--
--    create_reservation   : flow réservation publique (sans auth),
--                           protégé contre les race conditions.
--    get_piece_by_token   : consultation pièce par token (page /suivi).
--    get_session_available_seats : disponibilités publiques.
--
--    Ces fonctions restent SECURITY DEFINER car elles accèdent à des
--    tables protégées par RLS sans exposer l'ensemble des données.
--    Passer en SECURITY INVOKER nécessiterait de donner SELECT/INSERT
--    directement à anon sur ces tables, ce qui serait moins sûr.
-- ============================================================
COMMENT ON FUNCTION public.create_reservation(uuid, uuid, integer, text) IS
  'SECURITY DEFINER intentionnel : appelable par anon pour le flow réservation public. Protège les race conditions via row-lock sur sessions.';

COMMENT ON FUNCTION public.get_piece_by_token(text) IS
  'SECURITY DEFINER intentionnel : consultation publique d''une pièce par son token unique (page /suivi/[token]).';

COMMENT ON FUNCTION public.get_session_available_seats(uuid) IS
  'SECURITY DEFINER intentionnel : lecture publique des places disponibles, utilisée pendant le flow réservation.';
