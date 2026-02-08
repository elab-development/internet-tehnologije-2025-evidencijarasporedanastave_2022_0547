'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Putanja do API rute koju smo premestili u src/app/api/auth/login/route.ts
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const user = await res.json();
        
        // Logika za razlikovanje uloga prema dokumentaciji projekta
        // U bazi kolona 'role' mora imati vrednosti: 'admin', 'teacher' ili 'student'
        if (user.role === 'admin') {
          router.push('/admin'); 
        } else if (user.role === 'teacher') {
          router.push('/teacher');
        } else if (user.role === 'student') {
          router.push('/student');
        } else {
          // Ako uloga nije prepoznata, idi na početnu
          router.push('/');
        }
      } else {
        setError('Neispravan email ili lozinka. Pokušajte ponovo.');
      }
    } catch (err) {
      setError('Došlo je do greške prilikom povezivanja sa serverom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-2">EVENT.FON</h1>
        <p className="text-gray-500 text-center mb-8">Evidencija rasporeda nastave</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email adresa</label>
            <input
              type="email"
              placeholder="npr. bogdan@student.fon.rs"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-bold text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            }`}
          >
            {loading ? 'Prijava u toku...' : 'Prijavi se'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
          Fakultet organizacionih nauka
        </p>
      </div>
    </div>
  );
}