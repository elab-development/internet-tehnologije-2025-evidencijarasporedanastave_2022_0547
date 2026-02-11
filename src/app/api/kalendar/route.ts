import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { naslov, datum } = body;

    console.log(`Novi događaj primljen: ${naslov} za datum ${datum}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Uspešno dodat događaj: ${naslov}` 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Neispravni podaci" }, { status: 400 });
  }
}