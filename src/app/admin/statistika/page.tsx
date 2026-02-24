import { db } from "@/db";
import { korisnik, raspored } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import Navbar from "@/components/navbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StatsDashboard from "./StatsDashboard";

export default async function StatistikaPage() {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  if (!ulogovaniEmail) redirect('/login');

  // 1. Podaci za Pie Chart: Broj korisnika po ulogama
  const userResults = await db.select({
    role: korisnik.role,
    count: sql`count(*)`
  }).from(korisnik).groupBy(korisnik.role);

  // Rešavanje crvenila: Eksplicitno mapiranje u bilo koji niz (any)
  const userChartData: any[][] = [
    ["Uloga", "Broj korisnika"],
    ...userResults.map((r: any) => [r.role || "user", Number(r.count)])
  ];

  // 2. Podaci za Bar Chart: Broj termina u rasporedu po danima
  const scheduleResults = await db.select({
    dan: raspored.danUNedelji,
    count: sql`count(*)`
  }).from(raspored).groupBy(raspored.danUNedelji);

  // Rešavanje crvenila: Eksplicitno mapiranje u bilo koji niz (any)
  const scheduleChartData: any[][] = [
    ["Dan", "Broj termina"],
    ...scheduleResults.map((r: any) => [r.dan || "Nepoznato", Number(r.count)])
  ];

  // Dohvatamo podatke o adminu za Navbar
  const adminArr = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail)).limit(1);
  
  if (!adminArr[0] || adminArr[0].role.toLowerCase() !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={adminArr[0].ime} userRole={adminArr[0].role} />
      <main className="max-w-6xl mx-auto py-16 px-6">
        <div className="mb-12">
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Data Insights
            </span>
            <h1 className="text-5xl font-black text-slate-900 mt-6 tracking-tighter uppercase leading-none">
              Analitički <span className="text-blue-600">Pregled</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-4 ml-1">
                Vizuelna analiza evidencije nastave i korisnika sistema
            </p>
        </div>
        
        <StatsDashboard userStats={userChartData} scheduleStats={scheduleChartData} />
      </main>
    </div>
  );
}