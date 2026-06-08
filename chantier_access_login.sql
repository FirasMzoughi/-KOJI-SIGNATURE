-- ============================================================================
-- Per-chantier access login (Identifiant + Mot de passe)
-- ----------------------------------------------------------------------------
-- Goal: the entreprise sends the client a per-quote access *code* + *password*
-- (instead of an email/Google account). The client enters those on the
-- signature site / app and is taken straight to their devis to view + sign.
--
-- Run this whole file in the Supabase SQL editor (Project → SQL → New query).
-- Safe to run more than once (idempotent: IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- 1) Credential columns on the quote ----------------------------------------
--    access_code     : short human-typable id, e.g. KOJI-7F3A2B (unique).
--    access_password : the per-quote password (stored as-is; see note below).
--
-- NOTE on hashing: Supabase RPCs run server-side, so we *could* bcrypt the
-- password with pgcrypto. We keep it plain here to stay dependency-free and
-- because the code itself is already an unguessable secret delivered out of
-- band. If you want hashing later, enable pgcrypto and switch the compare in
-- login_with_access_code to crypt(p_password, access_password).
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS access_code text,
  ADD COLUMN IF NOT EXISTS access_password text;

-- Fast, case-insensitive lookups by code; codes are unique across quotes.
CREATE UNIQUE INDEX IF NOT EXISTS quotes_access_code_key
  ON quotes (UPPER(access_code))
  WHERE access_code IS NOT NULL;

-- 2) Write credentials for a quote (called by the entreprise app on save) ----
--    SECURITY DEFINER so the owning app can set them regardless of RLS. We
--    only allow setting them when they are not already set, or by the quote
--    owner (user_id = auth.uid()), so a client can never overwrite them.
CREATE OR REPLACE FUNCTION set_quote_access_credentials(
  p_quote_id uuid,
  p_access_code text,
  p_access_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE quotes
  SET access_code = p_access_code,
      access_password = p_access_password
  WHERE id = p_quote_id
    AND (
      user_id = auth.uid()           -- owner can (re)set
      OR access_code IS NULL         -- or first-time assignment
    );

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- 3) Verify a code + password, return the quote id ---------------------------
--    Called by the (anonymous) client login. Returns the matching quote id, or
--    NULL when the pair is wrong. Case-insensitive on the code; exact on the
--    password.
CREATE OR REPLACE FUNCTION login_with_access_code(
  p_code text,
  p_password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id
  FROM quotes
  WHERE access_code IS NOT NULL
    AND UPPER(TRIM(access_code)) = UPPER(TRIM(COALESCE(p_code, '')))
    AND access_password = COALESCE(p_password, '')
  LIMIT 1;

  RETURN v_id; -- NULL when no match
END;
$$;

-- 4) Grants ------------------------------------------------------------------
-- Login must work for anonymous visitors; credential-setting for the signed-in
-- entreprise (authenticated). anon may also call set_* for the brief window the
-- app writes them right after insert (guarded by access_code IS NULL above).
GRANT EXECUTE ON FUNCTION login_with_access_code(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_quote_access_credentials(uuid, text, text) TO anon, authenticated;
