import { supabase } from '@/lib/supabaseClient';

export type QuoteStatusKey = 'pending' | 'signed' | 'expired' | 'draft';

export interface QuoteRoom {
  id: string;
  name: string;
  room_order: number;
  tasks: QuoteTask[];
}

export interface QuoteTask {
  id: string;
  label: string;
  unit_price_ht: number | null;
  total_price_ht: number | null;
  inputs: Record<string, unknown> | null;
  note?: string | null;
}

export interface ClientSnapshot {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  [k: string]: unknown;
}

export interface CompanySnapshot {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  siret?: string;
  [k: string]: unknown;
}

export interface QuoteRecord {
  id: string;
  reference: string;
  status: string;
  total_ht: number;
  total_ttc: number;
  tva_rate: number;
  created_at: string;
  updated_at: string;
  client: ClientSnapshot;
  company: CompanySnapshot;
  quoteNumber: string;
  date: string;
  validity: string;
  siteAddress: string;
  signature_url?: string;
  rooms?: QuoteRoom[];
}

interface RawMetadata {
  client?: ClientSnapshot;
  company?: CompanySnapshot;
  quoteNumber?: string;
  date?: string;
  validity?: string;
  siteAddress?: string;
  signature_url?: string;
  [k: string]: unknown;
}

interface RawQuote {
  id: string;
  reference: string | null;
  status: string | null;
  total_ht: number | null;
  total_ttc: number | null;
  tva_rate: number | null;
  created_at: string;
  updated_at: string;
  metadata: RawMetadata | null;
}

function mapQuote(row: RawQuote): QuoteRecord {
  const meta = row.metadata || {};
  return {
    id: row.id,
    reference: row.reference || meta.quoteNumber || 'N/A',
    status: row.status || 'Draft',
    total_ht: Number(row.total_ht || 0),
    total_ttc: Number(row.total_ttc || 0),
    tva_rate: Number(row.tva_rate || 20),
    created_at: row.created_at,
    updated_at: row.updated_at,
    client: meta.client || {},
    company: meta.company || {},
    quoteNumber: meta.quoteNumber || row.reference || 'N/A',
    date: meta.date || '',
    validity: meta.validity || '',
    siteAddress: meta.siteAddress || '',
    signature_url: meta.signature_url,
  };
}

export function classifyStatus(s: string): QuoteStatusKey {
  const x = (s || '').toLowerCase();
  if (x === 'signed' || x === 'accepted' || x === 'validated' || x.includes('sign') || x.includes('accept')) return 'signed';
  if (x === 'expired' || x.includes('expir')) return 'expired';
  if (x === 'draft') return 'draft';
  return 'pending';
}

export async function fetchUserQuotes(userId: string): Promise<QuoteRecord[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as RawQuote[] | null)?.map(mapQuote) ?? [];
}

/**
 * Fetch every devis addressed to a CLIENT, matched by the client's email.
 *
 * A client account never owns quotes — `quotes.user_id` is the *entreprise*
 * owner. The client is linked only by the email the entreprise typed into
 * `chantiers.client_email` when creating the chantier. Quotes attach to a
 * chantier via `quotes.chantier_id`, so a client finds their devis by:
 *   1. selecting the chantiers whose `client_email` == their login email,
 *   2. loading every quote attached to those chantiers.
 *
 * NOTE: the dashboard previously called `fetchUserQuotes(user.id)`, which
 * filtered by `user_id` and therefore returned NOTHING for a client. This is
 * the correct, email-scoped replacement. Reading the matching rows requires the
 * client RLS policies (see koji-main/supabase/client_access.sql); without them
 * this resolves to an empty list rather than throwing.
 */
export async function fetchClientQuotesByEmail(email: string): Promise<QuoteRecord[]> {
  const clientEmail = (email || '').trim().toLowerCase();
  if (!clientEmail) return [];

  // 1. Chantiers addressed to this client (case-insensitive email match).
  const { data: chantiers, error: chantierError } = await supabase
    .from('chantiers')
    .select('id')
    .ilike('client_email', clientEmail);

  if (chantierError) throw chantierError;

  const chantierIds = (chantiers as Array<{ id: string }> | null)?.map((c) => c.id) ?? [];
  if (chantierIds.length === 0) return [];

  // 2. Quotes attached to those chantiers.
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .in('chantier_id', chantierIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as RawQuote[] | null)?.map(mapQuote) ?? [];
}

export async function fetchQuoteById(quoteId: string): Promise<QuoteRecord | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const quote = mapQuote(data as RawQuote);

  const { data: rooms } = await supabase
    .from('quote_rooms')
    .select('id, name, room_order, quote_tasks(id, label, unit_price_ht, total_price_ht, inputs, note)')
    .eq('quote_id', quoteId)
    .order('room_order', { ascending: true });

  if (rooms) {
    quote.rooms = (rooms as Array<{ id: string; name: string; room_order: number; quote_tasks: QuoteTask[] }>).map((r) => ({
      id: r.id,
      name: r.name,
      room_order: r.room_order,
      tasks: r.quote_tasks || [],
    }));
  }

  return quote;
}

export async function submitSignature(params: {
  quoteId: string;
  userId: string;
  clientName: string;
  signatureDataUrl: string;
}): Promise<string> {
  const { quoteId, userId, clientName, signatureDataUrl } = params;

  const blob = await (await fetch(signatureDataUrl)).blob();
  const fileName = `${quoteId}_signature_${Date.now()}.png`;
  const path = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('signatures')
    .upload(path, blob, { contentType: 'image/png', upsert: false });
  if (uploadError) throw uploadError;

  const { data: pub } = supabase.storage.from('signatures').getPublicUrl(path);
  const fileUrl = pub.publicUrl;

  const { error: insertError } = await supabase.from('signatures').insert({
    user_id: userId,
    quote_id: quoteId,
    client_name: clientName,
    signature_url: fileUrl,
  });
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from('quotes')
    .update({ status: 'signed', updated_at: new Date().toISOString() })
    .eq('id', quoteId);
  if (updateError) throw updateError;

  return fileUrl;
}

export async function fetchSignatureForQuote(quoteId: string): Promise<string | null> {
  const { data } = await supabase
    .from('signatures')
    .select('signature_url')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.signature_url ?? null;
}
