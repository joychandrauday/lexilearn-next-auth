'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RobotOutlined,
  SendOutlined,
  CloseOutlined,
  SoundOutlined,
  BulbOutlined,
  BookOutlined,
  CompassOutlined,
  FireOutlined,
  UserOutlined,
  SyncOutlined,
  CopyOutlined,
  CheckOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  MailOutlined,
  DownloadOutlined,
  AimOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Button, Input, Tag, message as antMessage } from 'antd';
import MarkdownViewer from './AIChat/MarkdownViewer';
import { siteConfig, getStoredUserEmail, setStoredUserEmail } from '../lib/config/site';

const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  savedToNotebook?: boolean;
}

const CHAT_STORAGE_KEY = 'owlprep_chat_history_v1';

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    `### 🦉 স্বাগতম! আমি ${siteConfig.bot.name} (${siteConfig.bot.nameBn})\nআপনার বিসিএস, ব্যাংক ও সরকারি চাকরির সার্বিক প্রস্তুতি সহকারী।\n\n• **সাধারণ জ্ঞান**: বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী, সংবিধানের অনুচ্ছেদ ও সংশোধনী, মুক্তিযুদ্ধ\n• **ইংরেজি**: ভোকাবুলারি, Candid vs Cynical কনফিউশন, গ্রামার ট্র্যাপ ও সাহিত্য\n• **বাংলা**: প্রমিত শুদ্ধ বানান (কুষ্মাণ্ড, অকালপক্ব), বাগধারা, সমাস ও চর্যাপদ\n• **গণিত ও ব্যাংকিং**: লাভ-ক্ষতি শর্টকাট, ঐকিক নিয়ম, Repo, CRR ও আর্থিক টার্মস\n\nযেকোনো বিষয়ে প্রশ্ন করুন — টু-দ্য-পয়েন্ট ও সুনির্দিষ্ট পরীক্ষা উপযোগী ব্যাখ্যা পাবেন।`,
  timestamp: 'এখন',
};

const CATEGORY_PROMPTS = [
  {
    category: 'GK / সাধারণ জ্ঞান',
    icon: CompassOutlined,
    prompts: [
      { label: 'সংবিধানের প্রধান অনুচ্ছেদ', text: 'বিসিএস প্রিলির জন্য বাংলাদেশ সংবিধানের সবচেয়ে গুরুত্বপূর্ণ ৫টি অনুচ্ছেদ সহজ ব্যাখ্যাসহ বুঝিয়ে দিন।' },
      { label: 'মুক্তিযুদ্ধের সেক্টর কমান্ডার', text: '১৯৭১ সালের মহান মুক্তিযুদ্ধের প্রধান সেক্টরসমূহ ও সেক্টর কমান্ডারদের তালিকা সংক্ষেপে মনে রাখার কৌশল বলুন।' },
      { label: '৭ জন বীরশ্রেষ্ঠ পরিচিতি', text: 'মুক্তিযুদ্ধের ৭ জন বীরশ্রেষ্ঠর নাম, সেক্টর ও শাহাদাতের স্থান সংক্ষেপে মনে রাখার ছন্দ বলুন।' },
      { label: 'মুজিবনগর সরকার গঠন', text: 'মুজিবনগর সরকারের গুরুত্বপূর্ণ পদসমূহ ও শপথ গ্রহণের বিসিএস প্রিলি ট্র্যাপ কী কী?' },
    ],
  },
  {
    category: 'ইংরেজি / Vocab',
    icon: BulbOutlined,
    prompts: [
      { label: 'Candid বনাম Cynical', text: 'Candid এবং Cynical শব্দের মধ্যে মূল পার্থক্য, অর্থ, নেমোনিক ও বিগত পরীক্ষার প্রশ্নসহ বুঝিয়ে দিন।' },
      { label: 'Subjunctive Mood', text: 'বিসিএস ও ব্যাংক পরীক্ষায় Subjunctive Mood এর নিয়ম এবং বিগত বছরের প্রশ্নসহ সংক্ষেপে বুঝিয়ে দিন।' },
      { label: 'Top 10 Prepositions', text: 'বিগত বিসিএস প্রিলির সবচেয়ে গুরুত্বপূর্ণ Appropriate Prepositions এবং মনে রাখার সহজ কৌশল বলুন।' },
    ],
  },
  {
    category: 'বাংলা ব্যাকরণ ও সাহিত্য',
    icon: BookOutlined,
    prompts: [
      { label: 'কুষ্মাণ্ড ও অকালপক্ব শুদ্ধ বানান', text: 'বাংলা একাডেমির প্রমিত নিয়মে কুষ্মাণ্ড, অকালপক্ব, সান্ত্বনা ও অপরাহ্ন বানান কীভাবে গঠিত ও ভুল এড়ানোর উপায় কী?' },
      { label: 'চর্যাপদ ও প্রাচীন যুগ', text: 'চর্যাপদের আবিষ্কার, পদসংখ্যা, কবিগণ ও ভাষা বিতর্ক নিয়ে বিসিএস প্রিলির গুরুত্বপূর্ণ তথ্য বলুন।' },
      { label: 'কারক চেনার সহজ টেকনিক', text: 'বিভক্তি ও কারক নির্ণয়ের সহজ টেকনিক এবং বিগত পরীক্ষার ২টি প্রশ্ন সমাধান করে দিন।' },
    ],
  },
  {
    category: 'গণিত ও ব্যাংক প্রস্তুতি',
    icon: FireOutlined,
    prompts: [
      { label: 'শতকরা ও লাভ-ক্ষতির শর্টকাট', text: 'বিসিএস ও ব্যাংক প্রিলির লাভ-ক্ষতি ও শতকরা অংক ১০ সেকেন্ডে করার সহজ শর্টকাট সূত্র বুঝিয়ে দিন।' },
      { label: 'Repo ও CRR কী?', text: 'বাংলাদেশ ব্যাংক ও ব্যাংকিং পরীক্ষার জন্য Repo Rate, Reverse Repo ও CRR এর বাস্তব উদাহরণসহ পার্থক্য বুঝিয়ে দিন।' },
      { label: 'সময় ও কাজের শর্টকাট', text: 'সময়, কাজ ও নল-চৌবাচ্চার অঙ্ক দ্রুত সমাধান করার টেকনিক বুঝিয়ে দিন।' },
    ],
  },
];

