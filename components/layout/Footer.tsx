import Link from 'next/link';
import { ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <img src="/logo.png" alt="Koji Logo" className="object-contain" />
              </div>
              <span className="font-serif text-2xl font-bold">Koji Signature</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground max-w-xs">
              Des espaces méticuleusement conçus pour le professionnel moderne. Nous donnons vie à votre vision avec précision et élégance.
            </p>
            <div className="flex space-x-6">
              {/* Social icons would go here */}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Services</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/services" className="text-sm leading-6 text-muted-foreground hover:text-white">Rénovation</Link></li>
                  <li><Link href="/services" className="text-sm leading-6 text-muted-foreground hover:text-white">Aménagement</Link></li>
                  <li><Link href="/services" className="text-sm leading-6 text-muted-foreground hover:text-white">Gestion de Projet</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Entreprise</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/about" className="text-sm leading-6 text-muted-foreground hover:text-white">À propos</Link></li>
                  <li><Link href="/portfolio" className="text-sm leading-6 text-muted-foreground hover:text-white">Portfolio</Link></li>
                  <li><Link href="/contact" className="text-sm leading-6 text-muted-foreground hover:text-white">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Légal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/legal/privacy" className="text-sm leading-6 text-muted-foreground hover:text-white">Confidentialité</Link></li>
                  <li><Link href="/legal/terms" className="text-sm leading-6 text-muted-foreground hover:text-white">Conditions</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Contact</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> 123 Design District
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" /> +1 (555) 123-4567
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> hello@koji-sig.com
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-muted-foreground">&copy; 2024 Koji Signature. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
