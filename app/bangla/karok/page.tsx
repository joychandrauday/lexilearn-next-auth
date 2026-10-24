'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { EditOutlined, ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';

export default function KarokPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center font-sans">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
        <EditOutlined />
      </div>
      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
        শীঘ্রই আসছে • Coming Soon
      </span>
      <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3">
        কারক ও বিভক্তি মাস্টারক্লাস
      </h1>
      <p className="text-gray-500 text-base mb-8 max-w-md mx-auto leading-relaxed">
        কারক নির্ণয়ের ম্যাজিক ট্রিকস এবং বিগত ২০ বছরের বিসিএস ও ব্যাংক পরীক্ষার প্রশ্নব্যাংক নিয়ে এই
        মডিউলটি প্রস্তুত হচ্ছে।
      </p>

      <div className="flex justify-center gap-3">
        <Link href="/bangla/baghdhara">
          <Button type="primary" size="large" icon={<BookOutlined />} className="bg-emerald-600 font-bold rounded-xl h-12">
            বাংলা বাগধারা অনুশীলন করুন
          </Button>
        </Link>
        <Link href="/bangla">
          <Button size="large" icon={<ArrowLeftOutlined />} className="rounded-xl h-12">
            বাংলা হাবে ফিরুন
          </Button>
        </Link>
      </div>
    </div>
  );
}
