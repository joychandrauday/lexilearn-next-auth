'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Drawer, Button, Avatar } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  ThunderboltOutlined,
  ThunderboltFilled,
  BookOutlined,
  TrophyOutlined,
  MenuOutlined,
  CloseOutlined,
  FireOutlined,
  BankOutlined,
  CalculatorOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { siteConfig } from '../lib/config/site';

const navItems = [
  { label: 'হোম', href: '/', icon: HomeOutlined },
  { label: 'ভোকাবুলারি', href: '/words', icon: ReadOutlined },
  { label: 'রিভিশন', href: '/flashcards', icon: ThunderboltOutlined },
  { label: 'মডেল টেস্ট', href: '/quiz', icon: TrophyOutlined },
];

const drawerSections = [
  {
    title: 'প্রধান মেনু',
    links: [
      { key: 'dashboard', label: 'ড্যাশবোর্ড', href: '/dashboard', icon: <HomeOutlined /> },
      { key: 'daily-capsule', label: 'দৈনিক ক্যাপসুল', href: '/daily-capsule', icon: <ThunderboltOutlined /> },
    ],
  },
  {
    title: 'বিষয়ভিত্তিক প্রস্তুতি',
    links: [
      { key: 'hf-333', label: 'ব্যারন ৩৩৩ ভোকাবুলারি', href: '/high-frequency-333', icon: <FireOutlined className="text-amber-500" /> },
      { key: 'words', label: 'ভোকাবুলারি হাব', href: '/words', icon: <BookOutlined className="text-emerald-600" /> },
      { key: 'bangla-shobdo', label: 'বাংলা শব্দ উৎস', href: '/bangla/shobdo', icon: <GlobalOutlined className="text-cyan-600" /> },
      { key: 'bangla', label: 'বাংলা হাব ও বাগধারা', href: '/bangla', icon: <BookOutlined className="text-teal-600" /> },
      { key: 'focus-writing', label: 'ব্যাংক ফোকাস রাইটিং', href: '/focus-writing', icon: <BankOutlined className="text-emerald-700" /> },
      { key: 'math', label: 'গণিত প্রস্তুতি', href: '/math', icon: <CalculatorOutlined className="text-blue-600" /> },
      { key: 'translation', label: 'অনুবাদ স্টুডিও', href: '/translation', icon: <ReadOutlined className="text-indigo-600" /> },
    ],
  },
  {
    title: 'অনুশীলন ও টেস্ট',
    links: [
      { key: 'battle', label: '১‑vs‑১ কুইজ ডুয়েল', href: '/battle', icon: <ThunderboltFilled className="text-violet-600" /> },
      { key: 'quiz', label: 'মডেল টেস্ট', href: '/quiz', icon: <TrophyOutlined className="text-amber-600" /> },
      { key: 'flashcards', label: 'রিভিশন ফ্ল্যাশকার্ড', href: '/flashcards', icon: <FireOutlined className="text-rose-500" /> },
      { key: 'cloze', label: 'ক্লজ টেস্ট', href: '/cloze', icon: <ReadOutlined className="text-cyan-600" /> },
      { key: 'spelling', label: 'বানান শুদ্ধিকরণ', href: '/spelling', icon: <CheckCircleFilled className="text-emerald-500" /> },
      { key: 'question-bank', label: 'স্মার্ট প্রশ্নব্যাংক', href: '/question-bank', icon: <BookOutlined className="text-blue-500" /> },
    ],
  },
  {
    title: 'স্টাডি টুলস ও রিসোর্স',
    links: [
      { key: 'pomodoro', label: 'পোমোডোরো ফোকাস টাইমার', href: '/pomodoro', icon: <ClockCircleOutlined className="text-rose-500" /> },
      { key: 'planner', label: 'স্টাডি প্ল্যানার ও রুটিন', href: '/planner', icon: <CalendarOutlined className="text-emerald-600" /> },
      { key: 'notebook', label: 'প্রস্তুতি নোটবুক', href: '/notebook', icon: <BookOutlined className="text-amber-600" /> },
      { key: 'mistakes', label: 'ভুলের খাতা (Mistake Vault)', href: '/mistakes', icon: <ReadOutlined className="text-rose-500" /> },
      { key: 'panic-sheet', label: 'পরীক্ষার রিভিশন শিট', href: '/panic-sheet', icon: <ThunderboltOutlined className="text-orange-500" /> },
      { key: 'news-archive', label: 'পত্রিকা আর্কাইভ', href: '/news-archive', icon: <ReadOutlined className="text-blue-600" /> },
      { key: 'feed', label: 'প্রস্তুতি ফিড', href: '/feed', icon: <ThunderboltFilled className="text-violet-600" /> },
      { key: 'about', label: 'আমাদের সম্পর্কে', href: '/about', icon: <BookOutlined className="text-gray-500" /> },
    ],
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Completely hide BottomNav on Pomodoro focus mode
  if (pathname === '/pomodoro') {
    return null;
  }

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Bottom Fixed Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] font-sans">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-700 font-black scale-105'
                    : 'text-gray-400 hover:text-gray-700 font-medium'
                }`}
              >
                <Icon className={`text-lg mb-0.5 ${isActive ? 'text-emerald-600' : ''}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 scale-100 shadow-[0_0_8px_rgba(5,150,105,0.7)]'
                      : 'bg-transparent scale-0'
                  }`}
                />
              </Link>
            );
          })}

          {/* 5th Action: Hamburger Menu Drawer Trigger */}
          <button
            onClick={toggleDrawer}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              drawerOpen
                ? 'text-emerald-700 font-black scale-105'
                : 'text-gray-400 hover:text-gray-700 font-medium'
            }`}
            aria-label="সকল মেনু দেখুন"
          >
            <MenuOutlined className={`text-lg mb-0.5 ${drawerOpen ? 'text-emerald-600' : ''}`} />
            <span className="text-[10px] tracking-tight">সকল মেনু</span>
            <span
              className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all duration-200 ${
                drawerOpen
                  ? 'bg-emerald-600 scale-100 shadow-[0_0_8px_rgba(5,150,105,0.7)]'
                  : 'bg-transparent scale-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Comprehensive All-Routes Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative flex items-center justify-center rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 p-1">
              <Image
                src="/iconflat.png"
                alt="OwlPrep Logo"
                width={28}
                height={28}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <div className="text-base font-black text-gray-900 leading-tight">
                Owl<span className="text-emerald-600">Prep</span>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                সকল বিষয়ের প্রস্তুতি মেনু
              </div>
            </div>
          </div>
        }
        placement="left"
        onClose={closeDrawer}
        open={drawerOpen}
        width={310}
        closeIcon={<CloseOutlined className="text-gray-700" />}
        className="font-sans md:hidden"
      >
        <div className="flex flex-col h-full justify-between pb-6">
          {/* Categorized Routes */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-4 mt-1">
            {drawerSections.map((sec) => (
              <div key={sec.title}>
                <div className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {sec.title}
                </div>
                <nav className="flex flex-col gap-1">
                  {sec.links.map((item) => {
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeDrawer}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`text-sm ${isActive ? 'text-white' : ''}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Account / Auth Section in Drawer Footer */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            {session?.user ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 px-2">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full border border-gray-200"
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} className="bg-emerald-600" />
                  )}
                  <div className="truncate">
                    <p className="font-bold text-xs text-gray-900 m-0 truncate">
                      {session.user.name || 'শিক্ষার্থী'}
                    </p>
                    <p className="text-[11px] text-gray-500 m-0 truncate font-mono">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link href="/profile" onClick={closeDrawer}>
                    <Button block icon={<UserOutlined />} className="rounded-xl font-bold text-xs">
                      প্রোফাইল
                    </Button>
                  </Link>
                  <Link href="/my-words" onClick={closeDrawer}>
                    <Button block icon={<BookOutlined />} className="rounded-xl font-bold text-xs">
                      সংরক্ষিত শব্দ
                    </Button>
                  </Link>
                </div>

                <Button
                  danger
                  block
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    closeDrawer();
                    signOut();
                  }}
                  className="rounded-xl font-bold text-xs"
                >
                  সাইন আউট
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                block
                icon={<UserOutlined />}
                onClick={() => {
                  closeDrawer();
                  signIn('google');
                }}
                className="bg-emerald-600 hover:!bg-emerald-500 rounded-xl font-bold h-10 text-xs shadow-md border-none"
              >
                গুগল দিয়ে লগইন করুন
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
