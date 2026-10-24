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
  LockOutlined,
} from '@ant-design/icons';
import { Button, Input, Spin, Tag } from 'antd';

const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: 'Subjunctive Mood এর নিয়ম', icon: BulbOutlined, prompt: 'বিসিএস ও ব্যাংক পরীক্ষায় Subjunctive Mood এর নিয়ম এবং বিগত বছরের প্রশ্নসহ বুঝিয়ে দিন।' },
  { label: 'Preposition এর ট্রিক', icon: BookOutlined, prompt: 'বিসিএস প্রিলির সবচেয়ে গুরুত্বপূর্ণ ১০টি Appropriate Preposition এবং মনে রাখার সহজ কৌশল বলুন।' },
  { label: 'বিসিএস ভাইভা টিপস', icon: CompassOutlined, prompt: 'বিসিএস ভাইভায় ইংরেজি অংশে কীভাবে ভালো প্রস্তুতি নেওয়া যায় এবং কোন বিষয়গুলো লক্ষ্য রাখা উচিত?' },
  { label: 'মোস্ট রিপিটেড শব্দ', icon: FireOutlined, prompt: 'বিগত বিসিএস ও ব্যাংক পরীক্ষায় বারবার আসা ৫টি কনফিউজিং শব্দ ও তাদের বাংলা অর্থ ব্যাখ্যা করুন।' },
];

export default function AIChatBot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'নমস্কার! আমি লেক্সিবট — আপনার বিসিএস ও ব্যাংক ইংলিশ প্রস্তুতি মেন্টর। ইংরেজি ভোকাবুলারি, গ্রামার নিয়ম, বা বিগত পরীক্ষার যেকোনো প্রশ্ন সম্পর্কে জানতে প্রশ্ন করুন।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    // Strict Auth Gate: User must be signed in or registered with email
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('lexi_user_email') : null;
    const isAuthed = !!(session?.user?.email || savedEmail);

    if (!isAuthed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      const gateMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'AI মেন্টরের সাথে প্রশ্নোত্তর ও গভীর আলোচনার জন্য অনুগ্রহ করে আপনার ইমেইল প্রদান করে সাইন ইন বা রেজিস্টার করুন।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, gateMessage]);
      return;
    }

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

      const res = await axios.post('/api/ai/chat', { messages: history });

      if (res.data?.success && res.data?.reply) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('No response');
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'দুঃখিত, সংযোগে সামান্য বিঘ্ন ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন বা এপিআই কি কনফিগারেশন চেক করুন।',
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-300 font-bold border border-emerald-400/30"
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <RobotOutlined className="text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white m-0">LexiBot AI Mentor</h3>
                  <Tag color="cyan" className="text-[10px] m-0 border-0 font-bold">
                    BCS / Bank
                  </Tag>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>অনলাইন • প্রস্তুতি মেন্টর</span>
                </div>
              </div>
            </div>

            <Button
              type="text"
              icon={<CloseOutlined className="text-white text-base hover:text-emerald-300" />}
              onClick={() => setIsOpen(false)}
              className="hover:!bg-white/10 rounded-xl"
            />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
              দ্রুত প্রশ্ন:
            </span>
            {QUICK_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.prompt)}
                className="shrink-0 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-700 px-2.5 py-1 rounded-xl text-[11px] font-bold text-gray-600 transition shadow-xs flex items-center gap-1"
              >
                <item.icon className="text-emerald-600" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
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

                  <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : ''}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs font-medium'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-xs font-medium'
                      }`}
                    >
                      {msg.content}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-[10px] text-gray-400 px-1 ${
                        isUser ? 'justify-end' : ''
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => playTTS(msg.content)}
                          className="hover:text-emerald-600 transition"
                          title="উচ্চারণ শুনুন"
                        >
                          <SoundOutlined />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl border border-gray-200 w-fit shadow-xs">
                <SyncOutlined spin className="text-emerald-600" />
                <span>লেক্সিবট উত্তর তৈরি করছে...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-gray-200">
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
                placeholder="যেকোনো ইংরেজি শব্দ বা গ্রামার প্রশ্ন লিখুন..."
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
              <span>স্মার্ট এআই লার্নিং অ্যাসিস্ট্যান্ট</span>
              <span>Enter চেপে পাঠান</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
