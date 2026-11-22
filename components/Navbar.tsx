'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Drawer, Button, Avatar, Dropdown, MenuProps } from 'antd';
import {
  MenuOutlined,
  CloseOutlined,
  FireOutlined,
  ThunderboltFilled,
  ThunderboltOutlined,
  BookOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  ReadOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  HomeOutlined,
  BankOutlined,
  CalculatorOutlined,
  TrophyOutlined,
  DownOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { siteConfig } from '../lib/config/site';
import NavbarTicker from './NavbarTicker';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const isLanding = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isLanding && !isScrolled;

  const toggleDrawer = () => setVisible(!visible);

  // Fetch streak if user is logged in
  useEffect(() => {
    const fetchStreak = () => {
      if (session?.user?.email) {
        fetch(`/api/user/progress?user=${encodeURIComponent(session.user.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.progress?.streak) {
              setStreak(data.progress.streak);
            }
          })
          .catch(() => {});
      }
    };

    fetchStreak();

    window.addEventListener('study-progress-updated', fetchStreak);
    return () => window.removeEventListener('study-progress-updated', fetchStreak);
  }, [session]);

  // Completely hide Navbar on Pomodoro focus mode for 100% distraction-free zen session
  // Placed AFTER all hooks to adhere to React Rules of Hooks
  if (pathname === '/pomodoro') {
    return null;
  }

  // Dropdown Items: Preparation / Subject Modules
  const prepDropdownItems: MenuProps['items'] = [
    {
      key: 'focus-writing',
      icon: <BankOutlined className="text-emerald-600 text-sm" />,
      label: (
        <Link href="/focus-writing" className="font-semibold text-gray-700 text-xs py-1 block">
          ব্যাংক ফোকাস রাইটিং
        </Link>
      ),
    },
    {
      key: 'math',
      icon: <CalculatorOutlined className="text-blue-600 text-sm" />,
      label: (
        <Link href="/math" className="font-semibold text-gray-700 text-xs py-1 block">
          গণিত প্রস্তুতি
        </Link>
      ),
    },
    {
      key: 'translation',
      icon: <ReadOutlined className="text-indigo-600 text-sm" />,
      label: (
        <Link href="/translation" className="font-semibold text-gray-700 text-xs py-1 block">
          অনুবাদ স্টুডিও
        </Link>
      ),
    },
    {
      key: 'hf-333',
      icon: <FireOutlined className="text-amber-500 text-sm" />,
      label: (
        <Link href="/high-frequency-333" className="font-semibold text-gray-700 text-xs py-1 block">
          ব্যারন ৩৩৩ ভোকাবুলারি
        </Link>
      ),
    },
    {
      key: 'words',
      icon: <BookOutlined className="text-teal-600 text-sm" />,
      label: (
        <Link href="/words" className="font-semibold text-gray-700 text-xs py-1 block">
          ভোকাবুলারি হাব
        </Link>
      ),
    },
    {
      key: 'english-idioms',
      icon: <BookOutlined className="text-blue-600 text-sm" />,
      label: (
        <Link href="/english/idioms" className="font-semibold text-gray-700 text-xs py-1 block">
          ইংরেজি ইডিয়াম ও ফ্রেজ
        </Link>
      ),
    },
    {
      key: 'baghdhara',
      icon: <BookOutlined className="text-rose-500 text-sm" />,
      label: (
        <Link href="/bangla/baghdhara" className="font-semibold text-gray-700 text-xs py-1 block">
          বাংলা বাগধারা
        </Link>
      ),
    },
    {
      key: 'bangla-shobdo',
      icon: <GlobalOutlined className="text-cyan-600 text-sm" />,
      label: (
        <Link href="/bangla/shobdo" className="font-semibold text-gray-700 text-xs py-1 block">
          বাংলা শব্দ উৎস
        </Link>
      ),
    },
  ];

  // Dropdown Items: Practice & Tests
  const practiceDropdownItems: MenuProps['items'] = [
    {
      key: 'battle',
      icon: <ThunderboltFilled className="text-amber-500 text-sm" />,
      label: (
        <Link href="/battle" className="font-semibold text-gray-700 text-xs py-1 block">
          ১‑vs‑১ কুইজ ডুয়েল
        </Link>
      ),
    },
    {
      key: 'quiz',
      icon: <TrophyOutlined className="text-emerald-600 text-sm" />,
      label: (
        <Link href="/quiz" className="font-semibold text-gray-700 text-xs py-1 block">
          মডেল টেস্ট
        </Link>
      ),
    },
    {
      key: 'flashcards',
      icon: <FireOutlined className="text-purple-600 text-sm" />,
      label: (
        <Link href="/flashcards" className="font-semibold text-gray-700 text-xs py-1 block">
          রিভিশন ফ্ল্যাশকার্ড
        </Link>
      ),
    },
    {
      key: 'cloze',
      icon: <ReadOutlined className="text-cyan-600 text-sm" />,
      label: (
        <Link href="/cloze" className="font-semibold text-gray-700 text-xs py-1 block">
          ক্লজ টেস্ট
        </Link>
      ),
    },
    {
      key: 'spelling',
      icon: <CheckCircleFilled className="text-emerald-500 text-sm" />,
      label: (
        <Link href="/spelling" className="font-semibold text-gray-700 text-xs py-1 block">
          বানান শুদ্ধিকরণ
        </Link>
      ),
    },
    {
      key: 'question-bank',
      icon: <BookOutlined className="text-blue-500 text-sm" />,
      label: (
        <Link href="/question-bank" className="font-semibold text-gray-700 text-xs py-1 block">
          স্মার্ট প্রশ্নব্যাংক
        </Link>
      ),
    },
  ];

  // Dropdown Items: Resources & Tools
  const resourceDropdownItems: MenuProps['items'] = [
    {
      key: 'pomodoro',
      icon: <ClockCircleOutlined className="text-rose-500 text-sm" />,
      label: (
        <Link href="/pomodoro" className="font-semibold text-gray-700 text-xs py-1 block">
          পোমোডোরো ফোকাস টাইমার
        </Link>
      ),
    },
    {
      key: 'planner',
      icon: <CalendarOutlined className="text-emerald-600 text-sm" />,
      label: (
        <Link href="/planner" className="font-semibold text-gray-700 text-xs py-1 block">
          দৈনিক পড়ার রুটিন ও প্ল্যানার
        </Link>
      ),
    },
    {
      key: 'notebook',
      icon: <BookOutlined className="text-amber-600 text-sm" />,
      label: (
        <Link href="/notebook" className="font-semibold text-gray-700 text-xs py-1 block">
          প্রস্তুতি নোটবুক
        </Link>
      ),
    },
    {
      key: 'news-archive',
      icon: <ReadOutlined className="text-blue-600 text-sm" />,
      label: (
        <Link href="/news-archive" className="font-semibold text-gray-700 text-xs py-1 block">
          পত্রিকা আর্কাইভ
        </Link>
      ),
    },
    {
      key: 'feed',
      icon: <ThunderboltFilled className="text-violet-600 text-sm" />,
      label: (
        <Link href="/feed" className="font-semibold text-gray-700 text-xs py-1 block">
          প্রস্তুতি ফিড
        </Link>
      ),
    },
    {
      key: 'mistakes',
      icon: <ReadOutlined className="text-rose-500 text-sm" />,
      label: (
        <Link href="/mistakes" className="font-semibold text-gray-700 text-xs py-1 block">
          ভুলের খাতা (Mistake Vault)
        </Link>
      ),
    },
    {
      key: 'panic-sheet',
      icon: <ThunderboltOutlined className="text-orange-500 text-sm" />,
      label: (
        <Link href="/panic-sheet" className="font-semibold text-gray-700 text-xs py-1 block">
          পরীক্ষার রিভিশন শিট
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: 'about',
      icon: <BookOutlined className="text-gray-500 text-sm" />,
      label: (
        <Link href="/about" className="font-semibold text-gray-700 text-xs py-1 block">
          আমাদের সম্পর্কে
        </Link>
      ),
    },
  ];

  // Drawer Sections for Mobile
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
        { key: 'focus-writing', label: 'ব্যাংক ফোকাস রাইটিং', href: '/focus-writing', icon: <BankOutlined /> },
        { key: 'math', label: 'গণিত প্রস্তুতি', href: '/math', icon: <CalculatorOutlined /> },
        { key: 'translation', label: 'অনুবাদ স্টুডিও', href: '/translation', icon: <ReadOutlined /> },
        { key: 'hf-333', label: 'ব্যারন ৩৩৩ ভোকাবুলারি', href: '/high-frequency-333', icon: <FireOutlined /> },
        { key: 'words', label: 'ভোকাবুলারি হাব', href: '/words', icon: <BookOutlined /> },
        { key: 'bangla-shobdo', label: 'বাংলা শব্দ উৎস', href: '/bangla/shobdo', icon: <GlobalOutlined /> },
        { key: 'baghdhara', label: 'বাংলা বাগধারা', href: '/bangla/baghdhara', icon: <BookOutlined /> },
      ],
    },
    {
      title: 'অনুশীলন ও টেস্ট',
      links: [
        { key: 'battle', label: '১‑vs‑১ কুইজ ডুয়েল', href: '/battle', icon: <ThunderboltFilled /> },
        { key: 'quiz', label: 'মডেল টেস্ট', href: '/quiz', icon: <TrophyOutlined /> },
        { key: 'flashcards', label: 'রিভিশন ফ্ল্যাশকার্ড', href: '/flashcards', icon: <FireOutlined /> },
        { key: 'cloze', label: 'ক্লজ টেস্ট', href: '/cloze', icon: <ReadOutlined /> },
        { key: 'spelling', label: 'বানান শুদ্ধিকরণ', href: '/spelling', icon: <CheckCircleFilled /> },
        { key: 'question-bank', label: 'স্মার্ট প্রশ্নব্যাংক', href: '/question-bank', icon: <BookOutlined /> },
      ],
    },
    {
      title: 'স্টাডি টুলস ও রিসোর্স',
      links: [
        { key: 'pomodoro', label: 'পোমোডোরো ফোকাস টাইমার', href: '/pomodoro', icon: <ClockCircleOutlined className="text-rose-500" /> },
        { key: 'planner', label: 'স্টাডি প্ল্যানার', href: '/planner', icon: <CalendarOutlined /> },
        { key: 'notebook', label: 'প্রস্তুতি নোটবুক', href: '/notebook', icon: <BookOutlined /> },
        { key: 'news-archive', label: 'পত্রিকা আর্কাইভ', href: '/news-archive', icon: <ReadOutlined /> },
        { key: 'feed', label: 'প্রস্তুতি ফিড', href: '/feed', icon: <ThunderboltFilled /> },
        { key: 'mistakes', label: 'ভুলের খাতা', href: '/mistakes', icon: <ReadOutlined /> },
        { key: 'panic-sheet', label: 'পরীক্ষার রিভিশন শিট', href: '/panic-sheet', icon: <ThunderboltOutlined /> },
        { key: 'about', label: 'আমাদের সম্পর্কে', href: '/about', icon: <BookOutlined /> },
      ],
    },
  ];

  // Active state detectors for desktop navbar
  const isDashboardActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isCapsuleActive = pathname === '/daily-capsule' || pathname.startsWith('/daily-capsule/');
  const isPrepActive = ['/focus-writing', '/math', '/translation', '/high-frequency-333', '/words', '/bangla'].some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isPracticeActive = ['/battle', '/quiz', '/flashcards', '/cloze', '/spelling', '/question-bank'].some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isResourcesActive = ['/pomodoro', '/planner', '/notebook', '/news-archive', '/feed', '/mistakes', '/panic-sheet', '/about'].some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="py-1 px-1">
          <p className="font-bold text-gray-900 m-0 text-sm">{session?.user?.name || 'শিক্ষার্থী'}</p>
          <p className="text-xs text-gray-500 truncate m-0 font-mono">{session?.user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: <Link href="/profile">আমার প্রোফাইল (My Profile)</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'dashboard',
      label: <Link href="/dashboard">স্টুডেন্ট ড্যাশবোর্ড (Dashboard)</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: 'my-words',
      label: <Link href="/my-words">আমার সংরক্ষিত শব্দ</Link>,
      icon: <BookOutlined />,
    },
    {
      key: 'mistakes',
      label: <Link href="/mistakes">ভুলের খাতা (Mistake Vault)</Link>,
      icon: <ReadOutlined />,
    },
    {
      key: 'panic-sheet',
      label: <Link href="/panic-sheet">পরীক্ষার রিভিশন শিট</Link>,
      icon: <ThunderboltFilled />,
    },
    {
      key: 'add-word',
      label: <Link href="/add">নতুন শব্দ যোগ করুন</Link>,
      icon: <PlusOutlined />,
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'লগআউট',
      onClick: () => signOut(),
    },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent border-transparent shadow-none'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs'
        }`}
      >
        {/* Top Transparent Exam News Ticker */}
        <NavbarTicker isTransparent={isTransparent} />

        {/* Desktop Navbar Row */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 h-16 items-center justify-between">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={
                <MenuOutlined
                  className={`text-lg transition-colors ${
                    isTransparent ? 'text-white' : 'text-gray-700'
                  }`}
                />
              }
              onClick={toggleDrawer}
              className={`md:hidden flex items-center justify-center p-2 rounded-xl ${
                isTransparent ? 'hover:bg-white/10' : ''
              }`}
            />

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 relative flex items-center justify-center rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform bg-white/10 backdrop-blur-xs p-1">
                <Image
                  src="/iconflat.png"
                  alt="OwlPrep Logo"
                  width={36}
                  height={36}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-black text-lg tracking-tight leading-none transition-colors ${
                    isTransparent
                      ? 'text-white group-hover:text-emerald-300'
                      : 'text-gray-900 group-hover:text-emerald-700'
                  }`}
                >
                  Owl<span className="text-emerald-500">Prep</span>
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${
                    isTransparent ? 'text-emerald-200/80' : 'text-gray-400'
                  }`}
                >
                  by {siteConfig.parentBrand}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (Clean & Spacious) */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDashboardActive
                  ? isTransparent
                    ? 'bg-white/20 text-white font-black shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 font-black shadow-xs'
                  : isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
              }`}
            >
              <HomeOutlined />
              <span>ড্যাশবোর্ড</span>
            </Link>

            {/* Preparation Modules Dropdown */}
            <Dropdown menu={{ items: prepDropdownItems }} placement="bottom" trigger={['hover', 'click']}>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${
                  isPrepActive
                    ? isTransparent
                      ? 'bg-white/20 text-white font-black shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 font-black shadow-xs'
                    : isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                }`}
              >
                <BookOutlined />
                <span>প্রস্তুতি</span>
                <DownOutlined className="text-[9px] opacity-60" />
              </button>
            </Dropdown>

            {/* Daily Capsule */}
            <Link
              href="/daily-capsule"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCapsuleActive
                  ? isTransparent
                    ? 'bg-white/20 text-white font-black shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 font-black shadow-xs'
                  : isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
              }`}
            >
              <ThunderboltOutlined className={isTransparent ? 'text-amber-300' : 'text-amber-500'} />
              <span>দৈনিক ক্যাপসুল</span>
            </Link>

            {/* Practice & Tests Dropdown */}
            <Dropdown menu={{ items: practiceDropdownItems }} placement="bottom" trigger={['hover', 'click']}>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${
                  isPracticeActive
                    ? isTransparent
                      ? 'bg-white/20 text-white font-black shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 font-black shadow-xs'
                    : isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                }`}
              >
                <TrophyOutlined />
                <span>অনুশীলন</span>
                <DownOutlined className="text-[9px] opacity-60" />
              </button>
            </Dropdown>

            {/* Tools & Resources Dropdown */}
            <Dropdown menu={{ items: resourceDropdownItems }} placement="bottom" trigger={['hover', 'click']}>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${
                  isResourcesActive
                    ? isTransparent
                      ? 'bg-white/20 text-white font-black shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 font-black shadow-xs'
                    : isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                }`}
              >
                <AppstoreOutlined />
                <span>রিসোর্স</span>
                <DownOutlined className="text-[9px] opacity-60" />
              </button>
            </Dropdown>
          </div>

          {/* Right: Quick Add + Streak + Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Add Word Button (visible on lg+) */}
            <Link href="/add" className="hidden lg:inline-block">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className={`${
                  isTransparent
                    ? 'bg-emerald-500/90 hover:!bg-emerald-400 text-white border-0'
                    : 'bg-emerald-600 hover:!bg-emerald-700'
                } rounded-xl font-bold shadow-xs text-xs h-9`}
              >
                শব্দ যোগ
              </Button>
            </Link>

            {/* Daily Streak Badge */}
            {streak !== null && streak > 0 && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border shadow-xs ${
                  isTransparent
                    ? 'bg-white/10 text-amber-300 border-white/20'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <FireOutlined className="text-amber-400 text-xs animate-pulse" />
                <span>{streak} দিন</span>
              </div>
            )}

            {/* Auth Dropdown or Login Button */}
            {session?.user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="cursor-pointer p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500 transition">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} className="bg-emerald-600" size={32} />
                  )}
                </div>
              </Dropdown>
            ) : (
              <Button
                type="default"
                icon={<UserOutlined />}
                onClick={() => signIn('google')}
                className={`rounded-xl font-bold text-xs h-9 ${
                  isTransparent
                    ? 'bg-white/15 text-white hover:!bg-white/25 border-white/30 hover:!text-white'
                    : 'border-gray-300 hover:!border-emerald-500 hover:!text-emerald-600 text-gray-700'
                }`}
              >
                লগইন
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Drawer for Mobile */}
      <Drawer
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative flex items-center justify-center rounded-lg overflow-hidden bg-slate-100 p-0.5">
              <Image
                src="/iconflat.png"
                alt="OwlPrep Logo"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-lg font-black text-gray-900">{siteConfig.name}</span>
          </div>
        }
        placement="left"
        onClose={toggleDrawer}
        open={visible}
        width={300}
        closeIcon={<CloseOutlined className="text-gray-700" />}
      >
        <div className="flex flex-col h-full justify-between pb-4">
          {/* Categorized Drawer Navigation */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-4 mt-1">
            {drawerSections.map((sec) => (
              <div key={sec.title}>
                <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
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
                        onClick={toggleDrawer}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Auth Section in Drawer Footer */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            {session?.user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-2">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full"
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} className="bg-emerald-600" />
                  )}
                  <div className="truncate">
                    <p className="font-bold text-xs text-gray-900 m-0 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[11px] text-gray-500 m-0 truncate font-mono">{session.user.email}</p>
                  </div>
                </div>
                <Link href="/profile" onClick={toggleDrawer} className="block">
                  <Button
                    block
                    icon={<UserOutlined />}
                    className="rounded-xl font-bold text-xs"
                  >
                    আমার প্রোফাইল
                  </Button>
                </Link>
                <Button
                  danger
                  block
                  icon={<LogoutOutlined />}
                  onClick={() => signOut()}
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
                onClick={() => signIn('google')}
                className="bg-emerald-600 rounded-xl font-bold h-10 text-xs"
              >
                গুগল দিয়ে লগইন
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
