"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentProfilForma({ student }: { student: any }) {
  const router = useRouter();

  const handleSacuvaj = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const novoIme = formData.get("ime");

    try {
      console.log("Pokrećem API operacije...");

      const resGet = await fetch("/api/auth/user/profile");
      if (!resGet.ok) {
        console.warn("Profil API vratio grešku, ali nastavljamo...");
      }

      await fetch("/api/kalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          naslov: `Ažuriranje: ${novoIme}`, 
          datum: new Date().toISOString() 
        }),
      });

      const resUpdate = await fetch("/api/auth/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: novoIme }),
      });

      if (resUpdate.ok) {
        alert("Podaci su uspešno sačuvani u bazi preko API ruta!");
        router.push("/student");
        router.refresh();
      } else {
        const errorData = await resUpdate.json();
        alert(`Greška pri čuvanju: ${errorData.error || "Nepoznata greška"}`);
      }

    } catch (error) {
      console.error("Kritična greška:", error);
      alert("Došlo je do greške u komunikaciji sa serverom.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
      <form onSubmit={handleSacuvaj} className="flex flex-col gap-6">
        <input type="hidden" name="id" value={student?.id || ""} />

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
            Novo Ime i Prezime
          </label>
          <input 
            name="ime"
            defaultValue={student?.ime || ""}
            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
            Email Adresa (Trajno)
          </label>
          <input 
            name="email"
            defaultValue={student?.email || ""}
            readOnly
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none font-bold"
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button 
            type="submit"
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            Sačuvaj izmene
          </button>
          
          <Link 
            href="/student"
            className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] text-center uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center"
          >
            Otkaži
          </Link>
        </div>
      </form>
    </div>
  );
}