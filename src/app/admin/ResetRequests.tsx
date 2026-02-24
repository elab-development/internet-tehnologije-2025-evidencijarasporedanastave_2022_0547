'use client';
import { useState, useEffect } from 'react';

export default function ResetRequests() {
  const [requests, setRequests] = useState<{email: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/auth/reset-password');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (email: string) => {
    // Koristimo PATCH umesto DELETE da bi pokrenuli logiku promene lozinke
    const res = await fetch('/api/auth/reset-password', {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      const data = await res.json();
      // PRIKAZUJEMO NOVU LOZINKU ADMINU
      alert(`USPEŠNO! 
Lozinka za korisnika ${email} je promenjena.

NOVA LOZINKA: ${data.newPassword}

Zapišite je i javite studentu.`);
      
      fetchRequests(); // Osvežavamo listu
    } else {
      alert("Došlo je do greške pri menjanju lozinke u bazi.");
    }
  };

  if (loading) return <p className="p-6 text-center text-xs font-black uppercase text-slate-400">Provera zahteva...</p>;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 mb-12">
      <h2 className="text-xl font-black mb-8 uppercase tracking-tight text-slate-800">
        Zahtevi za reset lozinke ({requests.length})
      </h2>
      {requests.length === 0 ? (
        <p className="text-slate-400 text-sm italic">Nema aktivnih zahteva.</p>
      ) : (
        <div className="grid gap-3">
          {requests.map((req) => (
            <div key={req.email} className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
              <span className="font-bold text-slate-700 text-sm">{req.email}</span>
              <button onClick={() => handleApprove(req.email)} className="bg-red-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                Odobri i Generiši lozinku
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}