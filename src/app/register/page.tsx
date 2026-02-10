'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [ime, setIme] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime,
          slug: username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Greška pri registraciji.');
      }
    } catch {
      setError('Greška u komunikaciji sa serverom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
      <div className="w-full max-w-md p-10 bg-white shadow-2xl rounded-[2rem] border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-600 tracking-tighter uppercase">
            Event.FON
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">
            Registracija korisnika
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <p className="text-green-600 font-bold mb-6">
              Uspešna registracija!
            </p>
            <a
              href="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Idi na login
            </a>
          </div>
        ) : (
            
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Ime */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Ime i prezime
              </label>
              <input
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                value={ime}
                onChange={(e) => setIme(e.target.value)}
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Username
              </label>
              <input
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Institucionalni Email
              </label>
              <input
                type="email"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Lozinka */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Lozinka
              </label>
              <input
                type="password"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 rounded-2xl font-black text-white uppercase tracking-widest bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
            >
              {loading ? 'Kreiranje...' : 'Registruj se'}
            </button>
          </form>
        )}
        <div className="mt-8 text-center">
  <p className="text-sm text-slate-500">
    Imaš nalog?{" "}
    <a
      href="/login"
      className="font-bold text-blue-600 hover:underline"
    >
      Uloguj se
    </a>
  </p>
</div>
      </div>
    </div>
  );
}