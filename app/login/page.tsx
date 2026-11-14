'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button, Card, Spin, Input, Tabs, Select } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { registerUser } from '../../actions/auth.actions';
import { toast } from 'sonner';

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTargetExam, setRegTargetExam] = useState('বিসিএস প্রিলিমিনারি (BCS)');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('ইমেইল ও পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
        callbackUrl,
      });

      if (res?.error) {
        toast.error('ভুল ইমেইল বা পাসওয়ার্ড। পুনরায় চেষ্টা করুন।');
      } else {
        toast.success('সফলভাবে লগইন হয়েছে!');
        router.push(callbackUrl);
      }
    } catch (err) {
      toast.error('লগইনে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword) {
      toast.error('ইমেইল ও পাসওয়ার্ড আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        targetExam: regTargetExam,
      });

      if (!res.success) {
        toast.error(res.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
      } else {
        toast.success('অ্যাকাউন্ট তৈরি সফল হয়েছে! লগইন করা হচ্ছে...');
        // Auto login with credentials
        const loginRes = await signIn('credentials', {
          redirect: false,
          email: regEmail,
          password: regPassword,
          callbackUrl,
        });

        if (loginRes?.ok) {
          router.push(callbackUrl);
        } else {
          setTab('login');
          setLoginEmail(regEmail);
        }
      }
    } catch (err) {
      toast.error('রেজিস্ট্রেশনে ত্রুটি ঘটেছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8 font-sans">
      <Card className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl font-black shadow-lg">
            🦉
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800">OwlPrep স্টুডেন্ট পোর্টাল</h1>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1">
            Barron's 333 & ট্রান্সলেশন স্টুডিও
          </p>
        </div>

        <Button
          type="default"
          size="large"
          block
          icon={<GoogleOutlined className="text-red-500 text-lg" />}
          onClick={() => signIn('google', { callbackUrl })}
          className="h-12 rounded-xl font-bold text-gray-700 shadow-sm border-gray-300 hover:border-emerald-500 mb-5 flex items-center justify-center gap-2"
        >
          গুগল দিয়ে প্রবেশ করুন
        </Button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">অথবা ইমেইল দিয়ে</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as 'login' | 'register')}
          centered
          className="mb-4"
          items={[
            { key: 'login', label: 'লগইন' },
            { key: 'register', label: 'নতুন রেজিস্ট্রেশন' },
          ]}
        />

        {tab === 'login' ? (
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল ঠিকানা</label>
              <Input
                size="large"
                prefix={<MailOutlined className="text-gray-400 mr-1" />}
                type="email"
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">পাসওয়ার্ড</label>
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400 mr-1" />}
                placeholder="আপনার পাসওয়ার্ড"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              loading={submitting}
              icon={<ArrowRightOutlined />}
              className="bg-emerald-600 hover:!bg-emerald-700 h-12 rounded-xl font-bold text-base shadow-md mt-2"
            >
              সাইন ইন করুন
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">আপনার নাম</label>
              <Input
                size="large"
                prefix={<UserOutlined className="text-gray-400 mr-1" />}
                placeholder="পূর্ণ নাম"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল ঠিকানা</label>
              <Input
                size="large"
                prefix={<MailOutlined className="text-gray-400 mr-1" />}
                type="email"
                placeholder="name@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400 mr-1" />}
                placeholder="একটি শক্তিশালী পাসওয়ার্ড"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">টার্গেট পরীক্ষা</label>
              <Select
                size="large"
                value={regTargetExam}
                onChange={setRegTargetExam}
                className="w-full rounded-xl"
                options={[
                  { value: 'বিসিএস প্রিলিমিনারি (BCS)', label: 'বিসিএস প্রিলিমিনারি ও লিখিত (BCS)' },
                  { value: 'বাংলাদেশ ব্যাংক এডি (BB AD)', label: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (BB AD)' },
                  { value: 'কম্বাইন্ড ব্যাংক অফিসার', label: 'কম্বাইন্ড ৮ ব্যাংক অফিসার ও সিনিয়র অফিসার' },
                  { value: 'বিজেএস ও জুডিশিয়ারি (BJS)', label: 'বিজেএস সহকারী জজ (BJS)' },
                  { value: 'জিআরই ও আইইএলটিএস (GRE/IELTS)', label: 'GRE ও উচ্চশিক্ষা প্রস্তুতি' },
                ]}
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              loading={submitting}
              className="bg-emerald-600 hover:!bg-emerald-700 h-12 rounded-xl font-bold text-base shadow-md mt-2"
            >
              বিনামূল্যে অ্যাকাউন্ট খুলুন
            </Button>
          </form>
        )}

        <p className="text-[11px] text-gray-400 text-center mt-6">
          অ্যাকাউন্ট ব্যবহারের মাধ্যমে আপনি শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছেন।
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center"><Spin size="large" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
