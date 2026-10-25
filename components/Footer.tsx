'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, message as antMessage } from 'antd';
import {
  MailOutlined,
  SendOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
  SafetyCertificateFilled,
  GithubOutlined,
  LinkedinOutlined,
  FacebookOutlined,
  BookOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Target,
  Brain,
  Layers,
  Heart,
} from 'lucide-react';
import axios from 'axios';
import { siteConfig, setStoredUserEmail } from '../lib/config/site';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      antMessage.warning('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/user/lead', {
        email: email.trim().toLowerCase(),
        source: 'footer_newsletter',
        targetExam: 'bcs',
      });

      if (res.data?.success) {
        setSubscribed(true);
        antMessage.success('ধন্যবাদ! আপনি সফলভাবে স্টাডি বুলেটিনে সাবস্ক্রাইব করেছেন।');
        if (typeof window !== 'undefined') {
          setStoredUserEmail(email.trim().toLowerCase());
        }
        setEmail('');
      }
    } catch {
      antMessage.error('সাবস্ক্রিপশনে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-800/80 relative overflow-hidden select-none">
      {/* Glow backdrop */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP SECTION: Study Bulletin / Newsletter */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>সাপ্তাহিক স্টাডি বুলেটিন</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white m-0 mb-1">
              বিসিএস ও ব্যাংক স্পেশাল প্রস্তুতি নোট ইনবক্সে পান
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 m-0 font-normal">
              প্রতি সপ্তাহে বাছাইকৃত সম্পাদকীয় শব্দ, বিগত বছরের ট্র্যাপ প্রশ্ন এবং সংবিধান ও ব্যাকরণ শর্টকাট শিট সরাসরি ইমেইলে।
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2 max-w-md">
            <Input
              prefix={<MailOutlined className="text-slate-500 mr-1" />}
              placeholder="আপনার সচল ইমেইল লিখুন..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting || subscribed}
              className="bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 rounded-xl h-11 text-xs sm:text-sm px-3.5 w-full sm:w-72 hover:border-emerald-500 focus:border-emerald-500"
            />
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SendOutlined />}
              disabled={subscribed}
              className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-11 px-6 border-0 text-xs w-full sm:w-auto shrink-0 shadow-md shadow-emerald-950/40"
            >
              {subscribed ? 'যুক্ত হয়েছেন' : 'সাবস্ক্রাইব'}
            </Button>
          </form>
        </div>
      </div>

      {/* MAIN FOOTER COLUMNS */}
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand & Mission */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-base shadow-sm">
                🦉
              </div>
              <div>
                <span className="font-black text-white text-lg tracking-tight block leading-none">{siteConfig.name}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">by {siteConfig.parentBrand}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              বাংলাদেশের প্রতিটি চাকরিপ্রার্থীর দীর্ঘ ও ক্লান্তিকর প্রস্তুতিকে সহজ, কার্যকর ও স্মৃতিতে স্থায়ী করে তোলার সার্বিক প্ল্যাটফর্ম।
            </p>

            <div className="pt-2 space-y-1.5 text-[11px] text-slate-400 font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircleFilled />
                <span>৯৯% ভেরিফাইড বিগত প্রশ্ন</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircleFilled />
                <span>বাংলা একাডেমি প্রমিত বানান</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircleFilled />
                <span>SM-2 বৈজ্ঞানিক অ্যালগরিদম</span>
              </div>
            </div>

            {/* Social & Founder Links */}
            <div className="flex items-center gap-2 pt-3">
              <a
                href={siteConfig.creator.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Joy Chandra Uday Portfolio"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
              </a>
              <a
                href={siteConfig.creator.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Joy Chandra Uday LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 transition"
              >
                <LinkedinOutlined />
              </a>
              <a
                href={siteConfig.creator.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Joy Chandra Uday GitHub"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 transition"
              >
                <GithubOutlined />
              </a>
              <a
                href={siteConfig.creator.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="G2G Digital"
                className="px-2 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-300 hover:text-white hover:border-amber-400 transition"
              >
                G2G
              </a>
            </div>
          </div>

          {/* Column 2: মূল প্রস্তুতি টুলস (Core Features) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1.5">
              মূল প্রস্তুতি টুলস
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 pl-0 list-none m-0">
              <li>
                <Link href="/feed" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <span>প্রস্তুতি রিলস ফিড</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30">রিলস</span>
                </Link>
              </li>
              <li>
                <Link href="/notebook" className="hover:text-emerald-400 transition">
                  স্টাডি নোটবুক ও বাইন্ডার
                </Link>
              </li>
              <li>
                <Link href="/bangla/baghdhara" className="hover:text-emerald-400 transition">
                  ৬৪৮+ প্রমিত বাগধারা কোষ
                </Link>
              </li>
              <li>
                <Link href="/campaign" className="hover:text-emerald-400 transition">
                  সার্ভাইভার ক্যাম্পেইন
                </Link>
              </li>
              <li>
                <Link href="/flashcards" className="hover:text-emerald-400 transition">
                  SM-2 রিভিশন কার্ড
                </Link>
              </li>
              <li>
                <Link href="/words" className="hover:text-emerald-400 transition">
                  সম্পূর্ণ ভোকাবুলারি ডিরেক্টরি
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-emerald-400 transition">
                  বিগত প্রশ্ন মডেল টেস্ট
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: লক্ষ্যভিত্তিক নিয়োগ পরীক্ষা (Target Exam Hubs) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1.5">
              নিয়োগ পরীক্ষা হাব
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 pl-0 list-none m-0">
              <li>
                <Link href="/feed" className="hover:text-emerald-400 transition">
                  ৪৬তম ও ৪৭তম বিসিএস প্রিলি
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-emerald-400 transition">
                  বাংলাদেশ ব্যাংক এডি (AD)
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-emerald-400 transition">
                  সমন্বিত ৮ ও ১০ সরকারি ব্যাংক
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-emerald-400 transition">
                  প্রাথমিক সহকারী শিক্ষক (DPE)
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-emerald-400 transition">
                  এনটিআরসিএ শিক্ষক নিবন্ধন
                </Link>
              </li>
              <li>
                <Link href="/cloze" className="hover:text-emerald-400 transition">
                  ব্যাংক রিডিং ও ক্লজ টেস্ট
                </Link>
              </li>
              <li>
                <Link href="/spelling" className="hover:text-emerald-400 transition">
                  বানান শুদ্ধিকরণ ট্র্যাপ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: স্মার্ট রিসোর্স ও ভল্ট (Resources & Vaults) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1.5">
              রিসোর্স ও ভল্ট
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 pl-0 list-none m-0">
              <li>
                <Link href="/panic-sheet" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <span>পরীক্ষার রিভিশন শিট</span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">হট</span>
                </Link>
              </li>
              <li>
                <Link href="/mistakes" className="hover:text-emerald-400 transition">
                  ভুলের খাতা (Mistake Vault)
                </Link>
              </li>
              <li>
                <Link href="/my-words" className="hover:text-emerald-400 transition">
                  আমার সংরক্ষিত শব্দ
                </Link>
              </li>
              <li>
                <Link href="/bangla/karok" className="hover:text-emerald-400 transition">
                  কারক ও বিভক্তি সহায়িকা
                </Link>
              </li>
              <li>
                <Link href="/bangla/somarthok" className="hover:text-emerald-400 transition">
                  সমার্থক শব্দ ভাণ্ডার
                </Link>
              </li>
              <li>
                <Link href="/add" className="hover:text-emerald-400 transition">
                  নতুন শব্দ যোগ করুন
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: অ্যাকাউন্ট ও গাইডলাইন (Account & Help) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1.5">
              অ্যাকাউন্ট ও সহায়তা
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 pl-0 list-none m-0">
              <li>
                <Link href="/profile" className="hover:text-emerald-400 transition">
                  আমার প্রোফাইল
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  সাইন ইন / রেজিস্ট্রেশন
                </Link>
              </li>
              <li>
                <span
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent(siteConfig.bot.legacyEventTrigger, {
                          detail: { prompt: `${siteConfig.nameBn} প্ল্যাটফর্ম ব্যবহারের সার্বিক নিয়ম ও ফিচার গাইড দিন।` },
                        })
                      );
                    }
                  }}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  ব্যবহারের নির্দেশিকা
                </span>
              </li>
              <li>
                <span
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent(siteConfig.bot.legacyEventTrigger, {
                          detail: { prompt: `${siteConfig.nameBn} ভেরিফিকেশন সিস্টেম এবং বাংলা একাডেমি প্রমিত বানান পদ্ধতি কীভাবে কাজ করে?` },
                        })
                      );
                    }
                  }}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  ভেরিফিকেশন সিস্টেম
                </span>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition">
                  আমাদের সম্পর্কে ও নির্মাতা
                </Link>
              </li>
              <li>
                <span className="text-slate-500">গোপনীয়তা ও নিরাপত্তা নীতি</span>
              </li>
              <li>
                <span className="text-slate-500">ব্যবহারের শর্তাবলী</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM LEGAL & SYSTEM STATUS BAR */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span>© 2026 {siteConfig.name} by {siteConfig.parentBrand}. সর্বস্বত্ব সংরক্ষিত।</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>
              নির্মাতা:{' '}
              <a
                href={siteConfig.creator.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 transition-colors"
              >
                Joy Chandra Uday
              </a>{' '}
              (Co-Founder,{' '}
              <a
                href={siteConfig.creator.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-200 font-semibold"
              >
                G2G Digital
              </a>
              )
            </span>
          </div>

          {/* Live System Status Pill */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>এআই ইঞ্জিন ও সার্ভার সক্রিয়</span>
            </div>

            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              মেড উইথ <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> ফর বাংলাদেশি চাকরিপ্রার্থী
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
