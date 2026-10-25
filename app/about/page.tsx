import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Tag } from 'antd';
import {
  Code2,
  ExternalLink,
  Globe,
  ShieldCheck,
  Zap,
  Brain,
  Target,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { GithubOutlined, LinkedinOutlined, PlayCircleFilled } from '@ant-design/icons';
import { siteConfig } from '../../lib/config/site';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে (About Us) & প্রতিষ্ঠাতা | OwlPrep by Grow With Owl',
  description:
    'OwlPrep হলো বাংলাদেশি চাকরিপ্রার্থীদের জন্য একটি বৈজ্ঞানিক স্পেসড-রিপিটিশন ও এআই লার্নিং প্ল্যাটফর্ম। আর্কিটেক্ট ও নির্মাতা: Joy Chandra Uday (Co-Founder, G2G Digital).',
  alternates: {
    canonical: 'https://growwithowl.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full">
            <span>🦉 আমাদের লক্ষ্য ও দর্শন</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            রাতজাগা স্বপ্নবাজদের জন্য{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              স্মার্ট প্রস্তুতি ব্যবস্থা
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            <strong>{siteConfig.fullName}</strong> হলো একটি আধুনিক এডুকেশনাল প্ল্যাটফর্ম, যা গতানুগতিক ক্লান্তি দূর করে বৈজ্ঞানিক অ্যালগরিদম ও আধুনিক এআই প্রযুক্তির সহায়তায় বাংলাদেশের বিসিএস, ব্যাংক ও সরকারি চাকরি প্রস্তুতিকে সহজ, কার্যকর ও স্মৃতিতে স্থায়ী করে তোলে।
          </p>
        </div>

        {/* The Story & Why OwlPrep */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
            কেন OwlPrep?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-900 text-sm block">১. রাতজাগা অভ্যাসের সঠিক ব্যবহার</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                প্রতিটি চাকরিপ্রার্থী গভীর রাত পর্যন্ত পড়াশোনা করে। সোশ্যাল মিডিয়ায় অনিচ্ছাকৃত সময় নষ্ট বন্ধ করে ১ মিনিটের মাইক্রো-ক্যাপসুলে সক্রিয় পড়াশোনা নিশ্চিত করা।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <span className="font-bold text-blue-900 text-sm block">২. বৈজ্ঞানিক স্পেসড রিপিটেশন (SM-2)</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                পড়ার ৩ দিন পর তথ্য ভুলে যাওয়ার নিদারুণ যন্ত্রণা দূর করা। মস্তিষ্কের স্মৃতি ধারণ ক্ষমতার সাথে তাল মিলিয়ে সঠিক সময়ে স্বয়ংক্রিয় রিভিশন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <span className="font-bold text-indigo-900 text-sm block">৩. ২৪/৭ পার্সোনাল এআই মেন্টর</span>
              <p className="text-gray-600 m-0 leading-relaxed">
                সংবিধানের অনুচ্ছেদ, ইংরেজির ট্র্যাপ বা গণিত শর্টকাটে খটকা লাগলে মুহূর্তেই টু-দ্য-পয়েন্ট সমাধান বুঝিয়ে দেওয়া।
              </p>
            </div>
          </div>
        </div>

        {/* FOUNDER & ARCHITECT SECTION */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
              <Code2 className="w-3.5 h-3.5 text-amber-300" />
              <span>প্রতিষ্ঠাতা ও সিস্টেম আর্কিটেক্ট</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white m-0">
                {siteConfig.creator.name} ({siteConfig.creator.nameBn})
              </h2>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium">
                Software Engineer • Co-Founder,{' '}
                <a
                  href={siteConfig.creator.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 inline-flex items-center gap-1"
                >
                  {siteConfig.creator.company} <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <blockquote className="border-l-2 border-emerald-400 pl-4 py-1 italic text-xs sm:text-sm text-slate-300">
              &ldquo;Systems before heroics. Learn why before how. Understand systems instead of memorizing tools. See what others scroll past.&rdquo;
            </blockquote>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              জয় চন্দ্র উদয় একজন সফটওয়্যার ইঞ্জিনিয়ার ও সিস্টেম আর্কিটেক্ট। তিনি <strong>G2G Digital</strong>-এর কো-ফাউন্ডার (Co-Founder), যেখানে মধ্যম ও বৃহৎ আকারের ডিজিটাল প্ল্যাটফর্মের জন্য এক্সিকিউশন ও গ্রোথ ইনফ্রাস্ট্রাকচার তৈরি করা হয়। শিক্ষাক্ষেত্রে মুখস্থবিদ্যার অচলায়তন ভেঙে প্রযুক্তির শক্তিতে প্রতিটি প্রার্থীর মেধা ও স্মৃতিশক্তিকে সর্বোচ্চ পর্যায়ে নিয়ে যাওয়ার লক্ষ্যেই তিনি <strong>{siteConfig.fullName}</strong> গড়ে তুলেছেন।
            </p>

            {/* Do-follow Backlinks Card */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={siteConfig.creator.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>পোর্টফোলিও (Nexus Portfolio)</span>
              </a>

              <a
                href={siteConfig.creator.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
              >
                <GithubOutlined className="text-sm" />
                <span>GitHub (@joychandrauday)</span>
              </a>

              <a
                href={siteConfig.creator.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
              >
                <LinkedinOutlined className="text-sm text-blue-400" />
                <span>LinkedIn Profile</span>
              </a>

              <a
                href={siteConfig.creator.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold text-xs transition-all"
              >
                <span>G2G Digital Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/feed">
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleFilled className="text-amber-300" />}
              className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-2xl h-14 px-8 text-sm sm:text-base border-0 shadow-xl"
            >
              প্রস্তুতি ফিড শুরু করুন
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