export default function AIChatBot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [examFocus, setExamFocus] = useState<string>('বিসিএস প্রিলি');
  const [savedPhoneOrEmail, setSavedPhoneOrEmail] = useState<string>('');

  const EXAM_MODES = [
    { label: 'বিসিএস প্রিলি', tag: 'BCS' },
    { label: 'বাংলাদেশ ব্যাংক', tag: 'BANK' },
    { label: 'প্রাইমারি ও NTRCA', tag: 'DPE' },
    { label: 'সাধারণ জ্ঞান ও সংবিধান', tag: 'GK' },
  ];

  // Load chat history from localStorage on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved chat history:', e);
    }

    const email = getStoredUserEmail() || '';
    if (email) setSavedPhoneOrEmail(email);
  }, []);

  // Save chat history to localStorage whenever messages update
  useEffect(() => {
    if (typeof window === 'undefined' || messages.length === 0) return;
    try {
      // Keep up to 60 messages in history to preserve storage & fast rendering
      const trimmed = messages.slice(-60);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save chat history to localStorage:', e);
    }
  }, [messages]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Global event listener to open Owl AI from anywhere in the app
  useEffect(() => {
    const handleAskEvent = (e: any) => {
      if (e.detail?.prompt) {
        setIsOpen(true);
        setTimeout(() => {
          handleSend(e.detail.prompt);
        }, 200);
      }
    };
    window.addEventListener(siteConfig.bot.eventTrigger, handleAskEvent);
    window.addEventListener(siteConfig.bot.legacyEventTrigger, handleAskEvent);
    return () => {
      window.removeEventListener(siteConfig.bot.eventTrigger, handleAskEvent);
      window.removeEventListener(siteConfig.bot.legacyEventTrigger, handleAskEvent);
    };
  }, []);

  const handleExportNotes = () => {
    if (messages.length <= 1) {
      antMessage.info('ডাউনলোড করার মতো পর্যাপ্ত নোট চ্যাটে নেই');
      return;
    }
    const textContent =
      `# ${siteConfig.name} AI Mentor Study Notes\n` +
      `তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n` +
      `ফোকাস: ${examFocus}\n\n` +
      messages
        .filter((m) => m.id !== 'welcome' && !m.id.startsWith('reset-'))
        .map(
          (m) =>
            `### ${m.role === 'user' ? 'প্রশ্ন' : `${siteConfig.bot.name} সমাধান`} (${m.timestamp}):\n${m.content}\n\n`
        )
        .join('---\n\n');

    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteConfig.name}-AI-Notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    antMessage.success('নোট ফাইল ডাউনলোড সম্পন্ন হয়েছে!');
  };

  const handleQuizMe = () => {
    const lastUserMsg =
      messages.filter((m) => m.role === 'user').pop()?.content || 'ভোকাবুলারি ও বিসিএস প্রস্তুতি';
    handleSend(
      `[${examFocus} স্পেশাল কুইজ] "${lastUserMsg}" বিষয়ের উপর বিগত পরীক্ষার প্যাটার্নে ১টি ট্রিকি ৪-অপশনযুক্ত MCQ কুইজ প্রশ্ন এবং তার সঠিক ব্যাখ্যা দিন।`
    );
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      antMessage.success('উত্তরটি কপি করা হয়েছে');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleClearChat = () => {
    const resetMsg: Message = {
      id: `reset-${Date.now()}`,
      role: 'assistant',
      content:
        `### 🦉 চ্যাট রিস্টার্ট সম্পন্ন\nপূর্ববর্তী চ্যাট ক্লিয়ার করা হয়েছে। নতুন কোনো সাধারণ জ্ঞান, সংবিধান, গণিত শর্টকাট, বাংলা বা ইংরেজি প্রশ্ন থাকলে লিখুন।`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([resetMsg]);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([resetMsg]));
    } catch {}
    antMessage.success('চ্যাট হিস্ট্রি রিসেট করা হয়েছে');
  };

  const handleSaveToNotebook = async (msg: Message) => {
    try {
      const storedEmail = getStoredUserEmail();
      const userEmail =
        session?.user?.email || savedPhoneOrEmail || storedEmail || `learner@${siteConfig.links.domain}`;

      const lines = msg.content.split('\n').filter((l) => l.trim().length > 0);
      const firstLine = (lines[0] || '').replace(/^[#\*\s\-]+/, '').trim();
      const title = firstLine.slice(0, 50) || 'এআই মেন্টর নোট';

      const lower = msg.content.toLowerCase();
      let detectedSubject: 'english' | 'bangla' | 'gk' | 'math' | 'science_it' = 'gk';
      if (
        lower.includes('synonym') ||
        lower.includes('antonym') ||
        lower.includes('vocabulary') ||
        lower.includes('preposition')
      ) {
        detectedSubject = 'english';
      } else if (
        lower.includes('বানান') ||
        lower.includes('বাগধারা') ||
        lower.includes('কারক') ||
        lower.includes('সমাস') ||
        lower.includes('সাহিত্য')
      ) {
        detectedSubject = 'bangla';
      } else if (
        lower.includes('শতকরা') ||
        lower.includes('লাভ-ক্ষতি') ||
        lower.includes('গণিত') ||
        lower.includes('সুদকষা')
      ) {
        detectedSubject = 'math';
      } else if (lower.includes('আইসিটি') || lower.includes('কম্পিউটার') || lower.includes('বিজ্ঞান')) {
        detectedSubject = 'science_it';
      }

      const res = await axios.post('/api/user/notebook', {
        userEmail,
        email: userEmail,
        title,
        itemType: 'topic',
        subject: detectedSubject,
        category: `${siteConfig.bot.name} • ${examFocus}`,
        content: msg.content,
        mnemonic: `${siteConfig.bot.name} এআই এক্সাম হাই-ইল্ড সামারি`,
        tags: ['এআই নোট', examFocus, 'বিসিএস/ব্যাংক'],
        targetExam: examFocus,
        priority: 'high',
      });

      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, savedToNotebook: true } : m))
        );
        antMessage.success('নোটবুকে সফলভাবে সংরক্ষণ করা হয়েছে!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(siteConfig.events.notebookUpdated));
          window.dispatchEvent(new CustomEvent(siteConfig.events.legacyNotebookUpdated));
        }
      } else {
        throw new Error(res.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      console.error('Save to notebook error:', e);
      antMessage.error('নোটবুকে সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    // Automatically capture lead if email or phone is found
    const emailMatch = textToSend.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    const phoneMatch = textToSend.match(/(?:\+?880|0)1[3-9]\d{8}/);

    if (emailMatch && typeof window !== 'undefined') {
      setStoredUserEmail(emailMatch[0]);
      setSavedPhoneOrEmail(emailMatch[0]);
    } else if (phoneMatch && typeof window !== 'undefined') {
      localStorage.setItem('lexi_user_phone', phoneMatch[0]);
      setSavedPhoneOrEmail(phoneMatch[0]);
    }

    const currentEmail = session?.user?.email || getStoredUserEmail();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post('/api/ai/chat', {
        messages: history,
        userEmail: currentEmail || undefined,
      });

      if (res.data?.success && res.data?.reply) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);

        if (res.data.capturedContact?.email) {
          setSavedPhoneOrEmail(res.data.capturedContact.email);
        }
      } else {
        throw new Error('No response');
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '### সংযোগে সাময়িক বিঘ্ন\nসার্ভারের সাথে সংযোগে সাময়িক বিলম্ব হচ্ছে। অনুগ্রহ করে একটু পর চেষ্টা করুন। যেকোনো সাধারণ জ্ঞান, বাংলা ব্যাকরণ, সংবিধান বা গণিত প্রশ্ন করতে পারেন।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const playTTS = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[#\*`_\[\]]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all duration-300 font-bold border border-emerald-400/40 group cursor-pointer"
        aria-label={`Open ${siteConfig.bot.name}`}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm shadow-inner group-hover:rotate-12 transition-transform">
          🦉
        </div>
        <span className="text-sm font-black tracking-wide">{siteConfig.bot.name}</span>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>
      </button>

      {/* Slide-over Drawer from Right with Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity cursor-pointer"
            />

            {/* Right-Side Drawer Container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-md sm:max-w-lg md:max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between shadow-md shrink-0 border-b border-emerald-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shadow-inner">
                      🦉
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-white m-0 tracking-tight">
                          {siteConfig.bot.name} Mentor
                        </h3>
                        <Tag color="cyan" className="text-[10px] m-0 border-0 font-bold px-1.5 py-0.2">
                          BCS / Bank / GK
                        </Tag>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>সার্বিক চাকরি প্রস্তুতি এআই • ইতিহাস সংরক্ষিত</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Chat History Counter & Clear */}
                    <Tag
                      icon={<HistoryOutlined />}
                      color="default"
                      className="text-[10px] font-mono text-slate-300 bg-white/10 border-white/15 m-0 hidden sm:inline-flex"
                      title="মোট সংরক্ষিত বার্তা"
                    >
                      {messages.length}টি বার্তা
                    </Tag>

                    <Button
                      type="text"
                      icon={<DownloadOutlined className="text-gray-300 hover:text-emerald-400 text-sm" />}
                      onClick={handleExportNotes}
                      title="নোট ডাউনলোড করুন (.md)"
                      className="hover:!bg-white/10 rounded-xl !text-white"
                    />

                    <Button
                      type="text"
                      icon={<DeleteOutlined className="text-gray-300 hover:text-rose-400 text-sm" />}
                      onClick={handleClearChat}
                      title="চ্যাট হিস্ট্রি রিসেট করুন"
                      className="hover:!bg-white/10 rounded-xl !text-white"
                    />

                    <Button
                      type="text"
                      icon={<CloseOutlined className="text-white text-base hover:text-rose-400" />}
                      onClick={() => setIsOpen(false)}
                      title="ড্রয়ার বন্ধ করুন (Esc)"
                      className="hover:!bg-white/10 rounded-xl !text-white ml-1"
                    />
                  </div>
                </div>

                {/* Exam Focus Mode Bar */}
                <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-white overflow-x-auto no-scrollbar shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                      <AimOutlined className="text-emerald-400" /> ফোকাস:
                    </span>
                    {EXAM_MODES.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setExamFocus(m.label)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition shrink-0 cursor-pointer ${
                          examFocus === m.label
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleQuizMe}
                    className="text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ml-2 transition cursor-pointer"
                    title="বর্তমান টপিকে কুইজ প্রশ্ন তৈরি করুন"
                  >
                    <QuestionCircleOutlined />
                    <span>কুইজ নিন</span>
                  </button>
                </div>

                {/* Categorized Quick Prompts */}
                <div className="bg-slate-50 border-b border-gray-200 shrink-0">
                  {/* Category Tabs */}
                  <div className="flex items-center gap-1 px-3 pt-2 pb-1 overflow-x-auto no-scrollbar">
                    {CATEGORY_PROMPTS.map((cat, idx) => {
                      const isActive = activeTab === idx;
                      const IconComponent = cat.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveTab(idx)}
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white text-gray-600 hover:text-emerald-700 hover:bg-slate-100 border border-gray-200'
                          }`}
                        >
                          <IconComponent className={isActive ? 'text-white' : 'text-emerald-600'} />
                          <span>{cat.category}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Prompt Chips */}
                  <div className="px-3 pb-2 pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {CATEGORY_PROMPTS[activeTab].prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(p.text)}
                        className="shrink-0 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-700 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-gray-700 transition shadow-2xs hover:bg-emerald-50/50 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead Contact Status Bar */}
                {savedPhoneOrEmail ? (
                  <div className="bg-emerald-50/90 border-b border-emerald-100 px-3.5 py-1 flex items-center justify-between text-[11px] text-emerald-800 shrink-0">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircleFilled className="text-emerald-600 text-xs" />
                      <span>সংযুক্ত প্রোফাইল: <strong>{savedPhoneOrEmail}</strong></span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      অ্যালার্ট অ্যাক্টিভ
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50/90 border-b border-amber-100 px-3.5 py-1 flex items-center justify-between text-[11px] text-amber-900 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <MailOutlined className="text-amber-600 text-xs" />
                      <span>ইমেইল বা ফোন চ্যাটে লিখলে সরাসরি স্টাডি বুলেটিন শিট পাবেন।</span>
                    </span>
                  </div>
                )}

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                            isUser
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-tr from-slate-800 to-slate-900 text-emerald-400'
                          }`}
                        >
                          {isUser ? <UserOutlined /> : <span>🦉</span>}
                        </div>

                        <div className={`max-w-[88%] space-y-1.5 ${isUser ? 'items-end' : ''}`}>
                          <div
                            className={`p-3.5 rounded-2xl shadow-xs ${
                              isUser
                                ? 'bg-emerald-600 text-white rounded-tr-none font-medium text-xs sm:text-sm leading-relaxed'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-normal text-xs sm:text-sm'
                            }`}
                          >
                            {isUser ? (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            ) : (
                              <MarkdownViewer content={msg.content} />
                            )}
                          </div>

                          {/* Action Bar for Assistant Messages */}
                          <div
                            className={`flex items-center gap-2 text-[11px] text-gray-400 px-1 ${
                              isUser ? 'justify-end' : 'justify-between'
                            }`}
                          >
                            <span>{msg.timestamp}</span>

                            {!isUser && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopy(msg.id, msg.content)}
                                  className="hover:text-emerald-700 transition flex items-center gap-1 text-[11px] text-gray-500 font-medium cursor-pointer"
                                  title="উত্তর কপি করুন"
                                >
                                  {copiedId === msg.id ? (
                                    <CheckOutlined className="text-emerald-600" />
                                  ) : (
                                    <CopyOutlined />
                                  )}
                                  <span>{copiedId === msg.id ? 'কপি হয়েছে' : 'কপি'}</span>
                                </button>

                                <button
                                  onClick={() => playTTS(msg.content)}
                                  className="hover:text-emerald-700 transition flex items-center gap-1 text-[11px] text-gray-500 font-medium cursor-pointer"
                                  title="উচ্চারণ শুনুন"
                                >
                                  <SoundOutlined />
                                  <span>শুনুন</span>
                                </button>

                                <button
                                  onClick={() => handleSaveToNotebook(msg)}
                                  className={`transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                                    msg.savedToNotebook
                                      ? 'text-emerald-600 font-bold'
                                      : 'text-gray-500 hover:text-emerald-700'
                                  }`}
                                  title="নোটবুকে সেভ করুন"
                                >
                                  <PlusCircleOutlined />
                                  <span>{msg.savedToNotebook ? 'সেভড' : 'নোটবুকে সেভ'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-white p-3.5 rounded-2xl border border-gray-200 w-fit shadow-xs animate-pulse">
                      <SyncOutlined spin className="text-emerald-600 text-sm" />
                      <span className="font-semibold">{siteConfig.bot.name} উত্তর তৈরি করছে...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3.5 bg-white border-t border-gray-200 shadow-lg shrink-0">
                  <div className="flex items-center gap-2">
                    <TextArea
                      rows={1}
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="সাধারণ জ্ঞান, সংবিধান, গণিত বা যেকোনো প্রশ্ন লিখুন..."
                      className="rounded-xl font-medium text-xs sm:text-sm resize-none py-2"
                      disabled={loading}
                    />
                    <Button
                      type="primary"
                      onClick={() => handleSend()}
                      loading={loading}
                      disabled={!input.trim()}
                      icon={<SendOutlined />}
                      className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-10 px-4 border-none shrink-0"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1.5 px-1">
                    <span>চ্যাট হিস্ট্রি স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে</span>
                    <span>Enter চেপে পাঠান • Esc বন্ধ করুন</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
