import { create } from 'zustand';
import { Quote, QuoteStatus } from '@/types';
import { supabase } from '@/lib/supabaseClient';

interface ClientState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    company: string;
  } | null;
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  fetchQuote: (id: string, email?: string) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteStatus, signature?: string) => Promise<void>;
  updateQuoteStartDate: (id: string, date: string) => Promise<void>;
  addQuoteComment: (id: string, comment: string, attachments?: string[]) => Promise<void>;
}

export const useClientStore = create<ClientState>((set) => ({
  isAuthenticated: true, // Mock auth true by default for demo
  user: {
    name: "Alex Morgan",
    email: "alex@creative.com",
    company: "Morgan Creative Group",
  },
  quotes: [],
  isLoading: false,
  error: null,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false, user: null }),

  fetchQuote: async (id: string, email?: string) => {
    set({ isLoading: true, error: null });
    try {
      let data, error;

      if (email) {
        // Try RPC first if email is available (secure access)
        const response = await supabase.rpc('get_quote_for_client', {
          p_quote_id: id,
          p_email: email
        });

        data = response.data;
        error = response.error;

        if (Array.isArray(data)) {
          data = data[0];
        }

      } else {
        // Fallback to direct select (for public quotes or if no email passed)
        const response = await supabase
          .from('quotes')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = response.data;
        error = response.error;
      }

      if (error) throw error;
      if (!data) throw new Error("Quote not found or access denied.");

      const mappedQuote: Quote = {
        id: data.id,
        // Handle both camelCase (from accessors/views) and snake_case (raw tables)
        clientName: data.client_name || data.clientName,
        clientEmail: data.client_email || data.clientEmail,
        projectTitle: data.project_title || data.projectTitle,
        status: data.status,
        issuedDate: data.created_at || data.issuedDate,
        validUntil: data.valid_until || data.validUntil,
        startDate: data.start_date || data.startDate,
        items: data.items || [],
        total: data.total || data.total_amount,
        signature: data.signature_data || data.signature,
        signedAt: data.signed_at || data.signedAt,
        comments: []
      };
      set({ quotes: [mappedQuote] });

    } catch (err: any) {
      console.error('Error fetching quote:', err);
      let errorMessage = 'An error occurred';

      if (typeof err === 'object' && err !== null) {
        if ('message' in err) {
          errorMessage = err.message;
        } else if ('error_description' in err) {
          errorMessage = err.error_description;
        } else {
          errorMessage = JSON.stringify(err);
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuoteStatus: async (id, status, signature) => {
    const currentQuote = useClientStore.getState().quotes.find(q => q.id === id);

    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id
          ? { ...q, status: signature ? 'accepte' : status, signature, signedAt: signature ? new Date().toISOString() : undefined }
          : q
      ),
    }));

    try {
      if (signature && currentQuote?.clientEmail) {
        // Use the secure RPC function for signature submission
        const { data, error } = await supabase.rpc('submit_quote_signature', {
          p_quote_id: id,
          p_email: currentQuote.clientEmail,
          p_signature_data: signature
        });

        if (error) {
          console.error("RPC Error:", error);
          throw error;
        }

        console.log("Signature submitted successfully:", data);
      } else {
        // Direct update for rejection (no signature)
        const { error } = await supabase
          .from('quotes')
          .update({ status })
          .eq('id', id);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to update status in Supabase", error);
    }
  },

  updateQuoteStartDate: async (id, date) => {
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id ? { ...q, startDate: date } : q
      ),
    }));
    try {
      await supabase.from('quotes').update({
        start_date: date
      }).eq('id', id);
    } catch (error) {
      console.error("Failed to update start date", error);
    }
  },

  addQuoteComment: async (id, text, attachments) => {
    set((state) => {
      const newComment = {
        id: Math.random().toString(36).substring(7),
        text,
        author: state.user?.name || "Client",
        date: new Date().toISOString(),
        attachments,
      };
      return {
        quotes: state.quotes.map((q) =>
          q.id === id
            ? { ...q, comments: [...(q.comments || []), newComment] }
            : q
        ),
      };
    });
  },
}));

export const initializeQuotes = (quotes: Quote[]) => {
  useClientStore.setState({ quotes });
}
