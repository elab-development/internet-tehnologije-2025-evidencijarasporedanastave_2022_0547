import { NextResponse } from 'next/server';

export async function POST() {
  // Ovde bi u pravoj aplikaciji brisao cookie (sesiju)
  // npr. cookies().delete('session_token');
  
  return NextResponse.json({ message: 'Uspešno ste se odjavili' });
}