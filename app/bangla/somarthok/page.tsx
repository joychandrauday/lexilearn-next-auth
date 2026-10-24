'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { ProfileOutlined, ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';

export default function SomarthokPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center font-sans">
      <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
        <ProfileOutlined />
      </div>
      <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
        শীঘ্রই আসছে • Coming Soon
      </span>
      <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3">
        বাংলা সমার্থক শব্দ কোষ
      </h1>
      <p className="text-gray-500 text-base mb-8 max-w-md mx-auto leading-relaxed">
        অগ্নি, জল, আকাশ, পৃথিবীসহ বিসিএস ও চাকরির পরীক্ষায় বারবার আসা সকল সমার্থক শব্দের ইন্টারেক্টিভ কুইজ
        ও তালিকা শীঘ্রই যুক্ত হচ্ছে।
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
