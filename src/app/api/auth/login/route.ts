import { db } from '@/db'; // Proveri da li je ovo ispravna putanja do tvog db objekta
import { korisnik } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Tražimo korisnika u bazi po email-u i lozinki
  const existingUser = await db
    .select()
    .from(korisnik)
    .where(
      and(
        eq(korisnik.email, email),
        eq(korisnik.password, password) // U pravoj aplikaciji ovde ide heširana provera
      )
    )
    .limit(1);

  if (existingUser.length > 0) {
    return NextResponse.json(existingUser[0]);
  } else {
    return new NextResponse('Unauthorized', { status: 401 });
  }
}