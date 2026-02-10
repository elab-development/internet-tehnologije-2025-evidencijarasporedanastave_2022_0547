import { db } from "@/db";
import { raspored } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await db.select().from(raspored);
  return NextResponse.json(data, { status: 200 });
}