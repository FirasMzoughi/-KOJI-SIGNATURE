'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      router.push('/client');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 bg-[#0E172C] rounded-2xl mx-auto flex items-center justify-center mb-6 border border-gray-800 shadow-xl overflow-hidden">
            <img src="/logo.png" alt="Koji Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Connexion</h1>
          <p className="text-sm text-gray-500">Entrez vos identifiants pour accéder à vos devis</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F0F4FF] border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1D5FE1]/30 focus:border-[#1D5FE1] transition-all outline-none text-gray-900 font-medium"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F0F4FF] border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1D5FE1]/30 focus:border-[#1D5FE1] transition-all outline-none text-gray-900 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3.5 bg-[#1D5FE1] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-[#1D5FE1]/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
          </button>

          <div className="text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="text-[#1D5FE1] hover:text-blue-800 font-bold transition-colors">
              S&apos;inscrire
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
