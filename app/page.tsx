'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Row, Col, Button, Tag } from 'antd';
import {
  PlusOutlined,
  ReadOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  CheckCircleFilled,
  SmileOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-white mb-4">
            <FireOutlined className="text-amber-300 animate-pulse" />
            <span>বিসিএস • ব্যাংক • সরকারি চাকরি প্রস্তুতি</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
            মুখস্থের দিন শেষ, <br />
            <span className="text-emerald-200">খেলাধুলায় ভোকাবুলারি</span> বেশ!
          </h1>

          <p className="text-emerald-100 text-base md:text-lg mb-8 leading-relaxed">
            বোরিং MCQ শিট বাদ দিন। বৈজ্ঞানিক Spaced Repetition (SM-2) ফ্ল্যাশ কার্ড, বাংলা অর্থ,
            Desi ট্রিকস এবং কুইজ যুদ্ধের মাধ্যমে চাকরি প্রস্তুতির ইংরেজি ও বাংলা আয়ত্ত করুন।
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/flashcards">
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                className="bg-amber-400 hover:!bg-amber-300 !text-gray-950 font-black rounded-xl h-12 px-6 shadow-lg border-0"
              >
                স্মার্ট ফ্ল্যাশ কার্ড ⚡
              </Button>
            </Link>

            <Link href="/bangla/baghdhara">
              <Button
                size="large"
                icon={<BookOutlined />}
                className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-xl h-12 px-5 border-white/30 backdrop-blur-sm"
              >
                বাংলা বাগধারা (৬৪১+) 📖
              </Button>
            </Link>

            <Link href="/quiz">
              <Button
                size="large"
                icon={<TrophyOutlined />}
                className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-xl h-12 px-5 border-white/30 backdrop-blur-sm"
              >
                কুইজ অ্যারিনা 🏆
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Core Modules Grid */}
      <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        প্রস্তুতির মূল ক্ষেত্রসমূহ <span className="text-emerald-600 text-sm font-bold">/ Explore</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {/* Module 1: Vocabulary */}
        <Link href="/words" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <ReadOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-emerald-700 transition">
                ইংরেজি ভোকাবুলারি
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                বিসিএস ও ব্যাংক স্ট্যান্ডার্ড ইংরেজি শব্দভাণ্ডার, অর্থ, উদাহরণ ও অডিও উচ্চারণসহ।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>শব্দকোষ দেখুন</span>
              <span>➔</span>
            </div>
          </div>
        </Link>

        {/* Module 2: Spaced Repetition Flashcards */}
        <Link href="/flashcards" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <ThunderboltOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-amber-700 transition">
                স্মার্ট ফ্ল্যাশ কার্ড (SRS)
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                SuperMemo SM-2 অ্যালগরিদমে দীর্ঘস্থায়ী স্মৃতির জন্য বৈজ্ঞানিক ফ্ল্যাশ কার্ড অনুশীলন।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>কার্ড উল্টান</span>
              <span>➔</span>
            </div>
          </div>
        </Link>

        {/* Module 3: Bangla Baghdhara */}
        <Link href="/bangla/baghdhara" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <BookOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-teal-700 transition">
                বাংলা বাগধারা (৬৪১+)
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                চাকরির পরীক্ষায় আসা প্রায় সকল বাগধারা বর্ণানুক্রমিক তালিকা, অডিও ও কুইজসহ।
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                <GlobalOutlined />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-blue-700 transition">
                শব্দের উৎস ও প্রকারভেদ
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                তৎসম, তদ্ভব, দেশি ও বিদেশি শব্দের উৎস ও ব্যুৎপত্তি নির্ণয়ের স্বয়ংসম্পূর্ণ হাব।
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>উৎস খুঁজুন</span>
              <span>➔</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Why LexiLearn Section */}
      <div className="bg-emerald-50/60 rounded-3xl p-8 md:p-10 border border-emerald-100">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            কেন সাধারণ অ্যাপের চেয়ে আলাদা?
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mt-2">
            মুখস্থের ক্লান্তি দূর করে শেখার আনন্দ
          </h2>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-full">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-3">
                <FireOutlined />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">প্রতিদিনের স্ট্রিক (🔥)</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                প্রতিদিন মাত্র ৫-১০ মিনিট চর্চায় আপনার ধারাবাহিকতার স্ট্রিক বজায় থাকবে, ফলে পড়াশোনায়
                কখনো বিরতি পড়বে না।
              </p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-full">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-3">
                <CheckCircleFilled />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">সক্রিয় রিকল ও SM-2</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                পড়েই ভুলে যাওয়ার দিন শেষ। আপনি যে শব্দগুলো কম মনে রাখতে পারেন, সেগুলো অ্যালগরিদম নিজে
                থেকে বেশি বেশি রিভিশনে আনবে।
              </p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-full">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-3">
                <TrophyOutlined />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">কুইজ ও ইনস্ট্যান্ট ফিডব্যাক</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                ১৫ সেকেন্ডের দ্রুত প্রশ্নের কুইজে সঠিক উত্তরের সাথে সাথে প্রেক্ষাপট ও বাংলা অর্থ দেখা
                যায়, যা স্মৃতিতে স্থায়ী দাগ ফেলে।
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
