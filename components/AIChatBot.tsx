'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
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
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Button, Input, Tag, message as antMessage } from 'antd';
import MarkdownViewer from './AIChat/MarkdownViewer';

const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  savedToNotebook?: boolean;
}

const CATEGORY_PROMPTS = [
  {
    category: 'GK / সাধারণ জ্ঞান',
    icon: CompassOutlined,
    prompts: [
      { label: 'সংবিধানের প্রধান অনুচ্ছেদ', text: 'বিসিএস প্রিলির জন্য বাংলাদেশ সংবিধানের সবচেয়ে গুরুত্বপূর্ণ ৫টি অনুচ্ছেদ সহজ ব্যাখ্যাসহ বুঝিয়ে দিন।' },
      { label: 'মুক্তিযুদ্ধের সেক্টর কমান্ডার', text: '১৯৭১ সালের মহান মুক্তিযুদ্ধের প্রধান সেক্টরসমূহ ও সেক্টর কমান্ডারদের তালিকা সংক্ষেপে মনে রাখার কৌশল বলুন।' },
      { label: 'সাম্প্রতিক বৈশ্বিক বিষয়াবলি', text: 'বিসিএস ও ব্যাংক পরীক্ষার উপযোগী আন্তর্জাতিক চুক্তি ও গুরুত্বপূর্ণ সংস্থার সদর দপ্তর সংক্ষেপে বলুন।' },
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
    category: 'বাংলা ব্যাকরণ',
    icon: BookOutlined,
    prompts: [
      { label: 'কুষ্মাণ্ড ও অকালপক্ব শুদ্ধ বানান', text: 'বাংলা একাডেমির প্রমিত নিয়মে কুষ্মাণ্ড, অকালপক্ব, সান্ত্বনা ও অপরাহ্ন বানান কীভাবে গঠিত ও ভুল এড়ানোর উপায় কী?' },
      { label: 'গুরুত্বপূর্ণ বাগধারা ট্রিকস', text: 'বিসিএস ও ব্যাংক পরীক্ষায় আসা বিভ্রান্তিকর ৫টি বাগধারা ও তাদের প্রকৃত অর্থ সংক্ষেপে ব্যাখ্যা করুন।' },
      { label: 'কারক চেনার সহজ টেকনিক', text: 'বিভক্তি ও কারক নির্ণয়ের সহজ টেকনিক এবং বিগত পরীক্ষার ২টি প্রশ্ন সমাধান করে দিন।' },
    ],
  },
  {
    category: 'গণিত ও আইসিটি',
    icon: FireOutlined,
    prompts: [
      { label: 'শতকরা ও লাভ-ক্ষতির শর্টকাট', text: 'বিসিএস ও ব্যাংক প্রিলির লাভ-ক্ষতি ও শতকরা অংক ১০ সেকেন্ডে করার সহজ শর্টকাট সূত্র বুঝিয়ে দিন।' },
      { label: 'আইসিটি বিসিএস টপিক', text: 'আইসিটি অংশের বাইনারি রূপান্তর ও সাইবার সিকিউরিটি সম্পর্কিত গুরুত্বপূর্ণ প্রশ্ন সংক্ষেপে বলুন।' },
    ],
  },
];

export default function AIChatBot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '### স্বাগতম! আমি লেক্সিবট\nআপনার বিসিএস, ব্যাংক ও সরকারি চাকরির সার্বিক প্রস্তুতি সহকারী।\n\n• সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী, সংবিধান, ইতিহাস)\n• ইংরেজি ভোকাবুলারি, Candid vs Cynical কনফিউশন ও গ্রামার ট্র্যাপ\n• বাংলা প্রমিত শুদ্ধ বানান (কুষ্মাণ্ড, অকালপক্ব), বাগধারা ও সাহিত্য\n• গণিত শর্টকাট ও আইসিটি\n\nযেকোনো বিষয়ে প্রশ্ন করুন — টু-দ্য-পয়েন্ট ও সুনির্দিষ্ট ব্যাখ্যা প্রদান করা হবে।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedPhoneOrEmail, setSavedPhoneOrEmail] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('lexi_user_email') || '' : '';
    if (email) setSavedPhoneOrEmail(email);
  }, []);

  useEffect(() => {
    const handleAskEvent = (e: any) => {
      if (e.detail?.prompt) {
        setIsOpen(true);
        setTimeout(() => {
          handleSend(e.detail.prompt);
        }, 150);
      }
    };
    window.addEventListener('lexibot:ask', handleAskEvent);
    return () => window.removeEventListener('lexibot:ask', handleAskEvent);
  }, []);

  const handleCopy = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      antMessage.success('উত্তরটি কপি করা হয়েছে');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSaveToNotebook = async (msg: Message) => {
    try {
      const userEmail = session?.user?.email || localStorage.getItem('lexi_user_email') || 'aspirant@lexilearn.com';
      
      // Extract title from first line
      const firstLine = msg.content.split('\n')[0].replace(/^[#\*\s\-]+/, '').trim();
      const title = firstLine.slice(0, 40) || 'এআই মেন্টর নোট';

      await axios.post('/api/user/notebook', {
        email: userEmail,
        title,
        itemType: 'topic',
        subject: 'gk',
        category: 'এআই মেন্টর রিভিশন',
        content: msg.content,
        mnemonic: 'লেক্সিবট এআই এক্সাম হাই-ইল্ড সামারি',
        tags: ['এআই নোট', 'বিসিএস/ব্যাংক'],
        targetExam: 'BCS / Bank',
        priority: 'high',
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, savedToNotebook: true } : m))
      );
      antMessage.success('নোটবুকে সংরক্ষণ করা হয়েছে!');
    } catch (e) {
      antMessage.info('নোটবুকে সেভ করতে লগইন বা ইমেইল প্রদান করুন');
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    // Check for Email or Phone number in user text to automatically capture lead
    const emailMatch = textToSend.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    const phoneMatch = textToSend.match(/(?:\+?880|0)1[3-9]\d{8}/);

    if (emailMatch && typeof window !== 'undefined') {
      localStorage.setItem('lexi_user_email', emailMatch[0]);
      setSavedPhoneOrEmail(emailMatch[0]);
    } else if (phoneMatch && typeof window !== 'undefined') {
      localStorage.setItem('lexi_user_phone', phoneMatch[0]);
      setSavedPhoneOrEmail(phoneMatch[0]);
    }

    const currentEmail = session?.user?.email || (typeof window !== 'undefined' ? localStorage.getItem('lexi_user_email') : null);

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
          '### সংযোগে সাময়িক বিঘ্ন\nঅনুগ্রহ করে কিছু সময় পর পুনরায় চেষ্টা করুন। আপনি সাধারণ জ্ঞান, বাংলা বানান বা ইংরেজি যেকোনো প্রশ্ন জিজ্ঞাসা করতে পারেন।',
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
      // Strip markdown hashes and stars before speaking
      const cleanText = text.replace(/[#\*`_\[\]]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          '### চ্যাট রিস্টার্ট সম্পন্ন\nনতুন কোনো সাধারণ জ্ঞান, বাংলা সাহিত্য বা ইংরেজি প্রশ্ন থাকলে লিখুন। টু-দ্য-পয়েন্ট ও সুনির্দিষ্ট উত্তর তৈরি করা হবে।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-300 font-bold border border-emerald-400/30"
          aria-label="Open LexiBot AI"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <RobotOutlined className="text-white text-sm" />
          </div>
          <span className="text-sm font-black tracking-wide">LexiBot AI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[96vw] sm:w-[450px] h-[640px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <RobotOutlined className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white m-0">LexiBot Universal AI</h3>
                  <Tag color="cyan" className="text-[10px] m-0 border-0 font-bold">
                    BCS / Bank / GK
                  </Tag>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/90 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>অনলাইন • সার্বিক প্রস্তুতি মেন্টর</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="text"
                icon={<DeleteOutlined className="text-gray-300 hover:text-rose-400 text-sm" />}
                onClick={handleClearChat}
                title="চ্যাট ক্লিয়ার করুন"
                className="hover:!bg-white/10 rounded-xl"
              />
              <Button
                type="text"
                icon={<CloseOutlined className="text-white text-base hover:text-emerald-300" />}
                onClick={() => setIsOpen(false)}
                className="hover:!bg-white/10 rounded-xl"
              />
            </div>
          </div>

          {/* Categorized Quick Prompts */}
          <div className="bg-slate-50 border-b border-gray-200">
            {/* Category Tabs */}
            <div className="flex items-center gap-1 px-3 pt-2 pb-1 overflow-x-auto no-scrollbar">
              {CATEGORY_PROMPTS.map((cat, idx) => {
                const isActive = activeTab === idx;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
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
                  className="shrink-0 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-700 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-gray-700 transition shadow-2xs hover:bg-emerald-50/50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Capture Status Bar (If user provided email/phone) */}
          {savedPhoneOrEmail ? (
            <div className="bg-emerald-50/80 border-b border-emerald-100 px-3 py-1 flex items-center justify-between text-[11px] text-emerald-800">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircleFilled className="text-emerald-600 text-xs" />
                <span>সংযুক্ত প্রোফাইল: <strong>{savedPhoneOrEmail}</strong></span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                ভেরিফায়েড
              </span>
            </div>
          ) : (
            <div className="bg-amber-50/80 border-b border-amber-100 px-3 py-1 flex items-center justify-between text-[11px] text-amber-900">
              <span className="flex items-center gap-1.5">
                <MailOutlined className="text-amber-600 text-xs" />
                <span>ইমেইল বা ফোন চ্যাটে লিখলে সরাসরি স্টাডি বুলেটিন পাবেন।</span>
              </span>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/60">
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
                    {isUser ? <UserOutlined /> : <RobotOutlined />}
                  </div>

                  <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : ''}`}>
                    <div
                      className={`p-3.5 rounded-2xl shadow-xs ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-tr-none font-medium text-xs sm:text-sm leading-relaxed'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-normal'
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
                            className="hover:text-emerald-700 transition flex items-center gap-1 text-[11px] text-gray-500 font-medium"
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
                            className="hover:text-emerald-700 transition flex items-center gap-1 text-[11px] text-gray-500 font-medium"
                            title="উচ্চারণ শুনুন"
                          >
                            <SoundOutlined />
                            <span>শুনুন</span>
                          </button>

                          <button
                            onClick={() => handleSaveToNotebook(msg)}
                            className={`transition flex items-center gap-1 text-[11px] font-semibold ${
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
              <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-2xl border border-gray-200 w-fit shadow-xs animate-pulse">
                <SyncOutlined spin className="text-emerald-600 text-sm" />
                <span className="font-semibold">লেক্সিবট উত্তর তৈরি করছে...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-gray-200 shadow-md">
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
                placeholder="সাধারণ জ্ঞান, বাংলা, ইংরেজি বা ফোন/ইমেইল লিখুন..."
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
              <span>যেকোনো সাধারণ জ্ঞান বা চাকরির প্রস্তুতি প্রশ্ন</span>
              <span>Enter চেপে পাঠান</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
