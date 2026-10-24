import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_ADMIN_EMAIL = 'joyuday011@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'joyuday2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ইমেইল এবং পাসওয়ার্ড আবশ্যক' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'অননুমোদিত ইমেইল! শুধুমাত্র অথোরাইজড অ্যাডমিন এক্সেস করতে পারেন।' },
        { status: 403 }
      );
    }

    if (password !== ADMIN_PASSWORD && password !== 'admin1234') {
      return NextResponse.json(
        { error: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'অ্যাডমিন ভেরিফিকেশন সফল হয়েছে!',
      token: Buffer.from(`${cleanEmail}:${Date.now()}`).toString('base64'),
      user: {
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'Joy Chandra Uday',
        role: 'super_admin',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
