'use client';

import { signIn, useSession, sendEmailSignInLink } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Card, Input, Spin, Alert } from 'antd';
import { GoogleOutlined, MailOutlined, CheckCircleFilled, ArrowRightOutlined } from '@ant-design/icons';
import { toast } from 'sonner';

export default function LoginPage() {
  const { status, isEmailLink, completeEmailLinkSignIn } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [completingSignIn, setCompletingSignIn] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.push('/words');
  }, [status, router]);

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন');
      return;
    }

    setSubmittingLink(true);
    try {
      await sendEmailSignInLink(email);
      setLinkSent(true);
      toast.success('লগইন লিংক সফলভাবে আপনার ইমেইলে পাঠানো হয়েছে!');
    } catch (error: any) {
      console.error('Send email link error:', error);
      toast.error(error.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmittingLink(false);
    }
  };

  const handleConfirmEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmEmail || !confirmEmail.includes('@')) {
      toast.error('অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন');
      return;
    }

    setCompletingSignIn(true);
    try {
      const ok = await completeEmailLinkSignIn(confirmEmail);
      if (ok) {
        toast.success('লগইন সফল হয়েছে!');
        router.push('/words');
      } else {
        toast.error('লগইন লিংকটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।');
      }
    } catch (error: any) {
      console.error('Complete email sign-in error:', error);
      toast.error(error.message || 'সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setCompletingSignIn(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If user opened the email link on a device where localStorage didn't have their email
  if (isEmailLink && status !== 'authenticated') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 font-sans">
        <Card className="w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-lg">
            ✉️
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">ইমেইল নিশ্চিতকরণ</h1>
          <p className="text-gray-500 text-xs mb-6 leading-relaxed">
            সাইন-ইন সম্পন্ন করতে যে ইমেইল ঠিকানায় লিংকটি পাঠানো হয়েছিল তা নিচে লিখুন।
          </p>

          <form onSubmit={handleConfirmEmailSignIn} className="space-y-4">
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              type="email"
              placeholder="আপনার ইমেইল ঠিকানা দিন"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="h-12 rounded-xl text-sm border-gray-200"
              required
            />
            <Button
              type="primary"
              htmlType="submit"
              loading={completingSignIn}
              block
              className="bg-emerald-600 hover:!bg-emerald-700 h-12 rounded-xl font-bold text-sm shadow-md"
            >
              সাইন-ইন সম্পন্ন করুন
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 font-sans py-8">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-lg">
          🦉
        </div>

        <h1 className="text-3xl font-black text-gray-800 mb-1">OwlPrep এ স্বাগতম</h1>
        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-3">by Grow With Owl</p>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          আপনার সংরক্ষিত প্রস্তুতি নোট ক্লাউডে সিঙ্ক করতে এবং দৈনিক স্ট্রিক বজায় রাখতে সাইন ইন করুন।
        </p>

        {/* 1. Google 1-Click Sign-In */}
        <Button
          type="primary"
          size="large"
          block
          icon={<GoogleOutlined />}
          onClick={() => signIn('google')}
          className="bg-emerald-600 hover:!bg-emerald-700 h-12 rounded-2xl font-bold text-sm shadow-md mb-4"
        >
          গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন
        </Button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-3 text-xs font-semibold text-gray-400 uppercase">অথবা পাসওয়ার্ড ছাড়া</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* 2. Passwordless Email Link */}
        {linkSent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left mb-6">
            <div className="flex items-start gap-2.5">
              <CheckCircleFilled className="text-emerald-600 text-lg mt-0.5" />
              <div>
                <p className="font-bold text-emerald-800 text-xs m-0">ম্যাজিক লিংক পাঠানো হয়েছে!</p>
                <p className="text-[11px] text-emerald-700 m-0 mt-1 leading-relaxed">
                  <span className="font-semibold">{email}</span> ঠিকানায় একটি সাইন-ইন লিংক পাঠানো হয়েছে। আপনার ইনবক্স চেক করে লিংকে ক্লিক করুন।
                </p>
                <button
                  type="button"
                  onClick={() => setLinkSent(false)}
                  className="text-[11px] text-emerald-800 font-bold underline mt-2 hover:text-emerald-900 block"
                >
                  অন্য ইমেইল ব্যবহার করুন
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendEmailLink} className="space-y-3 mb-6 text-left">
            <label className="block text-xs font-bold text-gray-700">
              ইমেইল লিংক দিয়ে লগইন (Passwordless):
            </label>
            <div className="flex gap-2">
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl text-xs border-gray-200"
                required
              />
              <Button
                type="default"
                htmlType="submit"
                loading={submittingLink}
                icon={<ArrowRightOutlined />}
                className="h-11 px-4 rounded-xl font-bold text-xs border-emerald-600 text-emerald-700 hover:!border-emerald-700 hover:!text-emerald-800"
              >
                পাঠান
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 m-0">
              কোনো পাসওয়ার্ড লাগবে না। আপনার ইমেইলে সরাসরি লগইন করার লিংক পৌঁছাবে।
            </p>
          </form>
        )}

        {/* Legal footer */}
        <p className="text-[11px] text-gray-400 leading-relaxed m-0 pt-2 border-t border-gray-100">
          প্রবেশ করার মাধ্যমে আপনি আমাদের{' '}
          <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2">
            ব্যবহারের শর্তাবলী
          </Link>{' '}
          ও{' '}
          <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2">
            গোপনীয়তা নীতি
          </Link>
          -তে সম্মত হচ্ছেন।
        </p>
      </Card>
    </div>
  );
}
