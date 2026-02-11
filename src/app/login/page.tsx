'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        const uloga = data.role.toLowerCase().trim();

        if (uloga === 'admin') {
          window.location.href = '/admin';
        } else if (uloga === 'nastavnik' || uloga === 'teacher') {
          window.location.href = '/teacher';
        } else if (uloga === 'student') {
          window.location.href = '/student';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.error || 'Neispravni podaci. Pokušajte ponovo.');
      }
    } catch (err) {
      setError('Greška u komunikaciji sa serverom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
      <div className="w-full max-w-md p-10 bg-white shadow-2xl rounded-[2rem] border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-600 tracking-tighter uppercase">Event.FON</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Sistem za evidenciju nastave</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Institucionalni Email</label>
            <input
              type="email"
              placeholder="ime.prezime@fon.rs"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Lozinka</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-4 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-lg ${
              loading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 active:scale-95'
            }`}
          >
            {loading ? 'Provera...' : 'Pristupi sistemu'}
          </button>
        </form>

        <div className="mt-6 text-center">
  <p className="text-sm text-slate-500">
    Nemaš nalog?{" "}
    <a
      href="/register"
      className="font-bold text-blue-600 hover:underline"
    >
      Registruj se
    </a>
  </p>
</div>
        
        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Fakultet organizacionih nauka
          </span>
        </div>
      </div>
    </div>
  );
}