import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from 'antd';
import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Cookie,
  ServerCog,
  UserCheck,
  Baby,
  RefreshCw,
  Mail,
  ArrowRight,
  CalendarDays,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Pencil,
  Download,
  Bell,
  Brain,
  Fingerprint,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { siteConfig } from '../../lib/config/site';

export const metadata: Metadata = {
  title: 'গোপনীয়তা ও নিরাপত্তা নীতি (Privacy Policy)',
  description:
    'OwlPrep (by Grow With Owl) কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ ও সুরক্ষিত রাখে, আপনার অধিকার কী এবং কীভাবে ডেটা মুছবেন—সম্পূর্ণ গোপনীয়তা নীতি বাংলায়।',
  alternates: {
    canonical: 'https://growwithowl.com/privacy',
  },
  openGraph: {
    title: 'গোপনীয়তা ও নিরাপত্তা নীতি | OwlPrep',
    description:
      'আপনার ডেটা, আপনার নিয়ন্ত্রণে। OwlPrep-এ তথ্য সংগ্রহ, কুকিজ, তৃতীয় পক্ষের সেবা ও আপনার অধিকার সম্পর্কে জানুন।',
    url: 'https://growwithowl.com/privacy',
    siteName: 'OwlPrep by Grow With Owl',
    locale: 'bn_BD',
    type: 'website',
  },
};

const LAST_UPDATED = '১১ নভেম্বর ২০২৬';
const POLICY_VERSION = '১.০';

const tableOfContents = [
  { id: 'scope', label: '১. এই নীতির পরিধি' },
  { id: 'data-we-collect', label: '২. আমরা কী তথ্য সংগ্রহ করি' },
  { id: 'how-we-use', label: '৩. তথ্য কীভাবে ব্যবহার করি' },
  { id: 'cookies', label: '৪. কুকিজ ও লোকাল স্টোরেজ' },
  { id: 'sharing', label: '৫. তৃতীয় পক্ষের সেবা' },
  { id: 'security', label: '৬. তথ্যের নিরাপত্তা' },
  { id: 'retention', label: '৭. তথ্য সংরক্ষণের মেয়াদ' },
  { id: 'rights', label: '৮. আপনার অধিকার' },
  { id: 'children', label: '৯. শিশুদের গোপনীয়তা' },
  { id: 'changes', label: '১০. নীতির পরিবর্তন' },
  { id: 'contact', label: '১১. যোগাযোগ' },
];

const dataGroups = [
  {
    icon: UserCheck,
    title: 'অ্যাকাউন্ট ও পরিচিতি',
    tone: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
    iconTone: 'bg-emerald-100 text-emerald-700',
    items: [
      'গুগল সাইন-ইন থেকে নাম, ইমেইল ঠিকানা ও প্রোফাইল ছবি',
      'সেশন টোকেন ও লগইন সংক্রান্ত তথ্য',
      'আপনি নিজে দেওয়া প্রোফাইল ছবি ও প্রদর্শিত নাম',
    ],
  },
  {
    icon: Database,
    title: 'প্রস্তুতি ও শেখার তথ্য',
    tone: 'bg-blue-50/70 border-blue-200 text-blue-900',
    iconTone: 'bg-blue-100 text-blue-700',
    items: [
      'সংরক্ষিত শব্দ, স্টাডি নোটবুক ও ভুলের খাতা (Mistake Vault)',
      'ফ্ল্যাশকার্ড রিভিউ ইতিহাস ও SM-2 রিভিশন সূচি',
      'স্ট্রিক, XP, কুইজ ডুয়েলের ফলাফল ও লিডারবোর্ড স্কোর',
      'স্টাডি প্ল্যানার রুটিন ও সম্পন্ন করা দৈনিক ক্যাপসুল',
    ],
  },
  {
    icon: FileText,
    title: 'প্রোফাইল ও যোগাযোগ',
    tone: 'bg-indigo-50/70 border-indigo-200 text-indigo-900',
    iconTone: 'bg-indigo-100 text-indigo-700',
    items: [
      'লক্ষ্য পরীক্ষা, প্রস্তুতির ধাপ, জেলা ও প্রতিষ্ঠান',
      'আপনি দিলে ফোন নম্বর, ঠিকানা ও সংক্ষিপ্ত বায়ো',
      'নিউজলেটার ইমেইল ও সাবস্ক্রিপশনের উৎস',
      'নোটিফিকেশন টোকেন, প্ল্যাটফর্ম ও সংযুক্ত ইমেইল',
    ],
  },
  {
    icon: Brain,
    title: 'এআই মেন্টর ব্যবহারের তথ্য',
    tone: 'bg-amber-50/70 border-amber-200 text-amber-900',
    iconTone: 'bg-amber-100 text-amber-700',
    items: [
      'Owl AI-তে পাঠানো প্রশ্ন ও তার উত্তর',
      'প্রসঙ্গ বোঝার জন্য সাম্প্রতিক চ্যাট ইতিহাস',
      'চ্যাটে আপনি স্বেচ্ছায় দেওয়া ইমেইল বা ফোন নম্বর',
    ],
  },
  {
    icon: Fingerprint,
    title: 'প্রযুক্তিগত তথ্য',
    tone: 'bg-slate-100/80 border-slate-200 text-slate-900',
    iconTone: 'bg-slate-200 text-slate-700',
    items: [
      'আইপি ঠিকানা, ব্রাউজার ও ডিভাইসের ধরন',
      'পেজ ভিজিট, সেশন সময় ও ত্রুটির লগ',
      'কুকিজ, লোকাল স্টোরেজ ও Firebase Analytics ডেটা',
    ],
  },
];

