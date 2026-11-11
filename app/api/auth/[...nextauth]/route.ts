import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'NextAuth has been replaced by Firebase Authentication' });
}

export async function POST() {
  return NextResponse.json({ message: 'NextAuth has been replaced by Firebase Authentication' });
}
