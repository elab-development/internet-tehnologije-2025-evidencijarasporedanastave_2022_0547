import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Ovde bi išla logika za brisanje cookie-ja ili sesije
    // npr. cookies().delete('session')
    
    return NextResponse.json(
      { message: "Uspešno ste se odjavili sa sistema (SK 2)" }, 
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Došlo je do greške prilikom odjave" }, 
      { status: 500 }
    );
  }
}