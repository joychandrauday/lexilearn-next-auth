import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from 'antd';
import {
  Scale,
  FileCheck,
  Users,
  UserCheck,
  Ban,
  Copyright,
  Brain,
  Bell,
  ServerCog,
  UserX,
  ShieldAlert,
  Gavel,
  RefreshCw,
  Mail,
  ArrowRight,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Lock,
  Sparkles,
} from 'lucide-react';
import { siteConfig } from '../../lib/config/site';

export const metadata: Metadata = {
  title: 'ব্যবহারের শর্তাবলী (Terms of Service)',
  description:
    'OwlPrep (by Grow With Owl)-এর ব্যবহারের শর্তাবলী—সেবার ব্যবহার, অ্যাকাউন্ট, গ্রহণযোগ্য ব্যবহার, ব্যবহারকারীর কনটেন্ট, মেধাস্বত্ব, এআই উত্তর, দায়বদ্ধতা ও যোগাযোগ।',
  alternates: {
    canonical: 'https://growwithowl.com/terms',
  },
  openGraph: {
    title: 'ব্যবহারের শর্তাবলী | OwlPrep',
    description:
      'OwlPrep ব্যবহারের স্পষ্ট নিয়ম, আপনার অধিকার ও আমাদের দায়বদ্ধতার সীমা—সম্পূর্ণ শর্তাবলী বাংলায়।',
    url: 'https://growwithowl.com/terms',
    siteName: 'OwlPrep by Grow With Owl',
    locale: 'bn_BD',
    type: 'website',
  },
};

const LAST_UPDATED = '১১ নভেম্বর ২০২৬';
const POLICY_VERSION = '১.০';

const tableOfContents = [
  { id: 'acceptance', label: '১. শর্তাবলিতে সম্মতি' },
  { id: 'service', label: '২. সেবার বর্ণনা' },
  { id: 'account', label: '৩. অ্যাকাউন্ট ও যোগ্যতা' },
  { id: 'acceptable-use', label: '৪. গ্রহণযোগ্য ব্যবহার' },
  { id: 'user-content', label: '৫. আপনার কনটেন্ট' },
  { id: 'intellectual-property', label: '৬. মেধাস্বত্ব' },
  { id: 'ai-content', label: '৭. এআই ও শিক্ষাসামগ্রী' },
  { id: 'communications', label: '৮. যোগাযোগ ও তৃতীয় পক্ষ' },
  { id: 'availability', label: '৯. সেবার প্রাপ্যতা' },
  { id: 'termination', label: '১০. অ্যাকাউন্ট বন্ধ করা' },
  { id: 'liability', label: '১১. দায়বদ্ধতার সীমা' },
  { id: 'indemnity', label: '১২. ক্ষতিপূরণ' },
  { id: 'law', label: '১৩. প্রযোজ্য আইন' },
  { id: 'changes', label: '১৪. শর্তাবলির পরিবর্তন' },
  { id: 'contact', label: '১৫. যোগাযোগ' },
];

const prohibitedUses = [
  'অবৈধ, প্রতারণামূলক বা অন্যের ক্ষতিসাধনকারী কাজে প্ল্যাটফর্ম ব্যবহার করা',
  'পরীক্ষার প্রশ্ন ফাঁস, উত্তর বিনিময় বা অন্য কারও পরীক্ষায় অনৈতিক সহায়তা দেওয়া',
  'অন্য ব্যবহারকারীকে harass, threat, অপমান বা বৈষম্যমূলক মন্তব্য করা',
  'ভুয়া অ্যাকাউন্ট তৈরি, পরিচয় গোপন বা অন্য কারও অ্যাকাউন্ট ব্যবহার করা',
  'স্বয়ংক্রিয় বট, স্ক্র্যাপার বা অননুমোদিত উপায়ে ডেটা সংগ্রহ করা',
  'সাইটের কোড reverse engineer, hack, overload বা নিরাপত্তা ব্যবস্থা এড়ানোর চেষ্টা করা',
  'ম্যালওয়্যার, স্প্যাম বা ক্ষতিকর লিংক ছড়ানো',
  'কপিরাইট বা অন্যের মেধাস্বত্ব লঙ্ঘন করে কনটেন্ট আপলোড করা',
  'বাণিজ্যিক উদ্দেশ্যে অনুমতি ছাড়া কনটেন্ট কপি, বিক্রি বা পুনঃপ্রকাশ করা',
  'সেবার স্বাভাবিক কার্যক্রম ব্যাহত করার যেকোনো চেষ্টা করা',
];

