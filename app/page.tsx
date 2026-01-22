'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Zap, ScanLine, Smartphone, ShieldCheck, LayoutDashboard, FileText } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const quoteId = searchParams?.get('quoteId');
    const email = searchParams?.get('email');

    if (quoteId) {
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : '';
      router.push(`/client/quotes/${quoteId}${emailParam}`);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            {/* Abstract Tech/Professional Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 z-10" />
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
              alt="Workspace"
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold font-serif tracking-tight text-foreground">
              {/* Vos Devis. <br className="hidden md:block" /> */}
              <span className="text-primary">Signé votre devis.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              envoyez et faites signer vos devis simplement. La solution de gestion tout-en-un pour les artisans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/client">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                  Essayer Koji
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/roadmap">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">
                  Voir la Roadmap
                </Button>
              </Link>
            </div>

            {/* Tech Stack / V0 Tag */}
            <div className="pt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs">v0.1.0 Bêta</span>
              <span>• Conçu pour les Peintres & Artisans</span>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-12 border-y border-border/50 bg-accent/30">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Ultra Rapide</h3>
              <p className="text-sm text-muted-foreground">Créez des documents professionnels avec un flux de travail simple et optimisé.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ScanLine className="h-8 w-8 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Extraction IA</h3>
              <p className="text-sm text-muted-foreground">Téléchargez une facture existante et laissez Koji extraire les données pour vous.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Smartphone className="h-8 w-8 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Mobile First</h3>
              <p className="text-sm text-muted-foreground">Gérez votre entreprise depuis le chantier, pas seulement depuis le bureau.</p>
            </div>
          </div>
        </section>

        {/* Features / "What Koji Does" */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Gérez votre business, pas la paperasse</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Tout ce dont vous avez besoin pour piloter votre activité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <Card className="p-8 hover:border-primary/50 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Documents Professionnels</h3>
                <p className="text-muted-foreground">
                  Des devis et factures impeccables, envoyés et signés en un clic.
                </p>
              </Card>

              <Card className="p-8 hover:border-primary/50 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Espace Client</h3>
                <p className="text-muted-foreground">
                  Un portail dédié pour que vos clients valident vos devis instantanément.
                </p>
              </Card>

              <Card className="p-8 hover:border-primary/50 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <ScanLine className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Propulsé par l'IA (V0)</h3>
                <p className="text-muted-foreground">
                  Scan et saisie automatique de vos documents grâce à l'IA.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Roadmap Preview */}
        <section className="py-24 bg-accent/5 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">La Roadmap Koji</h2>
                <p className="text-muted-foreground">Du MVP au système d'exploitation complet.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="relative p-6 border rounded-xl bg-card">
                <div className="absolute top-0 right-0 p-4">
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="text-4xl font-bold text-primary/20 mb-4">01</div>
                <h4 className="font-bold text-lg mb-2">V0: MVP</h4>
                <p className="text-sm text-muted-foreground">Création de devis de base, génération PDF et tests simples d'extraction IA.</p>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 border rounded-xl bg-card/50">
                <div className="absolute top-0 right-0 p-4">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="text-4xl font-bold text-primary/20 mb-4">02</div>
                <h4 className="font-bold text-lg mb-2">V1: Espace Client</h4>
                <p className="text-sm text-muted-foreground">Signatures numériques, comptes clients et suivi en temps réel.</p>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 border border-dashed rounded-xl opacity-75">
                <div className="text-4xl font-bold text-muted/20 mb-4">03</div>
                <h4 className="font-bold text-lg mb-2">V2: Paiements</h4>
                <p className="text-sm text-muted-foreground">Paiements Stripe intégrés et demandes d'acompte automatisées.</p>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 border border-dashed rounded-xl opacity-75">
                <div className="text-4xl font-bold text-muted/20 mb-4">04</div>
                <h4 className="font-bold text-lg mb-2">V4: OS Complet</h4>
                <p className="text-sm text-muted-foreground">CRM complet, gestion des stocks et planning d'équipe.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Conçu pour votre entreprise.</h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Rejoignez les artisans qui gagnent du temps et signent plus de chantiers avec Koji.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/client">
                <Button size="lg" className="h-14 px-10 text-lg bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Commencer Gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
