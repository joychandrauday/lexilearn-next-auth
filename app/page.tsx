'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Tag } from 'antd';
import {
  ThunderboltFilled,
  CompassOutlined,
  BookOutlined,
  FireOutlined,
  RobotOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  ReadOutlined,
  StarFilled,
  TrophyOutlined,
  SafetyCertificateFilled,
  PlayCircleFilled,
  UserOutlined,
} from '@ant-design/icons';

export default function LandingPage() {
  const triggerAIMentor = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lexibot:ask', {
          detail: {
            prompt: 'বিসিএস ও ব্যাংক প্রিলিমিনারি প্রস্তুতির জন্য একটি সার্বিক রিভিশন রূপরেখা দিন।',
          },
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 select-none">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-emerald-200 mb-6 shadow-inner">
            <ThunderboltFilled className="text-amber-400" />
            <span>বিসিএস ও ব্যাংক চাকরিপ্রার্থীদের অল-ইন-ওয়ান স্মার্ট লার্নিং প্ল্যাটফর্ম</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 leading-tight sm:leading-tight md:leading-tight text-white max-w-4xl mx-auto">
            চাকরি পরীক্ষার দীর্ঘ যাত্রাকে করুন{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
              সহজ, গোছানো ও আত্মবিশ্বাসী
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-emerald-100/80 font-normal max-w-2xl mx-auto mb-8 leading-relaxed">
            ফেসবুক রিলস স্টাইল ১ মিনিটের মাইক্রো-ক্যাপসুল, স্মার্ট স্টাডি নোটবুক ও বাইন্ডার,
            বাংলা একাডেমি প্রমিত ৬৪৮+ বাগধারা কোষ এবং সার্বিক এআই মেন্টর নিয়ে সম্পূর্ণ প্রস্তুতি এক ঠিকানায়।
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link href="/feed">
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleFilled className="text-amber-300 text-base" />}
                className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-2xl h-13 px-7 text-sm sm:text-base border-0 shadow-xl shadow-emerald-950/40 flex items-center gap-2"
              >
                প্রস্তুতি ফিড শুরু করুন
                <ArrowRightOutlined />
              </Button>
            </Link>

            <Link href="/notebook">
              <Button
                size="large"
                icon={<BookOutlined />}
                className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-2xl h-13 px-6 text-sm sm:text-base border-white/20 backdrop-blur-md flex items-center gap-2"
              >
                স্টাডি নোটবুক দেখুন
              </Button>
            </Link>

            <Button
              size="large"
              icon={<RobotOutlined className="text-emerald-400" />}
              onClick={triggerAIMentor}
              className="bg-slate-800/80 hover:!bg-slate-700 !text-emerald-300 font-bold rounded-2xl h-13 px-6 text-sm sm:text-base border-emerald-400/30 backdrop-blur-md flex items-center gap-2"
            >
              এআই মেন্টর
            </Button>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-emerald-200/70 border-t border-white/10 pt-6">
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-400" /> ৪৪তম-৪৬তম বিসিএস প্যাটার্ন
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-400" /> বাংলাদেশ ব্যাংক ও কম্বাইন্ড ৮ ব্যাংক
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-400" /> বাংলা একাডেমি প্রমিত বানানরীতি
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-400" /> ৯৯% ভেরিফাইড প্রশ্নব্যাংক
            </span>
          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS & IMPACT BAR */}
      <section className="bg-white border-b border-gray-200/80 py-8 relative -mt-4 z-20 rounded-t-3xl shadow-sm">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3">
            <span className="text-2xl sm:text-4xl font-black text-slate-900 block tracking-tight">
              ৬৪৮+
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 mt-1 block">
              প্রমিত বাগধারা ও বাংলা কোষ
            </span>
          </div>
          <div className="p-3">
            <span className="text-2xl sm:text-4xl font-black text-emerald-700 block tracking-tight">
              ১০,০০০+
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 mt-1 block">
              হাই-ইল্ড শব্দ ও প্রশ্নব্যাংক
            </span>
          </div>
          <div className="p-3">
            <span className="text-2xl sm:text-4xl font-black text-indigo-700 block tracking-tight">
              ১ মিনিট
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 mt-1 block">
              ১টি রুল ও ব্যাকরণ ট্র্যাপ আয়ত্ত
            </span>
          </div>
          <div className="p-3">
            <span className="text-2xl sm:text-4xl font-black text-amber-600 block tracking-tight">
              ৯৯%
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 mt-1 block">
              ভেরিফাইড নির্ভুল তথ্য
            </span>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CORE SUITE OVERVIEW */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            প্ল্যাটফর্মের মূল বৈশিষ্ট্যসমূহ
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
            চাকরি প্রস্তুতির প্রতিটি ধাপের জন্য সুনির্দিষ্ট টুল
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            বইয়ের পর বই মুখস্থ করার ক্লান্তি পরিহার করুন। আধুনিক বৈজ্ঞানিক পদ্ধতিতে প্রস্তুতিকে নিয়ে যান শীর্ষ পর্যায়ে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Reel-Style Feed */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xl mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <PlayCircleFilled />
              </div>
              <Tag color="cyan" className="font-bold text-[10px] rounded-md mb-2">
                রিলস স্টাইল লার্নিং
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">প্রস্তুতি ক্যাপসুল ফিড</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                ফেসবুক রিলস-এর মতো একক স্ট্রোকে স্ক্রল করুন। জাতীয় সম্পাদকীয় শব্দ, বিসিএস গ্রামার ট্র্যাপ ও লাইভ ভোটযুক্ত এমসিকিউ কুইজ নিমিষেই সমাধান করুন।
              </p>
            </div>
            <Link href="/feed" className="mt-5 block">
              <span className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                ফিড এক্সপ্লোর করুন <ArrowRightOutlined className="text-[10px]" />
              </span>
            </Link>
          </div>

          {/* Card 2: Smart Aspirant Notebook */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-700 flex items-center justify-center text-white text-xl mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <BookOutlined />
              </div>
              <Tag color="green" className="font-bold text-[10px] rounded-md mb-2">
                ব্যক্তিগত বাইন্ডার
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">স্টাডি নোটবুক ও রিভিশন শিট</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                যেকোনো শব্দ, বাগধারা, ব্যাকরণ রুল ও প্রশ্ন নিজ নিজ সাবজেক্ট ক্যাটাগরিতে (বাংলা, ইংরেজি, গণিত, জিকে) দেশি নেমোনিকসহ সেভ করুন এবং পরীক্ষার আগে প্রিন্ট করুন।
              </p>
            </div>
            <Link href="/notebook" className="mt-5 block">
              <span className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                নোটবুক খুলুন <ArrowRightOutlined className="text-[10px]" />
              </span>
            </Link>
          </div>

          {/* Card 3: Universal AI Mentor */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <RobotOutlined />
              </div>
              <Tag color="purple" className="font-bold text-[10px] rounded-md mb-2">
                ২৪/৭ এআই গাইড
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">লেক্সিবট সার্বিক এআই মেন্টর</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                সাধারণ জ্ঞান, সংবিধান, মুক্তিযুদ্ধ, বাংলা বানানরীতি (কুষ্মাণ্ড, অকালপক্ব), ইংরেজি বিভ্রান্তিকর শব্দ (Candid vs Cynical) যেকোনো বিষয়ে প্রশ্ন করুন — পরিমিত ও নির্ভুল উত্তর পাবেন।
              </p>
            </div>
            <button onClick={triggerAIMentor} className="mt-5 text-left cursor-pointer">
              <span className="text-xs font-black text-indigo-700 hover:text-indigo-800 flex items-center gap-1">
                এআই মেন্টরকে প্রশ্ন করুন <ArrowRightOutlined className="text-[10px]" />
              </span>
            </button>
          </div>

          {/* Card 4: Standard Baghdhara Dictionary */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white text-xl mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <ReadOutlined />
              </div>
              <Tag color="volcano" className="font-bold text-[10px] rounded-md mb-2">
                বাংলা একাডেমি প্রমিত
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">৬৪৮+ বাগধারা কোষ</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                ণ-ত্ব/ষ-ত্ব বিধান অনুযায়ী প্রমিত বানান শুদ্ধিকরণ, ৯৯% ভেরিফিকেশন স্কোর এবং বিগত ৪৪তম বিসিএস ও ব্যাংক নিয়োগ পরীক্ষার অথেনটিক ট্যাগসহ সম্পূর্ণ ডিরেক্টরি।
              </p>
            </div>
            <Link href="/bangla/baghdhara" className="mt-5 block">
              <span className="text-xs font-black text-rose-700 hover:text-rose-800 flex items-center gap-1">
                বাগধারা ডিরেক্টরি <ArrowRightOutlined className="text-[10px]" />
              </span>
            </Link>
          </div>

          {/* Card 5: Survivor Campaign */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <FireOutlined />
              </div>
              <Tag color="gold" className="font-bold text-[10px] rounded-md mb-2">
                নেগেটিভ মার্কিং যুদ্ধ
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">সার্ভাইভার ক্যাম্পেইন</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                ৩টি লাইফলাইন নিয়ে আসল পরীক্ষার চাপ ও নেগেটিভ মার্কিং সামলানোর লাইভ স্পিড গেম। নিজেকে প্রস্তুত করুন কম সময়ে সর্বোচ্চ নির্ভুলতার জন্য।
              </p>
            </div>
            <Link href="/campaign" className="mt-5 block">
              <span className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center gap-1">
                ক্যাম্পেইনে অংশ নিন <ArrowRightOutlined className="text-[10px]" />
              </span>
            </Link>
          </div>

          {/* Card 6: SM-2 Spaced Flashcards & Mistakes Vault */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xl mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <StarFilled />
              </div>
              <Tag color="blue" className="font-bold text-[10px] rounded-md mb-2">
                বৈজ্ঞানিক অ্যালগরিদম
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">SM-2 স্পেসড রিভিশন কার্ড</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                ভুলের খাতা থেকে দুর্বল টপিক স্বয়ংক্রিয়ভাবে ফিল্টার করে পুনরাবৃত্তি করানো হয়, যা পরীক্ষার আগ পর্যন্ত তথ্য স্মৃতিতে স্থায়ী রাখতে সহায়তা করে।
              </p>
            </div>
            <Link href="/flashcards" className="mt-5 block">
              <span className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center gap-1">
                রিভিশন কার্ড প্র্যাকটিস <ArrowRightOutlined className="text-[10px]" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. COVERED EXAMS */}
      <section className="bg-slate-100/70 border-y border-gray-200 py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
            টার্গেটেড কম্পিটিটিভ পরীক্ষা
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
            যেসব নিয়োগ পরীক্ষার জন্য লেক্সিলার্ন ডিজাইন করা হয়েছে
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              '৪৬তম ও ৪৭তম বিসিএস প্রিলিমিনারি ও লিখিত',
              'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)',
              'সমন্বিত ৮ ও ১০ ব্যাংক অফিসার / সিনিয়র অফিসার',
              'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ (DPE)',
              'এনটিআরসিএ (NTRCA) শিক্ষক নিবন্ধন',
              'পিএসসি নন-ক্যাডার ও মন্ত্রণালয় পদ',
            ].map((exam, idx) => (
              <span
                key={idx}
                className="bg-white border border-gray-200 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 shadow-2xs flex items-center gap-2"
              >
                <SafetyCertificateFilled className="text-emerald-600" />
                <span>{exam}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ASPIRANT REVIEWS / WORKFLOW */}
      <section className="py-16 md:py-20 max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <Tag color="cyan" className="font-bold text-xs rounded-md mb-3 border-0">
              দৈনিক ৫ মিনিট লার্নিং রুটিন
            </Tag>
            <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white leading-snug">
              আজকের ১টি রুল, আগামীকালের ১ নম্বর নিশ্চিতি
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed mb-6">
              প্রতিদিন ঘুম থেকে উঠে কিংবা অবসরে শুধু ৫ মিনিট রিলস ফিডে চোখ বুলিয়ে নিন। আপনার নোটবুকে গুরুত্বপূর্ণ বিষয়গুলো জমা হতে থাকবে।
            </p>
            <div className="flex items-center gap-3">
              <Link href="/feed">
                <Button
                  type="primary"
                  className="bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 font-black rounded-xl h-11 px-6 text-xs border-0 shadow-md"
                >
                  ফিডে যান
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-xl h-11 px-5 text-xs border-white/20"
                >
                  প্রোফাইল সেট করুন
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md w-full md:w-80 space-y-3">
            <div className="flex items-center gap-2 text-amber-300">
              <StarFilled />
              <StarFilled />
              <StarFilled />
              <StarFilled />
              <StarFilled />
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed italic m-0">
              &ldquo;বিসিএস প্রিলির কঠিন ভোকাবুলারি আর ব্যাকরণ এত সহজ নেমোনিক ও ফিড স্টাইলে মনে থাকবে ভাবিনি। নোটবুক ফিচারটি রিভিশন অনেক সহজ করে দিয়েছে।&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                <UserOutlined />
              </div>
              <div>
                <span className="font-black text-xs text-white block">তানভীর আহমেদ</span>
                <span className="text-[10px] text-emerald-300/80">৪৬তম বিসিএস পরীক্ষার্থী</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              L
            </div>
            <span className="font-black text-slate-900 text-sm">LexiLearn</span>
            <span>• চাকরিপ্রার্থীদের স্মার্ট সহযোগী</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-gray-600">
            <Link href="/feed" className="hover:text-emerald-700">
              ফিড
            </Link>
            <Link href="/notebook" className="hover:text-emerald-700">
              নোটবুক
            </Link>
            <Link href="/bangla/baghdhara" className="hover:text-emerald-700">
              বাগধারা
            </Link>
            <Link href="/campaign" className="hover:text-emerald-700">
              ক্যাম্পেইন
            </Link>
            <Link href="/profile" className="hover:text-emerald-700">
              প্রোফাইল
            </Link>
          </div>

          <span className="text-[11px] text-gray-400">© 2026 LexiLearn. সর্বস্বত্ব সংরক্ষিত।</span>
        </div>
      </footer>
    </div>
  );
}
