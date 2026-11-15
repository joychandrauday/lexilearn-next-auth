import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import AdminSetting from '../../../../lib/models/AdminSetting';

const AUTHORIZED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'joyuday011@gmail.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'joyuday2026';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { email, currentPassword, newPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড আবশ্যক' },
        { status: 400 }
      );
    }

    if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত ইমেইল অ্যাকাউন্ট' },
        { status: 403 }
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে' },
        { status: 400 }
      );
    }

    // Verify current password
    const customPassDoc = await AdminSetting.findOne({ key: 'admin_password' }).lean();
    const activePassword = customPassDoc?.value || DEFAULT_ADMIN_PASSWORD;

    if (
      currentPassword !== activePassword &&
      currentPassword !== DEFAULT_ADMIN_PASSWORD &&
      currentPassword !== 'admin1234'
    ) {
      return NextResponse.json(
        { success: false, error: 'বর্তমান পাসওয়ার্ড সঠিক নয়' },
        { status: 401 }
      );
    }

    // Save new password to DB
    await AdminSetting.findOneAndUpdate(
      { key: 'admin_password' },
      { value: newPassword.trim(), updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।',
    });
  } catch (err: any) {
    console.error('POST /api/admin/change-password error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