const rights = [
  {
    icon: UserCheck,
    title: 'অ্যাকাউন্টের নিরাপত্তা',
    description: 'আপনার অ্যাকাউন্টে হওয়া কার্যকলাপের দায়িত্ব আপনার; সন্দেহ হলে দ্রুত আমাদের জানান।',
  },
  {
    icon: BookOpen,
    title: 'ব্যক্তিগত ব্যবহারের লাইসেন্স',
    description: 'শুধু নিজের প্রস্তুতির জন্য সেবা ব্যবহার করতে পারবেন, বাণিজ্যিক পুনঃবিক্রয়ের জন্য নয়।',
  },
  {
    icon: Lock,
    title: 'নিয়ন্ত্রণ আপনার হাতে',
    description: 'যেকোনো সময় অ্যাকাউন্ট বন্ধ বা ডেটা মুছে ফেলার অনুরোধ করতে পারবেন।',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-7 sm:p-12 text-white border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>ব্যবহারের শর্তাবলী</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight m-0">
                স্পষ্ট নিয়মে,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                  নিশ্চিন্ত প্রস্তুতি
                </span>
              </h1>
              <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
                এই শর্তাবলী <strong className="text-white">{siteConfig.fullName}</strong> ব্যবহারের ক্ষেত্রে আপনার ও
                আমাদের মধ্যে একটি আইনি চুক্তি। কী করা যাবে, কী করা যাবে না এবং আমাদের দায়বদ্ধতা কোথায় শেষ—সবকিছু সহজ
                বাংলায় এখানে বলা হয়েছে।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] sm:text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-slate-200">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-300" />
                কার্যকর: {LAST_UPDATED}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-slate-200">
                <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                সংস্করণ {POLICY_VERSION}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-slate-200">
                <Scale className="w-3.5 h-3.5 text-teal-300" />
                পড়ার সময়: প্রায় ৮ মিনিট
              </span>
            </div>
          </div>
        </div>

        {/* Plain-language summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">সংক্ষেপে বুঝে নিন</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-900 text-sm block">যা আপনি পান</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                ব্যক্তিগত প্রস্তুতি, শব্দভাণ্ডার, রিভিশন কার্ড, প্রশ্নব্যাংক, প্ল্যানার ও এআই মেন্টর—নিজের শেখার জন্য।
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-900 text-sm block">যা আশা করা হয়</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                সৎ ব্যবহার, সঠিক তথ্য, অ্যাকাউন্টের নিরাপত্তা এবং অন্য ব্যবহারকারীর প্রতি সম্মান।
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 text-sm block">গুরুত্বপূর্ণ</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                কোনো পরীক্ষায় উত্তীর্ণ হওয়ার নিশ্চয়তা আমরা দিই না; এআই উত্তরও ভুল হতে পারে—যাচাই করে নিন।
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed m-0">
              এই শর্তাবলী ও আমাদের{' '}
              <Link href="/privacy" className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-600">
                গোপনীয়তা নীতি
              </Link>{' '}
              একসঙ্গে আপনার ও OwlPrep-এর মধ্যকার সম্পূর্ণ চুক্তি গঠন করে।
            </p>
          </div>
        </div>

        {/* Body with sticky TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 lg:gap-8 items-start">
          <aside className="lg:sticky lg:top-24 bg-white rounded-3xl border border-gray-200 shadow-xs p-5 hidden lg:block">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">সূচিপত্র</h2>
            </div>
            <nav aria-label="ব্যবহারের শর্তাবলির সূচিপত্র">
              <ul className="space-y-1 m-0 p-0 list-none">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] text-slate-500 leading-relaxed m-0">
                শর্ত নিয়ে প্রশ্ন আছে? লিখুন।
              </p>
              <a
                href={`mailto:${siteConfig.links.supportEmail}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-600 break-all"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {siteConfig.links.supportEmail}
              </a>
            </div>
          </aside>

          <div className="space-y-6 min-w-0">
            {/* 1. Acceptance */}
            <section
              id="acceptance"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  শর্তাবলিতে সম্মতি
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                <strong className="text-slate-800">{siteConfig.fullName}</strong>-এর ওয়েবসাইট, PWA, মোবাইল
                অ্যাপ্লিকেশন বা সংশ্লিষ্ট যেকোনো সেবা ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী মেনে নিচ্ছেন। আপনি যদি
                এই শর্তাবলীর কোনো অংশে সম্মত না হন, তাহলে সেবাটি ব্যবহার করা থেকে বিরত থাকুন।
              </p>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                আপনার বয়স কমপক্ষে ১৩ বছর হতে হবে এবং আপনি আইনত এই চুক্তি করার যোগ্য হতে হবে। ১৮ বছরের কম বয়সী
                ব্যবহারকারীদের অভিভাবক বা আইনি অভিভাবকের সম্মতি ও তত্ত্বাবধানে সেবা ব্যবহার করা উচিত।
              </p>

              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 flex items-start gap-3">
                <Scale className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-[11px] sm:text-xs text-emerald-900 leading-relaxed m-0">
                  <strong>সেবা প্রদানকারী:</strong> {siteConfig.parentBrand} (OwlPrep), ঢাকা, বাংলাদেশ। যোগাযোগ:{' '}
                  {siteConfig.links.supportEmail}
                </p>
              </div>
            </section>

            {/* 2. Service */}
            <section
              id="service"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ২
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">সেবার বর্ণনা</h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                OwlPrep বাংলাদেশের প্রতিযোগিতামূলক চাকরি ও ভর্তি পরীক্ষার প্রস্তুতির জন্য একটি ডিজিটাল শেখার
                প্ল্যাটফর্ম। এর মধ্যে রয়েছে শব্দভাণ্ডার, বাগধারা, ফ্ল্যাশকার্ড ও SM-2 রিভিশন, প্রশ্নব্যাংক, মডেল টেস্ট,
                কুইজ ডুয়েল, স্টাডি প্ল্যানার, দৈনিক ক্যাপসুল, নোটবুক, ভুলের খাতা, প্রস্তুতি ফিড এবং Owl AI মেন্টর।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'প্রস্তুতি ও রিভিশনের ব্যক্তিগত টুলস',
                  'স্ট্রিক, XP ও কুইজ ডুয়েলের গেমিফায়েড অভিজ্ঞতা',
                  'এআই মেন্টরের সহায়তা ও ব্যাখ্যা',
                  'বাংলা একাডেমি-ভিত্তিক ভাষা ও বানান সহায়িকা',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs text-slate-600 leading-relaxed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                OwlPrep কোনো সরকারি নিয়োগ কর্তৃপক্ষ, পিএসসি, ব্যাংক বা পরীক্ষা পরিচালনাকারী প্রতিষ্ঠানের সঙ্গে
                সম্পৃক্ত নয়। আমরা কোনো নির্দিষ্ট পরীক্ষায় উত্তীর্ণ হওয়া, নির্দিষ্ট স্কোর বা চাকরি পাওয়ার নিশ্চয়তা
                দিই না। বর্তমানে মূল ফিচারসমূহ বিনামূল্যে ব্যবহারযোগ্য; ভবিষ্যতে কোনো ফিচার Paid হলে আগে থেকেই
                স্পষ্টভাবে জানানো হবে।
              </p>
            </section>

            {/* 3. Account */}
            <section
              id="account"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৩
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  অ্যাকাউন্ট ও যোগ্যতা
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  অ্যাকাউন্ট তৈরি ও প্রবেশের জন্য আমরা Google Sign-In ব্যবহার করি। আপনি নিশ্চিত করছেন যে আপনার দেওয়া
                  নাম, ইমেইল ও অন্যান্য তথ্য সঠিক, সম্পূর্ণ এবং আপনার নিজের। একটি অ্যাকাউন্ট অন্য কারও সঙ্গে শেয়ার
                  করবেন না।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rights.map((right) => {
                  const Icon = right.icon;
                  return (
                    <div key={right.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 m-0">{right.title}</h3>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed m-0">{right.description}</p>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                আপনার অ্যাকাউন্টের পাসওয়ার্ড বা অ্যাক্সেস টোকেন গোপন রাখার দায়িত্ব আপনার। অননুমোদিত প্রবেশের সন্দেহ
                হলে অবিলম্বে <strong className="text-slate-800">{siteConfig.links.supportEmail}</strong> এ জানান।
              </p>
            </section>

            {/* 4. Acceptable use */}
            <section
              id="acceptable-use"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৪
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  গ্রহণযোগ্য ব্যবহার
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                OwlPrep একটি শেখার পরিবেশ। সবাই যেন নিরাপদে ও সম্মানের সঙ্গে প্রস্তুতি নিতে পারে—সেজন্য নিচের কাজগুলো
                নিষিদ্ধ:
              </p>

              <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Ban className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="text-sm font-bold text-rose-900 m-0">যা করা যাবে না</h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 m-0 p-0 list-none">
                  {prohibitedUses.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                নিয়ম ভঙ্গ হলে আমরা কনটেন্ট সরানো, সীমাবদ্ধতা আরোপ বা অ্যাকাউন্ট স্থগিত/বন্ধ করার অধিকার রাখি। গুরুতর
                ক্ষেত্রে প্রযোজ্য আইন অনুযায়ী ব্যবস্থা নেওয়া হতে পারে।
              </p>
            </section>

            {/* 5. User content */}
            <section
              id="user-content"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৫
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">আপনার কনটেন্ট</h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  আপনার তৈরি নোট, সংরক্ষিত শব্দ, মন্তব্য, ফিড পোস্ট বা অন্য কনটেন্টের মালিকানা আপনারই থাকে। তবে সেবা
                  পরিচালনা, সংরক্ষণ, প্রদর্শন ও উন্নয়নের জন্য আপনি আমাদের একটি non-exclusive, royalty-free, worldwide
                  লাইসেন্স দিচ্ছেন। আপনি কনটেন্ট মুছে ফেললে এই লাইসেন্স যুক্তিসঙ্গত সময়ে শেষ হবে, তবে ব্যাকআপ বা
                  সমষ্টিগত ডেটায় তা কিছুদিন থাকতে পারে।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'আপনার আপলোড করা কনটেন্টের বৈধতা ও অধিকার আপনার দায়িত্ব',
                  'পাবলিক ফিড বা কমিউনিটিতে পোস্ট করা কনটেন্ট অন্যরা দেখতে পারে',
                  'আপত্তিকর কনটেন্ট রিপোর্ট বা মডারেট করা হতে পারে',
                  'আপনার নিজের সৃষ্টিকর্মের কপিরাইট আপনি ধরে রাখেন',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs text-slate-600 leading-relaxed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed m-0">
                অন্য কারও কপিরাইট লঙ্ঘনকারী কনটেন্ট আপলোড করবেন না। অভিযোগ পেলে প্রযোজ্য আইন ও আমাদের নীতি অনুযায়ী
                কনটেন্ট সরানো হতে পারে।
              </p>
            </section>

            {/* 6. IP */}
            <section
              id="intellectual-property"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৬
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">মেধাস্বত্ব</h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Copyright className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  OwlPrep-এর নাম, লোগো, ডিজাইন, কোড, প্রশ্নব্যাংক, ব্যাখ্যা, অ্যালগরিদম, লেখা ও অন্যান্য কনটেন্ট{' '}
                  <strong className="text-slate-800">{siteConfig.parentBrand}</strong>-এর মালিকানাধীন বা লাইসেন্সপ্রাপ্ত।
                  আপনার ব্যক্তিগত, অ-বাণিজ্যিক প্রস্তুতির জন্য আমরা একটি সীমিত, অ-হস্তান্তরযোগ্য লাইসেন্স দিই।
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                লিখিত অনুমতি ছাড়া কনটেন্ট কপি, স্ক্র্যাপ, পুনঃপ্রকাশ, বিক্রি, ডেরিভেটিভ কাজ তৈরি বা প্রতিযোগী প্ল্যাটফর্মে
                ব্যবহার করা যাবে না। তৃতীয় পক্ষের নাম, ট্রেডমার্ক বা লোগো তাদের নিজ নিজ মালিকের সম্পত্তি।
              </p>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed m-0">
                  আমাদের সিস্টেম বা কনটেন্টের অননুমোদিত ব্যবহার শনাক্ত হলে আইনি পদক্ষেপ নেওয়ার অধিকার আমরা সংরক্ষণ
                  করি।
                </p>
              </div>
            </section>

            {/* 7. AI & content */}
            <section
              id="ai-content"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৭
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  এআই ও শিক্ষাসামগ্রী
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  Owl AI এবং অন্যান্য শেখার কনটেন্ট শুধু শিক্ষামূলক সহায়তার জন্য। এআই কখনও ভুল, অসম্পূর্ণ বা
                  পুরোনো তথ্য দিতে পারে। গুরুত্বপূর্ণ সিদ্ধান্ত, পরীক্ষার নিয়ম বা সরকারি তথ্যের ক্ষেত্রে সর্বদা
                  সংশ্লিষ্ট কর্তৃপক্ষের অফিসিয়াল সূত্র যাচাই করুন।
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 m-0">মনে রাখুন</h3>
                </div>
                <ul className="space-y-1.5 m-0 p-0 list-none">
                  {[
                    'এআইয়ের উত্তর কোনো আইনি, চিকিৎসা, আর্থিক বা পেশাগত পরামর্শ নয়।',
                    'পরীক্ষার সিলেবাস, নোটিশ ও ফলাফলের চূড়ান্ত সূত্র সংশ্লিষ্ট সরকারি কর্তৃপক্ষ।',
                    'এআই চ্যাটে পাসওয়ার্ড, ওটিপি বা সংবেদনশীল ব্যক্তিগত তথ্য দেবেন না।',
                    'ভুল বা ক্ষতিকর উত্তর পেলে আমাদের রিপোর্ট করুন, যাতে আমরা উন্নতি করতে পারি।',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-amber-900/90 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 8. Communications & third party */}
            <section
              id="communications"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৮
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  যোগাযোগ ও তৃতীয় পক্ষ
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  নিউজলেটার বা স্টাডি বুলেটিনে সাবস্ক্রাইব করলে আমরা আপনার ইমেইলে প্রস্তুতি-সংশ্লিষ্ট তথ্য পাঠাতে পারি।
                  যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন। অ্যাকাউন্ট, নিরাপত্তা বা শর্ত পরিবর্তনের প্রয়োজনীয় নোটিশ
                  ইমেইলে বা সাইটে জানানো হতে পারে।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Google Sign-In</span>
                      <span className="block text-[11px] text-gray-500">অ্যাকাউন্ট যাচাইকরণ</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>

                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shrink-0">
                      <ServerCog className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-800">হোস্টিং ও ইনফ্রাস্ট্রাকচার</span>
                      <span className="block text-[11px] text-gray-500">সাইট পরিবেশন ও নিরাপত্তা</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed m-0">
                আমাদের সেবায় থাকা তৃতীয় পক্ষের লিংকে ক্লিক করলে তাদের নিজস্ব শর্ত ও গোপনীয়তা নীতি প্রযোজ্য হবে।
                তাদের কনটেন্ট বা নীতির জন্য আমরা দায়ী নই। বিস্তারিত আমাদের{' '}
                <Link href="/privacy" className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-600">
                  গোপনীয়তা নীতি
                </Link>{' '}
                তে দেখুন।
              </p>
            </section>

            {/* 9. Availability */}
            <section
              id="availability"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৯
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  সেবার প্রাপ্যতা ও পরিবর্তন
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  আমরা সেবা সচল রাখার সর্বোচ্চ চেষ্টা করি, তবে ইন্টারনেট, সার্ভার, তৃতীয় পক্ষের সেবা বা রক্ষণাবেক্ষণের
                  কারণে সাময়িক বিরতি, ধীরগতি বা ত্রুটি হতে পারে। সেবা &ldquo;যেমন আছে&rdquo; (as-is) ভিত্তিতে
                  প্রদান করা হয়।
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                আমরা যেকোনো সময় ফিচার যোগ, পরিবর্তন, স্থগিত বা বন্ধ করতে পারি। বড় ধরনের পরিবর্তন হলে সাইটে বা
                ইমেইলে যুক্তিসঙ্গতভাবে জানানোর চেষ্টা করা হবে। Beta বা পরীক্ষামূলক ফিচারে অতিরিক্ত ত্রুটি থাকতে পারে।
              </p>
            </section>

            {/* 10. Termination */}
            <section
              id="termination"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১০
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  অ্যাকাউন্ট বন্ধ করা
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <UserX className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  আপনি যেকোনো সময় সেবা ব্যবহার বন্ধ করতে পারেন এবং অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে পারেন। অন্যদিকে,
                  এই শর্তাবলী বা প্রযোজ্য আইন লঙ্ঘন করলে, নিরাপত্তা ঝুঁকি তৈরি করলে বা অন্য ব্যবহারকারীর ক্ষতি করলে
                  আমরা অ্যাকাউন্ট স্থগিত বা বন্ধ করতে পারি।
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                অ্যাকাউন্ট বন্ধ হলে আপনার ব্যক্তিগত ডেটা আমাদের{' '}
                <Link href="/privacy" className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-600">
                  গোপনীয়তা নীতি
                </Link>{' '}
                অনুযায়ী মুছে ফেলা হবে। তবে আইনি বাধ্যবাধকতা, নিরাপত্তা বা বিরোধ নিষ্পত্তির জন্য কিছু রেকর্ড নির্ধারিত
                মেয়াদ পর্যন্ত সংরক্ষিত থাকতে পারে। মালিকানা, দায়বদ্ধতার সীমা ও বিরোধ নিষ্পত্তি সংক্রান্ত ধারাগুলো
                অ্যাকাউন্ট বন্ধের পরও কার্যকর থাকবে।
              </p>
            </section>

            {/* 11. Liability */}
            <section
              id="liability"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১১
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  দায়বদ্ধতার সীমা
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  প্রযোজ্য আইনের সর্বোচ্চ অনুমোদিত সীমা পর্যন্ত, OwlPrep ও {siteConfig.parentBrand} সেবার ব্যবহার বা
                  ব্যবহারে অক্ষমতা থেকে উদ্ভূত পরোক্ষ, আকস্মিক, বিশেষ বা ফলাফলভিত্তিক ক্ষতির জন্য দায়ী থাকবে না।
                  এর মধ্যে হারানো ডেটা, হারানো সুযোগ, পরীক্ষার ফলাফল বা তৃতীয় পক্ষের কাজ অন্তর্ভুক্ত।
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed m-0">
                  সেবা বিনামূল্যে হওয়ায়, প্রযোজ্য আইন যতটুকু অনুমতি দেয়, আমাদের সামগ্রিক দায়বদ্ধতা সেই সীমার মধ্যেই
                  থাকবে। তবে কোনো ভোক্তা-অধিকার বা আইনগতভাবে বাদ দেওয়া যায় না এমন দায় আমরা বাদ দিচ্ছি না।
                </p>
              </div>
            </section>

            {/* 12. Indemnity */}
            <section
              id="indemnity"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১২
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">ক্ষতিপূরণ</h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                আপনি এই শর্তাবলী ভঙ্গ করলে, আপনার কনটেন্ট বা ব্যবহারের কারণে তৃতীয় পক্ষের কোনো দাবি, ক্ষতি, আইনি
                খরচ বা দায় তৈরি হলে, প্রযোজ্য আইন অনুযায়ী আপনি OwlPrep ও {siteConfig.parentBrand}-কে ক্ষতিপূরণ দিতে
                সম্মত হচ্ছেন। আমরা নিজের পক্ষ থেকে যুক্তিসঙ্গতভাবে আত্মপক্ষ সমর্থন ও সহযোগিতা করার অধিকার রাখি।
              </p>
            </section>

            {/* 13. Law */}
            <section
              id="law"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১৩
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Gavel className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  এই শর্তাবলী বাংলাদেশের প্রযোজ্য আইন দ্বারা পরিচালিত হবে। বিরোধ দেখা দিলে প্রথমে আমাদের সঙ্গে
                  আলোচনার মাধ্যমে সমাধানের চেষ্টা করুন। ৩০ দিনের মধ্যে সমাধান না হলে বাংলাদেশের competent court,
                  বিশেষত ঢাকার আদালতের একচেটিয়া এখতিয়ার প্রযোজ্য হবে।
                </p>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed m-0">
                কিছু কিছু ক্ষেত্রে ভোক্তা সুরক্ষা বা অন্য বাধ্যতামূলক আইন ভিন্ন অধিকার দিতে পারে; সেক্ষেত্রে সেই আইনই
                প্রাধান্য পাবে।
              </p>
            </section>

            {/* 14. Changes */}
            <section
              id="changes"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১৪
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  শর্তাবলির পরিবর্তন
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  নতুন ফিচার, আইনি পরিবর্তন বা নিরাপত্তার প্রয়োজনে আমরা এই শর্তাবলী আপডেট করতে পারি। উল্লেখযোগ্য
                  পরিবর্তন হলে সাইটে স্পষ্ট নোটিশ দেওয়া হবে এবং প্রয়োজন হলে ইমেইলে জানানো হবে। আপডেটের পর সেবা
                  ব্যবহার চালিয়ে গেলে নতুন শর্তাবলী আপনার ক্ষেত্রে প্রযোজ্য হবে।
                </p>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed m-0">
                সর্বশেষ সংস্করণ ও কার্যকর তারিখ এই পেজের শুরুতে দেখানো হয়েছে।
              </p>
            </section>

            {/* 15. Contact */}
            <section
              id="contact"
              className="scroll-mt-24 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-9 text-white border border-emerald-500/20 shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                    ১৫
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight m-0">যোগাযোগ করুন</h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed m-0">
                  এই শর্তাবলী, সেবার ব্যবহার বা আইনি বিষয়ে কোনো প্রশ্ন থাকলে আমাদের লিখুন। আমরা যুক্তিসঙ্গত সময়ের
                  মধ্যে সাড়া দেওয়ার চেষ্টা করব।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <a
                    href={`mailto:${siteConfig.links.supportEmail}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        সাধারণ সহায়তা
                      </span>
                      <span className="block text-xs font-bold text-white break-all">
                        {siteConfig.links.supportEmail}
                      </span>
                    </div>
                  </a>

                  <a
                    href={`mailto:${siteConfig.links.adminEmail}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
                  >
                    <Scale className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        আইনি ও প্রশাসনিক
                      </span>
                      <span className="block text-xs font-bold text-white break-all">
                        {siteConfig.links.adminEmail}
                      </span>
                    </div>
                  </a>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed m-0">
                  {siteConfig.parentBrand} (OwlPrep) • ঢাকা, বাংলাদেশ • সর্বশেষ আপডেট: {LAST_UPDATED}
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight m-0">
              নিয়ম জানা হলো, এবার প্রস্তুতি শুরু করুন
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 m-0">
              নিরাপদ ও সৎ ব্যবহারে সবার জন্য আরও ভালো একটি শেখার পরিবেশ তৈরি হবে।
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <Link href="/privacy">
              <Button className="rounded-xl h-11 px-5 font-bold text-xs border-slate-200 text-slate-600 hover:!text-emerald-700 hover:!border-emerald-300">
                গোপনীয়তা নীতি
              </Button>
            </Link>
            <Link href="/feed">
              <Button
                type="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-xl h-11 px-5 text-xs border-0 shadow-md inline-flex items-center gap-1.5 flex-row-reverse"
              >
                প্রস্তুতি শুরু করুন
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
