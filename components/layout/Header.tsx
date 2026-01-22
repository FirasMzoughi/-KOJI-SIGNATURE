'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Espace Client', href: '/client' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="sr-only">Koji Signature</span>
            {/* Logo Image */}
            <div className="relative h-10 w-10">
              <img src="/logo.png" alt="Koji Logo" className="object-contain" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              KOJI <span className="text-primary">SIGNATURE</span>
            </span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6 transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
          <ThemeToggle />
          <Link href="/contact">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Demander un devis
            </Button>
          </Link>
        </div>
      </nav>
      {/* Mobile menu */}
      <div className={cn("lg:hidden", mobileMenuOpen ? "fixed inset-0 z-50" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <div className="relative h-8 w-8">
                <img src="/logo.png" alt="Koji Logo" className="object-contain" />
              </div>
              <span className="font-bold text-lg">Koji Signature</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6 flex flex-col gap-4">
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-semibold text-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Demander un devis</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
