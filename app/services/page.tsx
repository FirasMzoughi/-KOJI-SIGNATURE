import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { services } from '@/data/services';
import { Check, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24">
        <div className="bg-accent/5 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Nos Services</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nous offrons une suite complète de services d'architecture et de design d'intérieur, du concept initial à la livraison finale.
            </p>
          </div>
        </div>

        <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <div key={service.id} className={`flex flex-col gap-6 p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow ${index % 2 === 0 ? 'md:translate-y-0' : 'md:translate-y-12'}`}>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {/* Icon placeholder logic */}
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                    <span className="block mt-2">
                      Nous gérons tout, des permis à l'approvisionnement, pour une expérience sans faille.
                    </span>
                  </p>
                  <ul className="space-y-2 mb-6">
                    {['Consultation', 'Design', 'Exécution', 'Livraison'].map(step => (
                      <li key={step} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {step}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 text-center">
          <p className="text-muted-foreground mb-6">Besoin d'une solution sur mesure ?</p>
          <Link href="/contact">
            <Button>Contactez-nous</Button>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
