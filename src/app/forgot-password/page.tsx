'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setMessage('Instrukcije su poslate na vaš email.');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
      <div className="w-full max-w-md p-10 bg-white shadow-2xl rounded-[2rem] border border-slate-100">
        <div className="text-center mb-10"><h1 className="text-4xl font-black text-blue-600 uppercase">Reset Lozinke</h1></div>
        {message ? (
          <div className="text-center"><div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium">{message}</div><a href="/login" className="text-blue-600 font-bold hover:underline">Vrati se na Login</a></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="email" placeholder="ime.prezime@fon.rs" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full p-4 rounded-2xl font-black text-white uppercase bg-blue-600 hover:bg-blue-700">{loading ? 'Slanje...' : 'Pošalji'}</button>
            <div className="text-center mt-4"><a href="/login" className="text-sm text-slate-400">Odustani</a></div>
          </form>
        )}
      </div>
    </div>
  );
}