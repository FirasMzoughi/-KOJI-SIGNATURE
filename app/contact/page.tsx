import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24">
        <div className="bg-primary text-primary-foreground py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Contactez-nous</h1>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              Prêt à démarrer votre projet ? Contactez-nous pour une consultation ou un devis.
            </p>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <Card className="p-8 space-y-8 bg-card text-card-foreground">
              <h3 className="text-xl font-bold font-serif">Informations de Contact</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <p className="font-medium">Siège Social</p>
                    <p className="text-muted-foreground text-sm">123 Design District,<br />New York, NY 10012</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground text-sm">hello@koji-sig.com</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Form */}
            <Card className="lg:col-span-2 p-8 bg-card">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prénom</label>
                    <Input placeholder="Jean" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input placeholder="Dupont" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="jean@entreprise.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Détails du Projet</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Parlez-nous de votre projet..."
                  />
                </div>
                <Button type="button" className="w-full md:w-auto h-12 px-8">Envoyer</Button>
              </form>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
