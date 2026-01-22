'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, MessageSquare, LogOut, ShieldCheck } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navigation = [
  { name: 'Tableau de bord', href: '/client', icon: LayoutDashboard },
  { name: 'Devis', href: '/client/quotes', icon: FileText },
  { name: 'Messages', href: '/client/messages', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useClientStore();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Image */}
          <div className="relative h-8 w-8">
            <img src="/logo.png" alt="Koji Logo" className="object-contain" />
          </div>
          <span className="font-serif font-bold text-lg">Koji Client</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-4 flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/client' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                    'mr-3 h-5 w-5 flex-shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.company}</p>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={logout}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-red-600" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
