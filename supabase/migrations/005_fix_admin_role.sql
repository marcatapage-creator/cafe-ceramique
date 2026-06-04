-- ============================================================
-- Café Céramique — Correction rôle admin
-- Migration 005
-- ============================================================
-- Problème : is_admin() retournait TRUE pour tout utilisateur
-- authentifié (la clause EXISTS auth.users est triviale).
-- Les policies "admin_all" utilisaient auth.role() = 'authenticated'
-- au lieu de is_admin(), ouvrant l'accès à n'importe quel compte.
--
-- Correction : is_admin() lit app_metadata.role dans le JWT.
-- app_metadata ne peut être posé que par le service_role (pas par
-- l'utilisateur lui-même), ce qui en fait le vecteur sûr pour RBAC.
--
-- Setup requis (une seule fois, hors migration) :
--   Dashboard Supabase → Authentication → Users → Edit
--   App Metadata : {"role": "admin"}
-- Ou via CLI :
--   supabase auth admin update-user <user-id> \
--     --app-metadata '{"role":"admin"}'
-- ============================================================

-- ============================================================
-- 1. Réécriture de is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- ============================================================
-- 2. Policies admin — sessions
-- ============================================================
DROP POLICY IF EXISTS "sessions_admin_all" ON public.sessions;
CREATE POLICY "sessions_admin_all" ON public.sessions
  FOR ALL USING (is_admin());

-- ============================================================
-- 3. Policies admin — physical_tables
-- ============================================================
DROP POLICY IF EXISTS "physical_tables_admin_all" ON public.physical_tables;
CREATE POLICY "physical_tables_admin_all" ON public.physical_tables
  FOR ALL USING (is_admin());

-- ============================================================
-- 4. Policies admin — table_groups
-- ============================================================
DROP POLICY IF EXISTS "table_groups_admin_all" ON public.table_groups;
CREATE POLICY "table_groups_admin_all" ON public.table_groups
  FOR ALL USING (is_admin());

-- ============================================================
-- 5. Policies admin — table_group_members
-- ============================================================
DROP POLICY IF EXISTS "table_group_members_admin_all" ON public.table_group_members;
CREATE POLICY "table_group_members_admin_all" ON public.table_group_members
  FOR ALL USING (is_admin());

-- ============================================================
-- 6. Policies admin — clients
-- ============================================================
DROP POLICY IF EXISTS "clients_admin_all" ON public.clients;
CREATE POLICY "clients_admin_all" ON public.clients
  FOR ALL USING (is_admin());

-- ============================================================
-- 7. Policies admin — reservations
-- ============================================================
DROP POLICY IF EXISTS "reservations_admin_all" ON public.reservations;
CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL USING (is_admin());

-- ============================================================
-- 8. Policies admin — ceramic_pieces
-- ============================================================
DROP POLICY IF EXISTS "ceramic_pieces_admin_all" ON public.ceramic_pieces;
CREATE POLICY "ceramic_pieces_admin_all" ON public.ceramic_pieces
  FOR ALL USING (is_admin());

-- ============================================================
-- 9. Policies admin — firing_batches
-- ============================================================
DROP POLICY IF EXISTS "firing_batches_admin_all" ON public.firing_batches;
CREATE POLICY "firing_batches_admin_all" ON public.firing_batches
  FOR ALL USING (is_admin());

-- ============================================================
-- 10. Policies admin — orders
-- ============================================================
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (is_admin());

-- ============================================================
-- 11. Policies admin — notifications_log
-- ============================================================
DROP POLICY IF EXISTS "notifications_log_admin_all" ON public.notifications_log;
CREATE POLICY "notifications_log_admin_all" ON public.notifications_log
  FOR ALL USING (is_admin());
