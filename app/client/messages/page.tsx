'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Paperclip } from 'lucide-react';
import { useState } from 'react';

export default function MessagesPage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Chef de Projet', text: 'Bonjour Alex, je vérifie juste si vous avez reçu le devis mis à jour ?', time: 'Il y a 2 heures', isMe: false },
    { id: 2, sender: 'Vous', text: 'Oui, je regarde ça maintenant. Merci !', time: 'Il y a 1 heure', isMe: true },
  ]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">Messages</h1>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-accent/5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-4 ${msg.isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                <p className="text-sm font-semibold mb-1 opacity-80">{msg.sender}</p>
                <p>{msg.text}</p>
                <p className="text-xs mt-2 opacity-50 text-right">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-background border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Input placeholder="Tapez votre message..." className="flex-1" />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
