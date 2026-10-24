'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';
import {
  MailOutlined,
  GoogleOutlined,
  ThunderboltFilled,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { signIn, useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function SmartAuthPrompt() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If already authenticated via NextAuth, no prompt needed
    if (status === 'authenticated') return;

    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('lexi_user_email');
      const dismissedUntil = localStorage.getItem('lexi_auth_dismissed_until');

      // If user has already provided email, don't show
      if (savedEmail) return;

      // If dismissed within last 24 hours, don't show
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

      // Show timed prompt after 12 seconds
      const timer = setTimeout(() => {
        setOpen(true);
      }, 12000);

      // Also listen to any custom trigger event (e.g. user clicks save to deck without email)
      const handleTriggerEvent = () => {
        if (!localStorage.getItem('lexi_user_email') && status !== 'authenticated') {
          setOpen(true);
        }
      };
      window.addEventListener('lexi:request_auth', handleTriggerEvent);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('lexi:request_auth', handleTriggerEvent);
      };
    }
  }, [status]);

  const handleDismiss = () => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      // Dismiss for 24 hours
      localStorage.setItem('lexi_auth_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
    }
  };

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/user/lead', {
        email,
        source: 'smart_timed_prompt',
        targetExam: 'bcs',
      });

      if (res.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lexi_user_email', email.trim().toLowerCase());
        }
        toast.success('আপনার ইমেইল সফলভাবে সংরক্ষিত হয়েছে! অগ্রগতি স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।');
        setOpen(false);
      }
    } catch {
      toast.error('ইমেইল সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleDismiss}
      footer={null}
      centered
      closeIcon={<CloseOutlined className="text-gray-400 hover:text-gray-600" />}
      className="rounded-3xl overflow-hidden font-sans"
      width={460}
    >
      <div className="p-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-4 text-xl shadow-lg">
          <ThunderboltFilled />
        </div>

        <div className="text-center mb-5">
          <h3 className="text-xl font-black text-gray-900 m-0 mb-1.5 tracking-tight">
            আপনার প্রস্তুতির অগ্রগতি ক্লাউডে রাখুন
          </h3>
          <p className="text-xs text-gray-500 m-0 leading-relaxed max-w-sm mx-auto font-medium">
            দৈনিক বিসিএস ও ব্যাংক স্পেশাল রিলস, বুকমার্ক করা শব্দভাণ্ডার এবং স্ট্রিক কোনো ডিভাইসেই যেন হারিয়ে না যায়।
          </p>
        </div>

        {/* 1. Quick Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
          <div>
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল দিন (e.g. user@gmail.com)"
              className="rounded-xl h-11 text-xs border-gray-200"
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            className="bg-emerald-600 hover:!bg-emerald-500 text-white font-black rounded-xl h-11 text-xs border-0 shadow-md"
          >
            সংরক্ষণ ও আনলক করুন
          </Button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-100" />
          <span className="px-3 text-[10px] font-bold text-gray-400 uppercase">অথবা</span>
          <div className="flex-1 border-t border-gray-100" />
        </div>

        {/* 2. Google 1-Click Login */}
        <Button
          block
          icon={<GoogleOutlined />}
          onClick={() => signIn('google')}
          className="rounded-xl h-11 text-xs font-bold border-gray-200 text-gray-700 hover:border-gray-300 mb-3"
        >
          গুগল অ্যাকাউন্ট দিয়ে সাইন ইন
        </Button>

        {/* Footer notes */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <SafetyCertificateOutlined className="text-emerald-600" /> ১০০% স্প্যামমুক্ত নিশ্চয়তা
          </span>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 font-medium underline"
          >
            পরে মনে করিয়ে দিন
          </button>
        </div>
      </div>
    </Modal>
  );
}
