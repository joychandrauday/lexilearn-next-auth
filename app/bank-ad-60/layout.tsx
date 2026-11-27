import React from 'react';
import type { Metadata } from 'next';
import BankAdNav from '@/components/bank-ad/BankAdNav';

export const metadata: Metadata = {
  title: 'বাংলাদেশ ব্যাংক AD ৬০ দিনের স্টাডি প্ল্যান ও ট্র্যাকার | PrepOwl',
  description:
    'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD) পরীক্ষার ২৪০টি নির্ধারিত স্টাডি ব্লক, ১৪০টি টপিক সিলেবাস, ২৫টি মক টেস্ট এবং মিসটেক ভল্ট সমন্বিত ইন্টারেক্টিভ প্রস্তুতি ড্যাশবোর্ড।',
};

export default function BankAdLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <BankAdNav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
