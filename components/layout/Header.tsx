'use client';

import { Search, Bell, HelpCircle } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const user = useClientStore((s) => s.user);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="flex items-start justify-between gap-6 px-10 pt-8 pb-4 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un utilisateur..."
            className="pl-11 pr-4 py-2.5 w-80 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D5FE1]/20 focus:border-[#1D5FE1]/40 transition-all"
          />
        </div>

        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500">{user?.company || 'Client'}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
