import { NextResponse } from 'next/server';

//autentifikaciona ruta

export async function POST() {
  try {
  
    
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