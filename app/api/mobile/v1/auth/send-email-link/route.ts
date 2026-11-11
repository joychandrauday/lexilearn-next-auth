import { NextResponse } from 'next/server';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAKKaW3zrk_5cyKjFXhMUCkm-ZjNTo5rZY';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'সঠিক ইমেইল ঠিকানা দিন' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Send passwordless sign-in email using Firebase Identity Toolkit REST API
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'EMAIL_SIGNIN',
          email: cleanEmail,
          continueUrl: 'https://growwithowl.com/login?emailLink=true',
          canHandleCodeInApp: true,
          iOSBundleId: 'app.owlprep.mobile',
          androidPackageName: 'app.owlprep.mobile',
          androidInstallApp: true,
          androidMinimumVersion: '12',
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error('Firebase sendOobCode error:', data);
      const errorMessage = data?.error?.message || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: 'লগইন লিংক সফলভাবে পাঠানো হয়েছে!',
    });
  } catch (error: any) {
    console.error('send-email-link route error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
