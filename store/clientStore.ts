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
  addQuoteMessage: (id: string, text: string, files: File[]) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
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

      // Fetch messages from API
      let comments = [];
      try {
        const msgRes = await fetch(`/api/quotes/${id}/messages`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          comments = msgData.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            author: msg.author_name || 'Inconnu',
            author_email: msg.author_email,
            date: msg.created_at,
            attachments: (msg.attachments || []).map((att: any) => ({
              id: att.id,
              bucket_id: att.bucket_id,
              file_path: att.file_path,
              mime_type: att.mime_type,
              file_size: att.file_size,
              original_name: att.original_name,
              signedUrl: att.signedUrl
            }))
          }));
        }
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }

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
        comments: comments
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

  addQuoteMessage: async (id, text, files) => {
    try {
      const { user } = get();
      const formData = new FormData();
      formData.append('text', text);
      formData.append('authorName', user?.name || 'Client');
      formData.append('authorEmail', user?.email || '');

      files.forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch(`/api/quotes/${id}/messages`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to send message');

      const newMessage = await res.json();

      // Map back to local state format
      const mappedMessage = {
        id: newMessage.id,
        text: newMessage.text,
        author: newMessage.author_name,
        date: newMessage.created_at,
        attachments: (newMessage.attachments || []).map((att: any) => ({
          id: att.id,
          bucket_id: att.bucket_id,
          file_path: att.file_path,
          mime_type: att.mime_type,
          file_size: att.file_size,
          original_name: att.original_name,
          signedUrl: att.signedUrl
        }))
      };

      set((state) => ({
        quotes: state.quotes.map((q) =>
          q.id === id
            ? { ...q, comments: [...(q.comments || []), mappedMessage] }
            : q
        ),
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
}));

export const initializeQuotes = (quotes: Quote[]) => {
  useClientStore.setState({ quotes });
}
