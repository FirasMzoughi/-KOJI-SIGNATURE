-- Drop existing function first because we are changing the return type to json
DROP FUNCTION IF EXISTS get_quote_for_client(uuid, text);

-- Create or replace RPC function to get quote with rooms and tasks, bypassing RLS
CREATE OR REPLACE FUNCTION get_quote_for_client(p_quote_id uuid, p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote json;
  v_rooms json;
BEGIN
  -- Authorize either by quote_id alone (when email is empty/null) or by id+email match.
  -- The quote UUID acts as an unguessable token when email is not provided in the link.
  IF NOT EXISTS (
    SELECT 1 FROM quotes
    WHERE id = p_quote_id
      AND (
        p_email IS NULL OR TRIM(p_email) = '' OR
        LOWER(TRIM(client_email)) = LOWER(TRIM(p_email)) OR
        LOWER(TRIM(metadata->'client'->>'email')) = LOWER(TRIM(p_email))
      )
  ) THEN
    RETURN NULL;
  END IF;

  -- Build rooms array with tasks
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', r.id,
      'name', r.name,
      'quote_tasks', (
        SELECT COALESCE(json_agg(t), '[]'::json)
        FROM quote_tasks t
        WHERE t.room_id = r.id
      )
    )
  ), '[]'::json)
  INTO v_rooms
  FROM quote_rooms r
  WHERE r.quote_id = p_quote_id;

  -- Return quote object with quote_rooms included
  SELECT json_build_object(
    'id', q.id,
    'status', q.status,
    'created_at', q.created_at,
    'metadata', q.metadata,
    'total_ht', q.total_ht,
    'total_ttc', q.total_ttc,
    'total', q.total_ttc, -- Fallback
    'client_name', q.metadata->'client'->>'name',
    'client_email', q.metadata->'client'->>'email',
    'signature_data', q.signature_data,
    'signed_at', q.signed_at,
    'quote_rooms', v_rooms
  )
  INTO v_quote
  FROM quotes q
  WHERE q.id = p_quote_id;

  RETURN v_quote;
END;
$$;

-- Create or replace RPC function to submit signature
CREATE OR REPLACE FUNCTION submit_quote_signature(
  p_quote_id uuid, 
  p_email text, 
  p_signature_data text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows_updated integer;
BEGIN
  -- Update the quote if email matches, or if no email was provided (id-only access via unguessable UUID)
  UPDATE quotes
  SET
    signature_data = p_signature_data,
    signed_at = NOW(),
    status = 'accepte'
  WHERE id = p_quote_id
    AND (
      p_email IS NULL OR TRIM(p_email) = '' OR
      LOWER(TRIM(client_email)) = LOWER(TRIM(p_email)) OR
      LOWER(TRIM(metadata->'client'->>'email')) = LOWER(TRIM(p_email))
    );
  
  -- Get the number of rows updated
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  
  -- Return true if at least one row was updated
  RETURN v_rows_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION get_quote_for_client(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_quote_signature(uuid, text, text) TO anon, authenticated;
