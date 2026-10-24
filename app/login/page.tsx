'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button, Card, Spin } from 'antd';
import { GoogleOutlined, BookOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.push('/words');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 font-sans">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-lg">
          L
        </div>

        <h1 className="text-3xl font-black text-gray-800 mb-2">LexiLearn এ স্বাগতম</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          আপনার সংরক্ষিত শব্দভাণ্ডার ক্লাউডে সিঙ্ক করতে এবং দৈনিক স্ট্রিক বজায় রাখতে সাইন ইন করুন।
        </p>

        <Button
          type="primary"
          size="large"
          block
          icon={<GoogleOutlined />}
          onClick={() => signIn('google')}
          className="bg-emerald-600 hover:!bg-emerald-700 h-13 rounded-2xl font-bold text-base shadow-md mb-4"
        >
          গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন
        </Button>

        <p className="text-[11px] text-gray-400">
          প্রবেশ করার মাধ্যমে আপনি আমাদের নিয়ম ও শর্তাবলীতে সম্মত হচ্ছেন।
        </p>
      </Card>
    </div>
  );
}