const thirdParties = [
  {
    icon: UserCheck,
    name: 'Google OAuth',
    purpose: 'নিরাপদ সাইন-ইন ও অ্যাকাউন্ট যাচাইকরণ',
    url: 'https://policies.google.com/privacy',
  },
  {
    icon: Bell,
    name: 'Firebase Analytics',
    purpose: 'সমষ্টিগত ব্যবহার বিশ্লেষণ ও অ্যাপ উন্নয়ন',
    url: 'https://firebase.google.com/support/privacy',
  },
  {
    icon: Database,
    name: 'MongoDB ডেটাবেস হোস্টিং',
    purpose: 'আপনার প্রোফাইল ও শেখার ডেটা সংরক্ষণ',
    url: 'https://www.mongodb.com/legal/privacy-policy',
  },
  {
    icon: Brain,
    name: 'এআই সেবা প্রদানকারী',
    purpose: 'Owl AI মেন্টরের উত্তর তৈরি করতে টেক্সট প্রসেসিং',
    url: 'https://policies.google.com/privacy',
  },
  {
    icon: ServerCog,
    name: 'হোস্টিং ও CDN',
    purpose: 'সাইট পরিবেশন, নিরাপত্তা ও ত্রুটি পর্যবেক্ষণ',
    url: 'https://vercel.com/legal/privacy-policy',
  },
];

