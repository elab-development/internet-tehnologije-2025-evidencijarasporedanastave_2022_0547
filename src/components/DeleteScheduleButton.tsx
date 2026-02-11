"use client";
import { obrisiRaspored } from "@/app/actions";

interface DeleteProps {
  id: string;
}

export default function DeleteScheduleButton({ id }: DeleteProps) {
  return (
    <form 
      action={obrisiRaspored} 
      onSubmit={(e) => {
        if (!confirm("Da li ste sigurni da želite da obrišete ovaj termin?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit"
        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
        title="Obriši termin"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  );
}
