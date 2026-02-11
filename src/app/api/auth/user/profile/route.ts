import { db } from '@/db';
import { korisnik } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

//interna API ruta

export async function GET() {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get('user_email')?.value;

    if (!email) {
      return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
    }

    const user = await db.select().from(korisnik).where(eq(korisnik.email, email)).limit(1);
    
    if (user.length === 0) return NextResponse.json({ error: "Nije nađen" }, { status: 404 });

    return NextResponse.json(user[0]);
  } catch (error) {
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}