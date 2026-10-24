'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Row, Col, Button } from 'antd';
import {
  ReadOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  CheckCircleFilled,
  GlobalOutlined,
  CompassOutlined,
  StarFilled,
} from '@ant-design/icons';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-emerald-200 mb-4">
            <FireOutlined className="text-amber-400" />
            <span>বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার প্রস্তুতি</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            ভোকাবুলারি পড়ে ভুলে যান? <br />
            <span className="text-emerald-300">আর মুখস্থ নয়, স্থায়ী হোক স্মৃতিতে।</span>
          </h1>

          <p className="text-emerald-100/90 text-base md:text-lg mb-8 leading-relaxed font-normal">
            হাজার পাতার গাইড মুখস্থ করে ভুলে যাওয়ার দিন শেষ। বৈজ্ঞানিক স্পেসড রিপিটেশন (SM-2)
            ফ্ল্যাশ কার্ড, দেশি ট্রিকস এবং নেগেটিভ মার্কিং কুইজের মাধ্যমে আত্মবিশ্বাসের সাথে
            প্রস্তুতি নিন।
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/flashcards">
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                className="bg-amber-400 hover:!bg-amber-300 !text-slate-950 font-black rounded-xl h-12 px-6 shadow-md border-0 text-sm"
              >
                ফ্ল্যাশ কার্ডে রিভিশন দিন ⚡
              </Button>
            </Link>

            <Link href="/quiz">
              <Button
                size="large"
                icon={<TrophyOutlined />}
                className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-xl h-12 px-5 border-white/30 backdrop-blur-sm text-sm"
              >
                নেগেটিভ মার্কিং কুইজ 🎯
              </Button>
            </Link>

            <Link href="/bangla/baghdhara">
              <Button
                size="large"
                icon={<BookOutlined />}
                className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-xl h-12 px-5 border-white/30 backdrop-blur-sm text-sm"
              >
                বাগধারা কোষ (৬৪১+) 📖
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Ranks & Level Roadmap */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
              ক্যারিয়ার রোডম্যাপ • Gamified Progression
            </span>
            <h3 className="text-lg font-black text-gray-800 m-0">
              নিয়মিত অনুশীলনে আপনার র্যাংক বাড়বে
            </h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">
            প্রতিটি সঠিক উত্তরে XP অর্জন করুন
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {[
            { rank: 'লেভেল ১', title: 'ফ্রেশার', color: 'bg-gray-100 text-gray-700' },
            { rank: 'লেভেল ২', title: 'লাইব্রেরি তপস্বী', color: 'bg-blue-50 text-blue-700' },
            { rank: 'লেভেল ৩', title: 'প্রিলি ক্র্যাকার', color: 'bg-teal-50 text-teal-700' },
            { rank: 'লেভেল ৪', title: 'রিটেন ফাইটার', color: 'bg-amber-50 text-amber-700' },
            { rank: 'লেভেল ৫', title: 'ক্যাডার / এডি', color: 'bg-emerald-50 text-emerald-800 font-black' },
          ].map((lvl, i) => (
            <div key={i} className={`p-3 rounded-xl border border-gray-100 text-center ${lvl.color}`}>
              <span className="text-[11px] font-bold block opacity-70">{lvl.rank}</span>
              <span className="text-sm font-bold block">{lvl.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Core Modules Grid */}
      <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        প্রস্তুতির মূল বিষয়সমূহ <span className="text-emerald-600 text-sm font-bold">/ সিলেবাস</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {/* Module 1: Vocabulary */}
        <Link href="/words" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <ReadOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-emerald-700 transition">
                ভোকাবুলারি ব্যাংক
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                বিসিএস, ব্যাংক ও প্রাথমিক শিক্ষক নিয়োগের বিগত বছরের গুরুত্বপূর্ণ ইংরেজি শব্দের সহজ
                বাংলা অর্থ, সিনোনিম ও অ্যান্টোনিম।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>শব্দভাণ্ডার দেখুন</span>
              <span>➔</span>
            </div>
          </div>
        </Link>

        {/* Module 2: Spaced Repetition Flashcards */}
        <Link href="/flashcards" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <ThunderboltOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-amber-700 transition">
                স্পেসড রিভিশন কার্ড
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                যা আজ পড়বেন, ভুলে যাওয়ার আগেই তা পুনরায় চোখের সামনে আসবে। বৈজ্ঞানিক SM-2 পদ্ধতিতে
                রিভিশন দিন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>কার্ডে রিভিশন দিন</span>
              <span>➔</span>
            </div>
          </div>
        </Link>

        {/* Module 3: Bangla Baghdhara */}
        <Link href="/bangla/baghdhara" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <BookOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-teal-700 transition">
                বাংলা বাগধারা (৬৪১+)
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                বিসিএস ও চাকরির পরীক্ষায় সচরাচর আসা সকল বাগধারা বর্ণানুক্রমিক তালিকা, অডিও উচ্চারণ ও
                কুইজসহ।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-teal-600">
              <span>বাগধারা শিখুন</span>
              <span>➔</span>
            </div>
          </div>
        </Link>

        {/* Module 4: Bangla Word Origin */}
        <Link href="/bangla/shobdo" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <GlobalOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-blue-700 transition">
                শব্দের উৎপত্তি ও ব্যাকরণ
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                তৎসম, তদ্ভব, দেশি ও বিদেশি শব্দের উৎস নির্ণয়ের সহজ গাইড ও বিগত বছরের প্রশ্ন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>উৎপত্তি দেখুন</span>
              <span>➔</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Why LexiLearn Section */}
      <div className="bg-emerald-50/50 rounded-3xl p-8 md:p-10 border border-emerald-100">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            আমাদের বিশেষত্ব
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mt-2">
            পড়াশোনা হোক আনন্দদায়ক ও ফলাফলমুখী
          </h2>
        </div>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={8}>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-full">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-3">
                <FireOutlined />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">প্রতিদিনের ধারাবাহিকতা (Streak)</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                প্রতিদিন মাত্র ৫-১০ মিনিট সময় দিন। নিয়মিত প্র্যাকটিসে আপনার স্ট্রিক অক্ষুণ্ণ থাকবে
                এবং পড়াশোনায় কখনো একঘেয়েমি আসবে না।
              </p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-full">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-3">
                <CheckCircleFilled />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">স্মার্ট স্পেসড রিপিটেশন</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                যে শব্দগুলো আপনার বেশি কঠিন লাগে, সেগুলো অ্যাপ নিজ থেকেই বেশি বেশি রিভিশনে আনবে। ফলে
                স্মৃতিশক্তি হবে দীর্ঘস্থায়ী।
              </p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-full">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-3">
                <TrophyOutlined />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">নেগেটিভ মার্কিং কুইজ</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                ১৫ সেকেন্ডের দ্রুত কুইজে ভুল উত্তরের জন্য -০.২৫ নম্বর কাটার বাস্তব অভিজ্ঞতা নিন, যা
                আসল পরীক্ষার ভয় দূর করবে।
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
