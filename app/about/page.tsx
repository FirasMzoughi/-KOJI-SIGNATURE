import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold">Notre Histoire</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Fondée sur des principes de précision et d'élégance, Koji Signature transforme les espaces depuis plus d'une décennie. Nous croyons que l'environnement façonne l'expérience.
            </p>
          </div>
        </section>

        <section className="py-12 bg-accent/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80"
                alt="Architects at work"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold">Le Standard Koji</h2>
              <p className="text-muted-foreground">
                Notre nom "Koji" représente le catalyseur de la transformation. Tout comme le koji crée de la profondeur et de la complexité dans les arts culinaires, nous apportons profondeur et caractère à l'architecture.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">Design</h3>
                  <p className="text-sm text-muted-foreground">Mêler esthétique et fonctionnalité extrême.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Construction</h3>
                  <p className="text-sm text-muted-foreground">Artisanat de maître sans aucun compromis.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
