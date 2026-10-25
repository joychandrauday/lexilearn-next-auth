'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Tag, Input } from 'antd';
import {
  Sparkles,
  Brain,
  Compass,
  Flame,
  Zap,
  Target,
  ShieldCheck,
  BookmarkCheck,
  GraduationCap,
  TrendingUp,
  Bot,
  Volume2,
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Play,
  RotateCcw,
  Clock,
  Printer,
  ChevronRight,
  Send,
  Users,
} from 'lucide-react';
import {
  ThunderboltFilled,
  PlayCircleFilled,
  CheckCircleFilled,
  SoundOutlined,
  BookOutlined,
  RobotOutlined,
  FireOutlined,
  PlusOutlined,
  CheckOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import Footer from '../components/Footer';

// Sample Live Interactive Demos
const DEMO_TABS = [
  { id: 'reel', label: '১ মিনিটের রিলস ক্যাপসুল', icon: Play },
  { id: 'mcq', label: 'বিসিএস MCQ চ্যালেঞ্জ', icon: Target },
  { id: 'ai', label: 'লেক্সিবট এআই মেন্টর (লাইভ)', icon: Bot },
  { id: 'notebook', label: 'স্টাডি বাইন্ডার ও শিট', icon: BookOpen },
];

const REEL_DEMOS = [
  {
    word: 'Candid',
    pos: 'Adjective',
    bangla: 'সরল, স্পষ্টবাদী, অকপট',
    meaning: 'Frank, outspoken, sincere, honest',
    mnemonic: 'Can + did -> যে যা করতে পারে তা কোনো দ্বিধা বা ভয় ছাড়া অকপটে সরাসরি বলে দেয়!',
    exams: ['৪৩তম বিসিএস', 'বাংলাদেশ ব্যাংক এডি'],
  },
  {
    word: 'Ubiquitous',
    pos: 'Adjective',
    bangla: 'সর্বব্যাপী, সর্বত্র বিরাজমান',
    meaning: 'Present, appearing, or found everywhere',
    mnemonic: 'Ubi (উবি) + quitous (কোথায়) -> যা সর্বত্র বা সব জায়গায় অনায়াসে পাওয়া যায়!',
    exams: ['৪২তম বিসিএস', 'সমন্বিত ৮ ব্যাংক অফিসার'],
  },
  {
    word: 'অকাল কুষ্মাণ্ড',
    pos: 'বাগধারা',
    bangla: 'অপদার্থ, অকেজো ব্যক্তি',
    meaning: 'Good for nothing / Worthless person',
    mnemonic: 'অকাল (অসময়ে) কুষ্মাণ্ড (চালকুমড়া) -> কোনো কাজে লাগে না, তাই অপদার্থ ব্যক্তি!',
    exams: ['৪০তম বিসিএস', 'প্রাথমিক শিক্ষক নিয়োগ'],
  },
];

const MCQ_DEMOS = [
  {
    exam: '৪৪তম বিসিএস প্রিলিমিনারি',
    topic: 'Subjunctive Mood',
    question: 'The doctor recommended that the patient ______ medicine regularly.',
    options: [
      { letter: 'A', text: 'takes', percent: 12 },
      { letter: 'B', text: 'take', percent: 76, correct: true },
      { letter: 'C', text: 'should take', percent: 8 },
      { letter: 'D', text: 'will take', percent: 4 },
    ],
    explanation:
      'কিছু বিশেষ Verb (recommend, demand, insist, require)-এর পর that ক্লজ থাকলে Subject যাই হোক না কেন Verb-এর সর্বদা Base Form (V1) বসে। কোনো s/es বা modal বসে না।',
  },
  {
    exam: '৪১তম বিসিএস ও ব্যাংক এডি',
    topic: 'Appropriate Preposition',
    question: 'A true patriot is never blind ______ the defects of his own country.',
    options: [
      { letter: 'A', text: 'of', percent: 14 },
      { letter: 'B', text: 'to', percent: 78, correct: true },
      { letter: 'C', text: 'for', percent: 5 },
      { letter: 'D', text: 'with', percent: 3 },
    ],
    explanation:
      'Blind of মানে চোখে অন্ধ (যেমন: blind of one eye), কিন্তু কোনো দোষ বা ত্রুটির প্রতি অন্ধ হওয়া বোঝালে সর্বদা "Blind to" বসে।',
  },
  {
    exam: '১০ম-৪৫তম বিসিএস প্রশ্নব্যাংক',
    topic: 'বাংলাদেশ সংবিধান',
    question: 'বাংলাদেশ সংবিধানের কোন অনুচ্ছেদে "আইনের দৃষ্টিতে সমতা" নিশ্চিত করা হয়েছে?',
    options: [
      { letter: 'A', text: 'অনুচ্ছেদ ১৯', percent: 6 },
      { letter: 'B', text: 'অনুচ্ছেদ ২৭', percent: 84, correct: true },
      { letter: 'C', text: 'অনুচ্ছেদ ২৯', percent: 7 },
      { letter: 'D', text: 'অনুচ্ছেদ ৩১', percent: 3 },
    ],
    explanation:
      'সংবিধানের ২৭ নম্বর অনুচ্ছেদে বলা হয়েছে: "সকল নাগরিক আইনের দৃষ্টিতে সমান এবং আইনের সমান আশ্রয় লাভের অধিকারী।" ২৯ নম্বর অনুচ্ছেদ হলো সরকারি নিয়োগে সমতা।',
  },
];

const LIVE_COMMUNITY_PULSES = [
  { user: 'তানভীর আহমেদ', action: '৪৬তম বিসিএস নোটবুকে "Subjunctive Mood" সেভ করেছেন', time: '১ মিনিট আগে' },
  { user: 'ফারহানা ইয়াসমিন', action: 'বাংলাদেশ ব্যাংক এডি কুইজে ৯৫% নির্ভুলতা অর্জন করেছেন', time: '৩ মিনিট আগে' },
  { user: 'সাকিব আল হাসান', action: '৬৪৮টি বাগধারার মধ্যে "অকাল কুষ্মাণ্ড" রিভিশন করেছেন', time: '৫ মিনিট আগে' },
  { user: 'নুসরাত জাহান', action: 'SM-2 স্পেসড ফ্লাশকার্ডে ৫০টি শব্দ আয়ত্ত করেছেন', time: '৮ মিনিট আগে' },
];

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState<'reel' | 'mcq' | 'ai' | 'notebook'>('reel');

  // Interactive Reel state
  const [reelIndex, setReelIndex] = useState(0);
  const [savedToNotebook, setSavedToNotebook] = useState(false);
  const [isPronouncing, setIsPronouncing] = useState(false);

  // Interactive MCQ state
  const [mcqIndex, setMcqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Live Interactive AI state
  const [customAiQuery, setCustomAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string>(
    'Candid মানে সরল বা অকপট (Frank, Outspoken)। আর Cynical মানে মানুষের ভালো উদ্দেশ্যে সন্দেহপ্রবণ বা স্বার্থপর মনে করা (Distrustful)।\n\n• দেশি ট্রিক: Can-did -> যা পারে অকপটে সরাসরি বলে।\n• বিসিএস ট্র্যাপ: ৪৩তম বিসিএস-এ "A person who doubts human sincerity" প্রশ্নের উত্তর ছিল Cynical।'
  );
  const [aiLoading, setAiLoading] = useState(false);

  // Daily target habit calculator
  const [selectedTargetExam, setSelectedTargetExam] = useState<'bcs' | 'bank' | 'primary'>('bcs');

  // Live community ticker index
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_COMMUNITY_PULSES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Speech TTS handler
  const handlePronounce = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = text.match(/[a-zA-Z]/) ? 'en-US' : 'bn-BD';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPronouncing(true);
      utterance.onend = () => setIsPronouncing(false);
      utterance.onerror = () => setIsPronouncing(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Live AI chat call
  const handleAskLiveAi = async (presetPrompt?: string) => {
    const query = presetPrompt || customAiQuery.trim();
    if (!query || aiLoading) return;

    setAiLoading(true);
    try {
      const res = await axios.post('/api/ai/chat', {
        messages: [{ role: 'user', content: query }],
      });

      if (res.data?.success && res.data?.reply) {
        setAiResponse(res.data.reply);
      }
    } catch {
      setAiResponse('দুঃখিত, সংযোগে সামান্য বিঘ্ন ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setAiLoading(false);
    }
  };

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

  const activeReel = REEL_DEMOS[reelIndex];
  const activeMcq = MCQ_DEMOS[mcqIndex];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-500 selection:text-white relative">
      {/* 1. HERO SECTION WITH DYNAMIC ENTRANCE & GLOW */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white">
        {/* Glow backdrop circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-6 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Top Live Aspirant Ticker */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-emerald-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-emerald-200 shadow-inner transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>বিসিএস ও ব্যাংক চাকরিপ্রার্থীদের স্মার্ট লার্নিং ইকোসিস্টেম</span>
              <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                LIVE 2026
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.15] text-white">
              চাকরি পরীক্ষার দীর্ঘ যাত্রাকে করুন{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
                সহজ, আনন্দময় ও জয়যুক্ত
              </span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-emerald-100/85 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
              ফেসবুক স্ক্রলিংয়ের অন্তহীন সময় অপচয় বন্ধ করুন। দিনে মাত্র ৫ মিনিটেই ফেসবুক রিলস-এর মতো
              ১ মিনিটের মাইক্রো-ক্যাপসুল, স্মার্ট স্টাডি নোটবুক এবং সার্বিক এআই মেন্টর নিয়ে এগিয়ে থাকুন সবার চেয়ে।
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
              <Link href="/feed">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleFilled className="text-amber-300 text-lg" />}
                    className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-2xl h-14 px-8 text-sm sm:text-base border-0 shadow-2xl shadow-emerald-900/60 flex items-center gap-2"
                  >
                    প্রস্তুতি ফিড শুরু করুন
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              </Link>

              <Link href="/notebook">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="large"
                    icon={<BookOpen className="w-4 h-4 text-emerald-300" />}
                    className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-2xl h-14 px-7 text-sm sm:text-base border-white/20 backdrop-blur-md flex items-center gap-2"
                  >
                    স্টাডি নোটবুক দেখুন
                  </Button>
                </motion.div>
              </Link>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="large"
                  icon={<Bot className="w-4 h-4 text-indigo-300" />}
                  onClick={triggerAIMentor}
                  className="bg-slate-800/80 hover:!bg-slate-700 !text-indigo-200 font-bold rounded-2xl h-14 px-6 text-sm sm:text-base border-indigo-400/30 backdrop-blur-md flex items-center gap-2"
                >
                  এআই মেন্টর
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Pill Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-xs font-semibold text-emerald-200/90"
          >
            {[
              { icon: ShieldCheck, text: '৪৪-৪৬তম বিসিএস প্যাটার্ন' },
              { icon: Award, text: 'বাংলাদেশ ব্যাংক ও ৮ ব্যাংক' },
              { icon: BookmarkCheck, text: 'বাংলা একাডেমি প্রমিত বানান' },
              { icon: Brain, text: '৯৯% ভেরিফাইড প্রশ্নব্যাংক' },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2.5 justify-center text-center shadow-xs"
                >
                  <IconComp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{item.text}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 2. OUR GOAL & ASPIRANT INNER PSYCHOLOGY (আমাদের লক্ষ্য ও অঙ্গীকার) */}
      <section className="py-16 md:py-24 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>আমাদের লক্ষ্য ও স্বপ্ন</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              কেন লেক্সিলার্ন? আপনার ভেতরের স্বপ্নকে বাস্তবে রূপ দেওয়ার অঙ্গীকার
            </h2>
            <p className="text-xs sm:text-base text-gray-600 leading-relaxed font-normal">
              আমরা জানি একজন চাকরিপ্রার্থীর প্রতিদিনের নীরব সংগ্রাম। নীলক্ষেতের শত শত পৃষ্ঠার গাইডবইয়ের ক্লান্তি,
              সোশ্যাল মিডিয়ায় সময় নষ্টের পর গভীর অপরাধবোধ, এবং পড়ার ৩ দিন পর ভুলে যাওয়ার নিদারুণ যন্ত্রণা।
              আমরা সেই গল্পটি চিরতরে বদলে দিতে এসেছি।
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-3xl bg-slate-50 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 mb-1.5">
                  ১. ডুমস্ক্রলিং বন্ধ করে ১ মিনিটের নিশ্চিত মার্কস
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal m-0">
                  যেখানে ফেসবুক ও ইনস্টাগ্রামে অহেতুক ঘণ্টা পার হতো, সেখানে এখন প্রতি স্ক্রলে শিখবেন ১টি মোস্ট-রিপিটেড শব্দ,
                  সম্পাদকীয় ভোকাব কিংবা বিসিএস ব্যাকরণ ট্র্যাপ। সময় নষ্টের দিন শেষ।
                </p>
              </div>
            </motion.div>

            {/* Goal 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-3xl bg-slate-50 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-700 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 mb-1.5">
                  ২. পড়া ভুলে যাওয়ার চিরতরে অবসান (SM-2 বৈজ্ঞানিক অ্যালগরিদম)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal m-0">
                  মানুষ ভুলে যাবে এটাই স্বাভাবিক। আমাদের বৈজ্ঞানিক স্পেসড রিপিটেশন অ্যালগরিদম ঠিক যে সময়ে আপনার কোনো নিয়ম
                  ভুলে যাওয়ার কথা, তখনই তা পুনরায় রিভিশনে হাজির করে স্থায়ী স্মৃতি গড়ে তোলে।
                </p>
              </div>
            </motion.div>

            {/* Goal 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-3xl bg-slate-50 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 mb-1.5">
                  ৩. পরীক্ষার আগের রাতে খাতা খোঁজার দিন শেষ
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal m-0">
                  বিসিএস বা ব্যাংক পরীক্ষার আগের রাতে ১০টি বই ও খাতা নিয়ে দিশেহারা হতে হবে না। আপনার সেভ করা শব্দ,
                  ব্যাকরণ রুল ও শর্টকাট দেশি নেমোনিকসহ গোছানো থাকবে আপনার নিজস্ব বাইন্ডারে — ১ ক্লিকেই প্রিন্ট শিট তৈরি।
                </p>
              </div>
            </motion.div>

            {/* Goal 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-6 rounded-3xl bg-slate-50 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 mb-1.5">
                  ৪. ২৪/৭ ব্যক্তিগত সার্বিক এআই মেন্টর (লেক্সিবট)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal m-0">
                  রাত ২টায় সংবিধানের কোনো অনুচ্ছেদ বা ইংরেজি Subjunctive Mood-এ খটকা লাগলে শিক্ষক বা বন্ধুদের খুঁজতে হবে না;
                  লেক্সিবট সাথে সাথে পরিমিত, টু-দ্য-পয়েন্ট ও বিসিএস ট্র্যাপসহ সমাধান বুঝিয়ে দেবে।
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. LIVE INTERACTIVE SIMULATOR (MAKE IT FEEL LIKE USING RIGHT HERE) */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-100 to-slate-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full">
              লাইভ প্রোডাক্ট অভিজ্ঞতা
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
              এখনই সাইটটির মূল ফিচারগুলো চালিয়ে দেখুন
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              লগইন করার আগেই অভিজ্ঞতা নিন কীভাবে লেক্সিলার্ন আপনার প্রতিদিনের প্রস্তুতি বদলে দেয়।
            </p>
          </motion.div>

          {/* Interactive Navigation Pills */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {DEMO_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeDemo === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDemo(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20 scale-105'
                      : 'bg-white text-gray-700 hover:bg-slate-200 border border-gray-200'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Interactive Card Container */}
          <div className="max-w-xl mx-auto">
            <AnimatePresence mode="wait">
              {/* TAB 1: REEL CARD DEMO */}
              {activeDemo === 'reel' && (
                <motion.div
                  key={`reel-demo-${reelIndex}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-gray-900 block">লেক্সিবট রিলস ক্যাপসুল</span>
                        <span className="text-[10px] text-gray-400">ক্যাপসুল {reelIndex + 1} / {REEL_DEMOS.length}</span>
                      </div>
                    </div>
                    <Tag color="cyan" className="font-bold text-[10px] m-0 border-0 rounded-md">
                      ভোকাবুলারি
                    </Tag>
                  </div>

                  {/* Word Content */}
                  <div className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-5 rounded-2xl border border-emerald-100 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-3xl font-black text-slate-900 block tracking-tight">{activeReel.word}</span>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                          {activeReel.pos}
                        </span>
                      </div>
                      <Button
                        shape="circle"
                        icon={<Volume2 className="w-4 h-4 text-white" />}
                        loading={isPronouncing}
                        onClick={() => handlePronounce(activeReel.word)}
                        className="bg-emerald-600 hover:!bg-emerald-500 !text-white border-0 shadow-xs flex items-center justify-center"
                        title="উচ্চারণ শুনুন"
                      />
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-gray-700 pt-2 border-t border-emerald-100">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-gray-500 text-xs">বাংলা অর্থ:</span>
                        <span className="font-black text-emerald-950 text-base">{activeReel.bangla}</span>
                      </div>

                      <div className="text-xs text-gray-600 font-medium">
                        <span className="font-bold text-gray-500 block text-[11px]">English Meaning:</span>
                        {activeReel.meaning}
                      </div>

                      <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-xs">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-950 block text-[11px]">দেশি স্মৃতিসূত্র (Desi Mnemonic):</span>
                          <span className="text-amber-900 leading-snug">{activeReel.mnemonic}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2">
                        <span className="text-[10px] font-bold text-gray-400">বিগত পরীক্ষা:</span>
                        {activeReel.exams.map((ex, idx) => (
                          <Tag key={idx} color="purple" className="text-[10px] font-bold rounded-md m-0">
                            {ex}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      icon={savedToNotebook ? <CheckOutlined /> : <PlusOutlined />}
                      onClick={() => setSavedToNotebook(!savedToNotebook)}
                      className={`font-bold text-xs rounded-xl h-9 px-4 ${
                        savedToNotebook
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                          : 'bg-emerald-600 hover:!bg-emerald-500 !text-white border-0'
                      }`}
                    >
                      {savedToNotebook ? 'নোটবুকে সেভ হয়েছে!' : 'নোটবুকে সেভ করুন'}
                    </Button>

                    <Button
                      onClick={() => {
                        setReelIndex((prev) => (prev + 1) % REEL_DEMOS.length);
                        setSavedToNotebook(false);
                      }}
                      className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-0 rounded-xl h-9"
                    >
                      পরবর্তী ক্যাপসুল &rarr;
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: LIVE MCQ DEMO */}
              {activeDemo === 'mcq' && (
                <motion.div
                  key={`mcq-demo-${mcqIndex}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg">
                      {activeMcq.exam}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">{activeMcq.topic}</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-4 leading-snug">
                    &quot;{activeMcq.question}&quot;
                  </h3>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {activeMcq.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const answered = selectedOption !== null;

                      let style = 'bg-white border-gray-200 text-gray-800 hover:border-emerald-500';
                      if (answered) {
                        if (opt.correct) {
                          style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isSelected && !opt.correct) {
                          style = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                        } else {
                          style = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${style}`}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                              {opt.letter}
                            </span>
                            <span>{opt.text}</span>
                          </span>

                          {answered && (
                            <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold">
                              <span>{opt.percent}%</span>
                              {opt.correct ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isSelected ? (
                                <XCircle className="w-4 h-4 text-rose-500" />
                              ) : null}
                            </div>
                          )}

                          {answered && (
                            <div
                              className={`absolute left-0 top-0 bottom-0 ${
                                opt.correct ? 'bg-emerald-100/50' : isSelected ? 'bg-rose-100/40' : 'bg-gray-100/40'
                              }`}
                              style={{ width: `${opt.percent}%` }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation box on click */}
                  {selectedOption !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed font-medium mb-3"
                    >
                      <span className="font-bold text-emerald-900 block mb-0.5">সঠিক উত্তরের ব্যাখ্যা:</span>
                      {activeMcq.explanation}
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                    <button
                      onClick={() => {
                        setMcqIndex((prev) => (prev + 1) % MCQ_DEMOS.length);
                        setSelectedOption(null);
                      }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      অন্য প্রশ্ন ট্রাই করুন ({mcqIndex + 1}/{MCQ_DEMOS.length}) &rarr;
                    </button>
                    {selectedOption !== null && (
                      <button
                        onClick={() => setSelectedOption(null)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        রিসেট
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: LIVE FUNCTIONAL AI MENTOR DEMO */}
              {activeDemo === 'ai' && (
                <motion.div
                  key="ai-demo"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-gray-900 block">লেক্সিবট লাইভ এআই পরীক্ষক</span>
                        <span className="text-[10px] text-emerald-600 font-medium">সরাসরি প্রশ্ন করুন • রিয়েল-টাইম ইঞ্জিন</span>
                      </div>
                    </div>
                    <Tag color="purple" className="text-[10px] font-bold rounded-md m-0 border-0">
                      লাইভ এআই
                    </Tag>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 pb-1">
                    {[
                      'Candid vs Cynical পার্থক্য কী?',
                      'সংবিধানের ২৭ ও ২৯ অনুচ্ছেদের পার্থক্য কী?',
                      'কুষ্মাণ্ড ও অকালপক্ব বানান শুদ্ধ কেন?',
                      'লাভ-ক্ষতির ১০ সেকেন্ড শর্টকাট সূত্র কী?',
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCustomAiQuery(p);
                          handleAskLiveAi(p);
                        }}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer text-gray-700"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Real-time Custom Query Input */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="যেকোনো বিসিএস/ব্যাংক প্রশ্ন লিখুন (যেমন: সাবজাঙ্কটিভ নিয়ম...)"
                      value={customAiQuery}
                      onChange={(e) => setCustomAiQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAskLiveAi();
                      }}
                      disabled={aiLoading}
                      className="rounded-xl text-xs py-2"
                    />
                    <Button
                      type="primary"
                      loading={aiLoading}
                      onClick={() => handleAskLiveAi()}
                      disabled={!customAiQuery.trim()}
                      icon={<Send className="w-3.5 h-3.5" />}
                      className="bg-indigo-600 hover:!bg-indigo-500 font-bold rounded-xl text-xs h-9 px-4 shrink-0"
                    >
                      জিজ্ঞাসা করুন
                    </Button>
                  </div>

                  {/* AI Response Display */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200/80 mb-3 min-h-[120px] max-h-[220px] overflow-y-auto no-scrollbar">
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold py-4 justify-center">
                        <SyncOutlined spin />
                        <span>লেক্সিবট নির্ভুল উত্তর তৈরি করছে...</span>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                        {aiResponse}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => handlePronounce(aiResponse.replace(/[#\*`_\[\]]/g, ' '))}
                      className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>উত্তর শুনুন</span>
                    </button>
                    <button
                      onClick={triggerAIMentor}
                      className="text-indigo-700 font-bold hover:underline cursor-pointer"
                    >
                      পূর্ণাঙ্গ চ্যাট উইন্ডো খুলুন &rarr;
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: NOTEBOOK BINDER DEMO */}
              {activeDemo === 'notebook' && (
                <motion.div
                  key="notebook-demo"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-gray-900 block">ব্যক্তিগত স্টাডি বাইন্ডার</span>
                        <span className="text-[10px] text-gray-400">সংরক্ষিত শব্দ ও ব্যাকরণ ট্র্যাপ</span>
                      </div>
                    </div>
                    <Tag color="green" className="text-[10px] font-bold rounded-md m-0 border-0">
                      রিভিশন রেডি
                    </Tag>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
                      <div>
                        <span className="font-black text-xs text-teal-950 block">Causative Verbs এর নিয়ম</span>
                        <span className="text-[11px] text-teal-700">Make/Have/Let + V1; কিন্তু Get + to + V1</span>
                      </div>
                      <Tag color="cyan" className="text-[9px] font-bold m-0">ইংরেজি</Tag>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="font-black text-xs text-amber-950 block">সংবিধানের ২৭ ও ৩৯ নম্বর অনুচ্ছেদ</span>
                        <span className="text-[11px] text-amber-800">আইনের দৃষ্টিতে সমতা ও বাক-স্বাধীনতা</span>
                      </div>
                      <Tag color="gold" className="text-[9px] font-bold m-0">জিকে</Tag>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
                      <div>
                        <span className="font-black text-xs text-rose-950 block">অকাল কুষ্মাণ্ড (বাগধারা)</span>
                        <span className="text-[11px] text-rose-800">অপদার্থ ব্যক্তি | ৪০তম বিসিএস</span>
                      </div>
                      <Tag color="volcano" className="text-[9px] font-bold m-0">বাংলা</Tag>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5 text-gray-400" /> পরীক্ষার আগে ১-ক্লিক প্রিন্ট শিট
                    </span>
                    <Link href="/notebook">
                      <Button className="bg-teal-700 hover:!bg-teal-600 !text-white font-bold rounded-xl text-xs h-9 px-4 border-0">
                        আমার নোটবুক খুলুন
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. OLD WAY VS LEXILEARN WAY (CONTRAST COMPARISON) */}
      <section className="py-16 md:py-24 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              বাস্তবতার মুখোমুখি
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
              প্রচলিত ক্লান্তিকর পথ বনাম লেক্সিলার্ন স্মার্ট প্রস্তুতি
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              একই সময় ব্যয় করে দ্বিগুণ নির্ভুলতা ও স্মৃতিশক্তি অর্জন করুন।
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Burden */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-3xl bg-rose-50/40 border border-rose-200/80 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg text-rose-950 m-0">প্রচলিত ক্লান্তিকর প্রস্তুতি</h3>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700 leading-relaxed pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>নীলক্ষেতের ৫০০ পৃষ্ঠার ভারী বই বহন ও পড়ার সময় একঘেয়েমিতে হারিয়ে যাওয়া।</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>ফেসবুক ও সোশ্যাল মিডিয়ায় অনিচ্ছাকৃতভাবে ঘণ্টা নষ্ট ও গভীর অপরাধবোধ।</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>আজকে পড়া শব্দ বা সংবিধানের অনুচ্ছেদ ৩ দিন পর ভুলে যাওয়া (রিটেনশন জিরো)।</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span>পরীক্ষার আগের রাতে কোন খাতায় কী লিখেছিলেন তা খুঁজে না পেয়ে চরম প্যানিক।</span>
                </li>
              </ul>
            </motion.div>

            {/* The LexiLearn Way */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-300 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg text-emerald-950 m-0">লেক্সিলার্ন স্মার্ট প্রিপারেশন</h3>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-emerald-950 leading-relaxed pl-1 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span>স্মার্টফোনে ১ মিনিটের রিলস স্টাইল ক্যাপসুলে সক্রিয় পড়ালেখা ও লাইভ ভোট।</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span>সোশ্যাল মিডিয়ার সময়কে সরাসরি ১টি করে বিসিএস ও ব্যাংক মার্কসে রূপান্তর।</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span>SM-2 বৈজ্ঞানিক স্পেসড রিপিটেশন অ্যালগরিদমে দীর্ঘস্থায়ী মস্তিষ্কের স্মৃতি।</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span>নিজস্ব ডিজিটাল স্টাডি নোটবুক ও পরীক্ষার আগের রাতে ১ ক্লিকে প্রিন্ট শিট।</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE 5-MINUTE DAILY HABIT & EXAM CALCULATOR */}
      <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 border border-emerald-400/30 px-3.5 py-1 rounded-full">
              দৈনিক দিনলিপি ও লক্ষ্য ক্যালকুলেটর
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3 mb-2 tracking-tight">
              দিনে মাত্র ৫ মিনিটের অভ্যাস, ক্যাডার হওয়ার স্বপ্ন পূরণ
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70 font-normal">
              আপনার লক্ষ্যভিত্তিক পরীক্ষা সিলেক্ট করে দেখুন আপনার প্রতিদিনের কাস্টমাইজড দিনলিপি।
            </p>
          </motion.div>

          {/* Interactive Exam Selector Tabs */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[
              { id: 'bcs', label: 'বিসিএস প্রিলিমিনারি' },
              { id: 'bank', label: 'বাংলাদেশ ব্যাংক ও ৮ ব্যাংক' },
              { id: 'primary', label: 'প্রাইমারি শিক্ষক ও NTRCA' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTargetExam(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedTargetExam === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold mb-4 border border-amber-400/30">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-1">
                সকাল ৮:০০ • ঘুম থেকে উঠে
              </span>
              <h3 className="font-black text-base text-white mb-2">
                {selectedTargetExam === 'bcs'
                  ? '৩টি বিসিএস ভোকাব ও সম্পাদকীয় শব্দ (২ মিনিট)'
                  : selectedTargetExam === 'bank'
                  ? '৪টি হাই-ফ্রিকোয়েন্সি ব্যাংক ভোকাব (২ মিনিট)'
                  : '৩টি বাংলা প্রমিত বানান ও বাগধারা (২ মিনিট)'}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal m-0">
                নাস্তার টেবিলে বা বাসে বসে ৩টি সম্পাদকীয় ভোকাব ও ব্যাকরণ ট্র্যাপ পড়ে নিন। কোনো ভারী বই খোলার প্রয়োজন নেই।
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold mb-4 border border-emerald-400/30">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block mb-1">
                দুপুর ২:০০ • লাঞ্চ ব্রেকে
              </span>
              <h3 className="font-black text-base text-white mb-2">
                {selectedTargetExam === 'bcs'
                  ? '৩টি বিসিএস ব্যাকরণ ও জিকে MCQ (২ মিনিট)'
                  : selectedTargetExam === 'bank'
                  ? '৩টি ম্যাথ শর্টকাট ও ক্রিটিক্যাল রিজনিং (২ মিনিট)'
                  : '৩টি প্রাইমারি বিগত প্রশ্ন ও প্যাডাগজি (২ মিনিট)'}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal m-0">
                সহপাঠীদের সাথে ভোটে অংশ নিন, তৎক্ষণাৎ ভোট পার্সেন্টেজ দেখুন এবং ভেরিফায়েড ব্যাখ্যা পড়ে নিয়মটি আয়ত্ত করুন।
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold mb-4 border border-teal-400/30">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-300 block mb-1">
                রাত ১০:০০ • ঘুমানোর আগে
              </span>
              <h3 className="font-black text-base text-white mb-2">ভুলের খাতা ও রিভিশন (১ মিনিট)</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal m-0">
                আজকের দিনের যে প্রশ্নে খটকা লেগেছিল তা ১ নজরে দেখে নিশ্চিন্তে ঘুমান। আপনার ব্রেন রাতে তা স্মৃতিতে সাজিয়ে নেবে।
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. COMPLETE PLATFORM FEATURES WITH UNIQUE ICONS */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            প্ল্যাটফর্মের মূল ফিচারসমূহ
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
            প্রস্তুতির প্রতিটি ধাপের জন্য আধুনিক টুলস
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <Play className="w-6 h-6" />
              </div>
              <Tag color="cyan" className="font-bold text-[10px] rounded-md mb-2">
                সিঙ্গেল-স্ট্রোক রিলস
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">প্রস্তুতি ক্যাপসুল ফিড</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                ফেসবুক রিলস-এর মতো একক স্ট্রোক স্ক্রলিং। জাতীয় সম্পাদকীয় শব্দ, বিসিএস গ্রামার ট্র্যাপ ও লাইভ ভোটযুক্ত এমসিকিউ কুইজ।
              </p>
            </div>
            <Link href="/feed" className="mt-5 block">
              <span className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                ফিড এক্সপ্লোর করুন <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <Tag color="green" className="font-bold text-[10px] rounded-md mb-2">
                ডিজিটাল বাইন্ডার
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">স্টাডি নোটবুক ও রিভিশন শিট</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                যেকোনো শব্দ, বাগধারা, ব্যাকরণ রুল ও প্রশ্ন সাবজেক্ট অনুযায়ী দেশি নেমোনিকসহ সেভ করুন এবং পরীক্ষার আগে প্রিন্ট করুন।
              </p>
            </div>
            <Link href="/notebook" className="mt-5 block">
              <span className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                নোটবুক খুলুন <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <Tag color="purple" className="font-bold text-[10px] rounded-md mb-2">
                সার্বজনীন এআই গাইড
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">লেক্সিবট সার্বিক এআই মেন্টর</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                সাধারণ জ্ঞান, সংবিধান, মুক্তিযুদ্ধ, বাংলা প্রমিত বানান (কুষ্মাণ্ড, অকালপক্ব), ইংরেজি ও গণিত যে কোনো বিষয়ে টু-দ্য-পয়েন্ট ব্যাখ্যা।
              </p>
            </div>
            <button onClick={triggerAIMentor} className="mt-5 text-left cursor-pointer">
              <span className="text-xs font-black text-indigo-700 hover:text-indigo-800 flex items-center gap-1">
                এআই মেন্টরকে প্রশ্ন করুন <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <Tag color="volcano" className="font-bold text-[10px] rounded-md mb-2">
                বাংলা একাডেমি প্রমিত
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">৬৪৮+ প্রমিত বাগধারা কোষ</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                ণ-ত্ব/ষ-ত্ব বিধান অনুযায়ী প্রমিত বানান শুদ্ধিকরণ, ৯৯% ভেরিফিকেশন স্কোর এবং বিগত বিসিএস/ব্যাংক নিয়োগ পরীক্ষার অথেনটিক ট্যাগ।
              </p>
            </div>
            <Link href="/bangla/baghdhara" className="mt-5 block">
              <span className="text-xs font-black text-rose-700 hover:text-rose-800 flex items-center gap-1">
                বাগধারা ডিরেক্টরি <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-sm">
                <Flame className="w-6 h-6" />
              </div>
              <Tag color="gold" className="font-bold text-[10px] rounded-md mb-2">
                লাইভ স্পিড গেম
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">সার্ভাইভার ক্যাম্পেইন</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                ৩টি লাইফলাইন নিয়ে আসল পরীক্ষার চাপ ও নেগেটিভ মার্কিং সামলানোর যুদ্ধ। কম সময়ে নির্ভুল উত্তর দেওয়ার মানসিক দৃঢ়তা গড়ুন।
              </p>
            </div>
            <Link href="/campaign" className="mt-5 block">
              <span className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center gap-1">
                ক্যাম্পেইনে অংশ নিন <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Feature 6 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <RotateCcw className="w-6 h-6" />
              </div>
              <Tag color="blue" className="font-bold text-[10px] rounded-md mb-2">
                স্পেসড রিপিটেশন
              </Tag>
              <h3 className="font-black text-lg text-slate-900 mb-2">ভুলের খাতা ও SM-2 কার্ড</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                কুইজে যেসব প্রশ্নে ভুল হয় তা স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে এবং নির্দিষ্ট সময় পর পর রিভিশনে এসে তথ্য স্মৃতিতে স্থায়ী করে।
              </p>
            </div>
            <Link href="/flashcards" className="mt-5 block">
              <span className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center gap-1">
                রিভিশন কার্ড প্র্যাকটিস <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 7. COVERED COMPETITIVE EXAMS */}
      <section className="bg-slate-100/80 border-y border-gray-200 py-14">
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
                className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 shadow-2xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{exam}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION FINALE */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <Tag color="cyan" className="font-bold text-xs rounded-md mb-4 border-0">
              আজই হোক শুভসূচনা
            </Tag>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
              আপনার স্বপ্নের সরকারি চাকরির প্রস্তুতি আজ থেকেই হোক গোছানো ও অপ্রতিরোধ্য
            </h2>
            <p className="text-xs sm:text-base text-emerald-100/80 font-normal mb-8 leading-relaxed">
              হাজার হাজার পরীক্ষার্থীর ভিড়ে এগিয়ে থাকতে প্রতিদিনের ৫ মিনিট বিনিয়োগ করুন নিজের উজ্জ্বল ভবিষ্যতের জন্য।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/feed">
                <Button
                  type="primary"
                  size="large"
                  icon={<PlayCircleFilled className="text-amber-300" />}
                  className="bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 font-black rounded-2xl h-13 px-8 text-sm sm:text-base border-0 shadow-xl"
                >
                  ফিডে প্রবেশ করুন
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  size="large"
                  className="bg-white/10 hover:!bg-white/20 !text-white font-bold rounded-2xl h-13 px-6 text-sm sm:text-base border-white/20"
                >
                  আমার প্রোফাইল সেট করুন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FLOATING LIVE COMMUNITY ACTIVITY TOAST */}
      <div className="hidden sm:block fixed bottom-6 left-6 z-40 max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={tickerIndex}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white p-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-400/30">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-black text-xs text-white truncate">
                  {LIVE_COMMUNITY_PULSES[tickerIndex].user}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {LIVE_COMMUNITY_PULSES[tickerIndex].time}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-tight m-0 truncate">
                {LIVE_COMMUNITY_PULSES[tickerIndex].action}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 10. DETAILED COMPREHENSIVE FOOTER */}
      <Footer />
    </div>
  );
}
