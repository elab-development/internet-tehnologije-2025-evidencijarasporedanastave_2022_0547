'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        alert("Email nije poslat. Proverite bazu.");
      }
    } catch (err) {
      alert("Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-10 bg-white shadow-2xl rounded-[2rem]">
        {sent ? (
          <div className="text-center">
            <h2 className="text-2xl font-black text-blue-600 mb-4 uppercase">Zahtev poslat!</h2>
            <p className="text-slate-500 mb-6">Adminu je poslat zahtev za email: <br/><strong>{email}</strong></p>
            <a href="/login" className="text-blue-600 font-bold hover:underline">Vrati se na Login</a>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="space-y-5">
            <h1 className="text-3xl font-black text-slate-800 text-center uppercase">Reset Lozinke</h1>
            <input 
              type="email" 
              placeholder="vlasnik.naloga@fon.rs" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit" disabled={loading} className="w-full p-4 rounded-2xl font-black text-white uppercase bg-blue-600 hover:bg-blue-700 transition-all shadow-lg">
              {loading ? 'Slanje...' : 'Pošalji zahtev adminu'}
            </button>
            <div className="text-center mt-4">
              <a href="/login" className="text-sm text-slate-400">Odustani</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}