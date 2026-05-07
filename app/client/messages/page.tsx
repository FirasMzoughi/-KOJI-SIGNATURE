'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Send, Paperclip, Phone, MoreVertical } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  date: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Bonjour ! J'ai bien reçu votre devis et je vais l'examiner attentivement.",
    fromMe: false,
    date: 'Il y a 2 heures',
  },
  {
    id: '2',
    text: 'Oui, je regarde ça maintenant. Merci !',
    fromMe: true,
    date: 'Il y a 1 heure',
  },
];

export default function MessagesPage() {
  const user = useClientStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), text, fromMe: true, date: "À l'instant" }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Messages" subtitle="Échangez avec votre conseiller dédié." />

      <div className="flex-1 flex flex-col px-10 pb-6 min-h-0">
        <div className="flex-1 flex flex-col bg-gray-50/50 border border-gray-100 rounded-2xl overflow-hidden min-h-0">
          {/* Conversation header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  SD
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Sophie Danvers</p>
                <p className="text-xs text-emerald-600 font-semibold">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-3 rounded-2xl ${
                  m.fromMe
                    ? 'bg-[#1D5FE1] text-white rounded-br-md shadow-md shadow-[#1D5FE1]/20'
                    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${m.fromMe ? 'text-white/70' : 'text-gray-400'}`}>
                    {m.fromMe ? 'Vous' : 'Sophie Danvers'}
                  </p>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <p className={`text-[10px] mt-2 ${m.fromMe ? 'text-white/60' : 'text-gray-400'}`}>{m.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-3 px-6 py-4 bg-white border-t border-gray-100">
            <button type="button" className="h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-transparent rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#1D5FE1]/30 focus:ring-2 focus:ring-[#1D5FE1]/10 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-[#1D5FE1] hover:bg-blue-700 disabled:opacity-40 text-white shadow-lg shadow-[#1D5FE1]/30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
