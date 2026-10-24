'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
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

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

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
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all border border-emerald-400/40 group cursor-pointer"
            title="এআই মেন্টরের সাহায্য নিন"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
              <RobotOutlined className="text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="font-black text-sm tracking-tight pr-1 hidden sm:inline">
              এআই মেন্টর
            </span>
            <span className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </button>
        )}
      </div>

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden font-sans animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl text-emerald-300 shadow-inner">
                <RobotOutlined />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white m-0 tracking-tight leading-tight">
                    লেক্সিবট এআই
                  </h3>
                  <Tag color="success" className="font-bold text-[10px] m-0 border-none px-1.5 py-0">
                    অনলাইন
                  </Tag>
                </div>
                <span className="text-[11px] text-emerald-200/90 font-medium block">
                  বিসিএস ও ব্যাংক ইংলিশ মেন্টর
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition"
              title="বন্ধ করুন"
            >
              <CloseOutlined className="text-base" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.prompt)}
                  disabled={loading}
                  className="flex items-center gap-1 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 hover:border-emerald-300 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-2xs shrink-0"
                >
                  <Icon className="text-emerald-600 text-[11px]" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-xs ${
                      isUser
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-emerald-300'
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