const rights = [
  {
    icon: Eye,
    title: 'দেখার অধিকার',
    description: 'আপনার সম্পর্কে আমরা কী তথ্য রেখেছি, তার একটি অনুলিপি চাইতে পারেন।',
  },
  {
    icon: Pencil,
    title: 'সংশোধনের অধিকার',
    description: 'প্রোফাইল পেজ থেকে নাম, জেলা, প্রতিষ্ঠান, ফোন ও অন্যান্য তথ্য নিজেই আপডেট করুন।',
  },
  {
    icon: Trash2,
    title: 'মুছে ফেলার অধিকার',
    description: 'অ্যাকাউন্ট ও সংশ্লিষ্ট ব্যক্তিগত তথ্য মুছে ফেলার অনুরোধ করতে পারেন।',
  },
  {
    icon: Download,
    title: 'নেওয়ার অধিকার',
    description: 'আপনার সংরক্ষিত প্রস্তুতির তথ্য মেশিন-পাঠযোগ্য ফরম্যাটে চাইতে পারেন।',
  },
  {
    icon: CheckCircle2,
    title: 'সম্মতি প্রত্যাহার',
    description: 'নিউজলেটার বা নোটিফিকেশন যেকোনো সময় বন্ধ করতে পারেন।',
  },
  {
    icon: ShieldCheck,
    title: 'অভিযোগ জানানোর অধিকার',
    description: 'গোপনীয়তা নিয়ে উদ্বেগ থাকলে আমাদের কাছে জানান; প্রযোজ্য আইন অনুযায়ী ব্যবস্থা নেওয়া হবে।',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-7 sm:p-12 text-white border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>গোপনীয়তা ও নিরাপত্তা নীতি</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight m-0">
                আপনার ডেটা,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                  আপনার নিয়ন্ত্রণে
                </span>
              </h1>
              <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
                <strong className="text-white">{siteConfig.fullName}</strong> আপনার বিশ্বাসকে গুরুত্ব দেয়। এই নীতিতে
                স্পষ্ট ভাষায় বলা হয়েছে—আমরা কী তথ্য সংগ্রহ করি, কেন করি, কীভাবে সুরক্ষিত রাখি এবং আপনি কীভাবে নিজের
                ডেটার নিয়ন্ত্রণ রাখতে পারেন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] sm:text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-slate-200">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-300" />
                কার্যকর: {LAST_UPDATED}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-slate-200">
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                সংস্করণ {POLICY_VERSION}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-slate-200">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                পড়ার সময়: প্রায় ৭ মিনিট
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
              <span className="font-bold text-emerald-900 text-sm block">যা দরকার, তাই সংগ্রহ করি</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                অ্যাকাউন্ট, প্রোফাইল ও আপনার প্রস্তুতির অগ্রগতি—শুধু সেবা চালু রাখতে ও অভিজ্ঞতা ব্যক্তিগত করতে।
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-900 text-sm block">আমরা তথ্য বিক্রি করি না</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                আপনার ব্যক্তিগত তথ্য কোনো বিজ্ঞাপনদাতা বা ডেটা ব্রোকারের কাছে বিক্রি বা ভাড়া দেওয়া হয় না।
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 text-sm block">নিয়ন্ত্রণ আপনার হাতে</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                প্রোফাইল নিজে সম্পাদনা করুন, নোটিফিকেশন বন্ধ করুন বা যেকোনো সময় ডেটা মুছতে বলুন।
              </p>
            </div>
          </div>
        </div>

        {/* Body with sticky TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 lg:gap-8 items-start">
          <aside className="lg:sticky lg:top-24 bg-white rounded-3xl border border-gray-200 shadow-xs p-5 hidden lg:block">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">সূচিপত্র</h2>
            </div>
            <nav aria-label="গোপনীয়তা নীতির সূচিপত্র">
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
                প্রশ্ন আছে? আমাদের সরাসরি লিখুন।
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
            {/* 1. Scope */}
            <section
              id="scope"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">এই নীতির পরিধি</h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                এই গোপনীয়তা নীতি <strong className="text-slate-800">{siteConfig.fullName}</strong>-এর ওয়েবসাইট
                (<span className="font-semibold">growwithowl.com</span>), প্রগ্রেসিভ ওয়েব অ্যাপ (PWA), মোবাইল
                অ্যাপ্লিকেশন এবং সংশ্লিষ্ট সব সেবার ক্ষেত্রে প্রযোজ্য। এখানে &ldquo;আমরা&rdquo; বলতে OwlPrep ও তার
                পরিচালনাকারী প্রতিষ্ঠান <strong className="text-slate-800">{siteConfig.parentBrand}</strong>-কে বোঝানো
                হয়েছে।
              </p>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি এই নীতিতে বর্ণিত তথ্য সংগ্রহ ও ব্যবহারের পদ্ধতিতে সম্মত হচ্ছেন।
                আপনি যদি এই নীতির সঙ্গে একমত না হন, তাহলে সেবাটি ব্যবহার করা থেকে বিরত থাকুন।
              </p>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed m-0">
                  <strong className="text-slate-800">ডেটা কন্ট্রোলার:</strong> {siteConfig.parentBrand} (OwlPrep),
                  ঢাকা, বাংলাদেশ। যোগাযোগ: {siteConfig.links.supportEmail}
                </p>
              </div>
            </section>

            {/* 2. Data we collect */}
            <section
              id="data-we-collect"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-5"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ২
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  আমরা কী তথ্য সংগ্রহ করি
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                আমরা কেবল সেই তথ্যই সংগ্রহ করি, যা প্ল্যাটফর্ম চালু রাখতে, আপনার অগ্রগতি সংরক্ষণ করতে এবং প্রস্তুতিকে
                আরও কার্যকর করতে প্রয়োজন।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.title} className={`p-4 rounded-2xl border space-y-3 ${group.tone}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${group.iconTone}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <h3 className="text-sm font-bold m-0">{group.title}</h3>
                      </div>
                      <ul className="space-y-1.5 m-0 p-0 list-none">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-sm font-bold text-rose-900 m-0">যা আমরা চাই না</h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed m-0">
                    পাসওয়ার্ড, ওটিপি, ব্যাংক বা কার্ডের তথ্য, জাতীয় পরিচয়পত্রের পূর্ণ নম্বর—কখনোই AI চ্যাট, নোট বা
                    কমিউনিটি পোস্টে শেয়ার করবেন না। এসব সংবেদনশীল তথ্য প্ল্যাটফর্মের জন্য প্রয়োজন নেই।
                  </p>
                </div>
              </div>
            </section>

            {/* 3. How we use */}
            <section
              id="how-we-use"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৩
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  তথ্য কীভাবে ব্যবহার করি
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'অ্যাকাউন্ট তৈরি, সাইন-ইন ও সেশন পরিচালনা করা',
                  'শব্দ, নোট, ভুলের খাতা ও রিভিশন সূচি ক্লাউডে সিঙ্ক করা',
                  'SM-2 অ্যালগরিদম অনুযায়ী সঠিক সময়ে রিভিশন দেখানো',
                  'স্ট্রিক, XP, ব্যাজ ও কুইজ ডুয়েলের ফলাফল গণনা করা',
                  'Owl AI মেন্টরের প্রশ্নের প্রাসঙ্গিক উত্তর তৈরি করা',
                  'নিউজলেটার, স্টাডি বুলেটিন ও প্রয়োজনীয় নোটিশ পাঠানো',
                  'সাইটের ত্রুটি খুঁজে বের করা ও পারফরম্যান্স উন্নত করা',
                  'প্রতারণা, অপব্যবহার ও নিরাপত্তা ঝুঁকি প্রতিরোধ করা',
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
                আমরা আপনার ব্যক্তিগত তথ্য কোনো বিজ্ঞাপনদাতা বা ডেটা ব্রোকারের কাছে <strong>বিক্রি, ভাড়া বা বাণিজ্যিক
                উদ্দেশ্যে হস্তান্তর</strong> করি না। আইনি বাধ্যবাধকতা, নিরাপত্তা বা সেবা প্রদানের জন্য অপরিহার্য ক্ষেত্র
                ছাড়া তৃতীয় পক্ষের সঙ্গে তথ্য শেয়ার করা হয় না।
              </p>

              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4">
                <p className="text-[11px] sm:text-xs text-emerald-900 leading-relaxed m-0">
                  <strong>আইনি ভিত্তি:</strong> আমরা প্রযোজ্য ক্ষেত্রে আপনার সম্মতি, সেবা প্রদানের চুক্তি, বৈধ
                  ব্যবসায়িক স্বার্থ এবং আইনি বাধ্যবাধকতার ভিত্তিতে তথ্য প্রক্রিয়াজাত করি।
                </p>
              </div>
            </section>

            {/* 4. Cookies & localStorage */}
            <section
              id="cookies"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৪
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  কুকিজ ও লোকাল স্টোরেজ
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  সাইন-ইন সেশন সচল রাখতে আমরা প্রয়োজনীয় কুকিজ ব্যবহার করি। এছাড়া আপনার ব্রাউজারের লোকাল স্টোরেজে
                  কিছু পছন্দ ও অগ্রগতি সংরক্ষণ করা হয়, যাতে বারবার লগইন ছাড়াই অভিজ্ঞতা ধারাবাহিক থাকে।
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">
                  লোকাল স্টোরেজে যা থাকতে পারে
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 m-0 p-0 list-none">
                  {[
                    'ইমেইল ও প্রদর্শিত নাম',
                    'পছন্দের বিষয় (Interests)',
                    'গেস্ট আইডি',
                    'পছন্দের বাগধারা তালিকা',
                    'ক্যাম্পেইন অগ্রগতি',
                    'অথেন্টিকেশন প্রম্পটের অবস্থা',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                Firebase Analytics সমষ্টিগত ব্যবহারের পরিসংখ্যান ও ত্রুটি বোঝার জন্য কাজ করে। আমরা নিজেদের পক্ষ থেকে
                আচরণভিত্তিক বিজ্ঞাপন দেখাই না। আপনি ব্রাউজার সেটিংস থেকে কুকিজ ও সাইট ডেটা মুছতে পারেন, তবে কিছু
                পছন্দ ও স্থানীয় অগ্রগতি রিসেট হতে পারে।
              </p>
            </section>

            {/* 5. Third parties */}
            <section
              id="sharing"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৫
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  তৃতীয় পক্ষের সেবা
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                সেবা চালু রাখতে আমরা কয়েকটি বিশ্বস্ত প্রযুক্তি সেবা ব্যবহার করি। তারা কেবল নির্দিষ্ট কাজের জন্য
                প্রয়োজনীয় তথ্য পায় এবং নিজেদের গোপনীয়তা নীতি অনুযায়ী তা পরিচালনা করে।
              </p>

              <div className="space-y-2.5">
                {thirdParties.map((party) => {
                  const Icon = party.icon;
                  return (
                    <a
                      key={party.name}
                      href={party.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors group"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="block text-xs sm:text-sm font-bold text-slate-800">{party.name}</span>
                          <span className="block text-[11px] text-gray-500 leading-relaxed">{party.purpose}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </a>
                  );
                })}
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed m-0">
                তৃতীয় পক্ষের নিজস্ব গোপনীয়তা নীতি ও নিরাপত্তা ব্যবস্থার ওপর আমাদের সম্পূর্ণ নিয়ন্ত্রণ থাকে না। তাই
                প্রয়োজন হলে তাদের নীতিও পড়ে নেওয়ার অনুরোধ করি।
              </p>
            </section>

            {/* 6. Security */}
            <section
              id="security"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৬
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">তথ্যের নিরাপত্তা</h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  আমরা HTTPS এনক্রিপশন, সীমিত অ্যাক্সেস কন্ট্রোল, নিরাপদ অথেন্টিকেশন টোকেন এবং নিয়মিত মনিটরিংসহ
                  যুক্তিসঙ্গত প্রযুক্তিগত ও সাংগঠনিক ব্যবস্থা গ্রহণ করি। আপনার তথ্য শুধু প্রয়োজনীয় দায়িত্বপ্রাপ্ত
                  ব্যক্তিরাই দেখতে পারেন।
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed m-0">
                  ইন্টারনেটে কোনো সিস্টেমই ১০০% ঝুঁকিমুক্ত নয়। কোনো অননুমোদিত প্রবেশ বা তথ্য ফাঁসের ঘটনা ঘটলে প্রযোজ্য
                  আইন অনুযায়ী আমরা প্রভাবিত ব্যবহারকারীদের অবহিত করার সর্বোচ্চ চেষ্টা করব।
                </p>
              </div>
            </section>

            {/* 7. Retention */}
            <section
              id="retention"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৭
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  তথ্য সংরক্ষণের মেয়াদ
                </h2>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    icon: UserCheck,
                    text: 'অ্যাকাউন্ট সক্রিয় থাকা পর্যন্ত প্রোফাইল ও শেখার ডেটা সংরক্ষণ করা হয়।',
                  },
                  {
                    icon: Trash2,
                    text: 'অ্যাকাউন্ট মুছে ফেলার অনুরোধের পর যুক্তিসঙ্গত সময়ের মধ্যে ব্যক্তিগত তথ্য মুছে ফেলা হয়।',
                  },
                  {
                    icon: Database,
                    text: 'নিরাপত্তার জন্য রাখা ব্যাকআপ সাধারণত সর্বোচ্চ ৩০ দিনের মধ্যে স্বয়ংক্রিয়ভাবে মুছে যায়।',
                  },
                  {
                    icon: Mail,
                    text: 'নিউজলেটার ইমেইল আপনি আনসাবস্ক্রাইব করার আগ পর্যন্ত সংরক্ষিত থাকে।',
                  },
                  {
                    icon: FileText,
                    text: 'আইনি বাধ্যবাধকতা বা বিরোধ নিষ্পত্তির জন্য কিছু রেকর্ড নির্ধারিত মেয়াদ পর্যন্ত রাখতে হতে পারে।',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.text}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <Icon className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 8. Rights */}
            <section
              id="rights"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৮
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">আপনার অধিকার</h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                আপনার ব্যক্তিগত তথ্যের ওপর আপনার অধিকার রয়েছে। নিচের যেকোনো অনুরোধ জানাতে আমাদের সাপোর্ট ইমেইলে
                লিখুন—আমরা যুক্তিসঙ্গত সময়ের মধ্যে (সাধারণত ৩০ দিনের মধ্যে) সাড়া দেওয়ার চেষ্টা করব।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4">
                <p className="text-[11px] sm:text-xs text-emerald-900 leading-relaxed m-0">
                  <strong>সহজ উপায়:</strong> প্রোফাইল পেজ থেকে বেশিরভাগ তথ্য নিজেই সম্পাদনা করতে পারেন। নোটিফিকেশন
                  বন্ধ করতে ডিভাইস সেটিংস ব্যবহার করুন। আর সম্পূর্ণ অ্যাকাউন্ট মুছতে চাইলে{' '}
                  <a
                    href={`mailto:${siteConfig.links.supportEmail}?subject=Account%20Deletion%20Request`}
                    className="font-bold underline underline-offset-2 hover:text-emerald-700"
                  >
                    {siteConfig.links.supportEmail}
                  </a>{' '}
                  এ &ldquo;Account Deletion Request&rdquo; বিষয়ে মেইল করুন।
                </p>
              </div>
            </section>

            {/* 9. Children */}
            <section
              id="children"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ৯
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  শিশুদের গোপনীয়তা
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Baby className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  OwlPrep মূলত প্রতিযোগিতামূলক পরীক্ষার প্রস্তুতির জন্য তৈরি এবং ১৩ বছরের কম বয়সী শিশুদের লক্ষ্য করে
                  নয়। আমরা জেনেশুনে ১৩ বছরের কম বয়সী কারও কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। এমন তথ্য আমাদের
                  নজরে এলে যুক্তিসঙ্গত সময়ের মধ্যে তা মুছে ফেলা হবে। ১৮ বছরের কম বয়সী ব্যবহারকারীদের অভিভাবকের
                  তত্ত্বাবধানে সেবা ব্যবহার করার পরামর্শ দেওয়া হয়।
                </p>
              </div>
            </section>

            {/* 10. Changes */}
            <section
              id="changes"
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ১০
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">নীতির পরিবর্তন</h2>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
                  নতুন ফিচার, প্রযুক্তি বা আইনি পরিবর্তনের সঙ্গে সামঞ্জস্য রাখতে আমরা এই নীতি মাঝে মাঝে আপডেট করতে
                  পারি। উল্লেখযোগ্য পরিবর্তন হলে সাইটে স্পষ্ট নোটিশ দেওয়া হবে এবং প্রয়োজন হলে ইমেইলে জানানো হবে।
                  উপরের &ldquo;কার্যকর&rdquo; তারিখ দেখে নিশ্চিত হোন কোন সংস্করণ প্রযোজ্য।
                </p>
              </div>
            </section>

            {/* 11. Contact */}
            <section
              id="contact"
              className="scroll-mt-24 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-9 text-white border border-emerald-500/20 shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                    ১১
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight m-0">যোগাযোগ করুন</h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed m-0">
                  গোপনীয়তা, ডেটা অ্যাক্সেস, সংশোধন বা মুছে ফেলার যেকোনো প্রশ্নে আমাদের লিখুন। আমরা প্রতিটি অনুরোধ
                  গুরুত্বের সঙ্গে দেখি।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <a
                    href={`mailto:${siteConfig.links.supportEmail}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        সাধারণ ও গোপনীয়তা সহায়তা
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
                    <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        ডেটা সুরক্ষা ও আইনি বিষয়
                      </span>
                      <span className="block text-xs font-bold text-white break-all">
                        {siteConfig.links.adminEmail}
                      </span>
                    </div>
                  </a>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed m-0">
                  সেবা ব্যবহারের নিয়ম ও দায়বদ্ধতার জন্য আমাদের{' '}
                  <Link
                    href="/terms"
                    className="font-bold text-amber-300 underline underline-offset-2 hover:text-amber-200"
                  >
                    ব্যবহারের শর্তাবলী
                  </Link>{' '}
                  পড়ে নিন।
                </p>

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
              আপনার প্রস্তুতি নিরাপদ হাতেই আছে
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 m-0">
              শব্দ, নোট ও রিভিশন সূচি সুরক্ষিতভাবে সিঙ্ক করে প্রস্তুতি চালিয়ে যান।
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <Link href="/about">
              <Button className="rounded-xl h-11 px-5 font-bold text-xs border-slate-200 text-slate-600 hover:!text-emerald-700 hover:!border-emerald-300">
                আমাদের সম্পর্কে
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
