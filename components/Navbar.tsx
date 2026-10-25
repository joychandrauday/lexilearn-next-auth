'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Drawer, Button, Avatar, Dropdown, MenuProps } from 'antd';
import {
  MenuOutlined,
  CloseOutlined,
  FireOutlined,
  ThunderboltFilled,
  BookOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  ReadOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);

  const toggleDrawer = () => setVisible(!visible);

  // Fetch streak if user is logged in
  useEffect(() => {
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
  }, [session]);

  const navLinks = [
    { label: 'হোম', href: '/' },
    { label: 'দৈনিক ক্যাপসুল', href: '/daily-capsule' },
    { label: 'স্মার্ট প্রশ্নব্যাংক', href: '/question-bank' },
    { label: 'প্রস্তুতি ফিড', href: '/feed' },
    { label: 'প্রস্তুতি নোটবুক', href: '/notebook' },
    { label: 'ক্যাম্পেইন', href: '/campaign' },
    { label: 'ভোকাবুলারি', href: '/words' },
    { label: 'ক্লজ টেস্ট', href: '/cloze' },
    { label: 'বানান শুদ্ধিকরণ', href: '/spelling' },
    { label: 'রিভিশন কার্ড', href: '/flashcards' },
    { label: 'বাগধারা', href: '/bangla/baghdhara' },
    { label: 'মডেল টেস্ট', href: '/quiz' },
  ];

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
      key: 'daily-capsule',
      label: <Link href="/daily-capsule">দৈনিক এক্সাম ক্যাপসুল (Daily Capsule)</Link>,
      icon: <FireOutlined />,
    },
    {
      key: 'question-bank',
      label: <Link href="/question-bank">স্মার্ট প্রশ্নব্যাংক (Question Bank)</Link>,
      icon: <BookOutlined />,
    },
    {
      key: 'notebook',
      label: <Link href="/notebook">প্রস্তুতি নোটবুক (Saved Topics)</Link>,
      icon: <BookOutlined />,
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<MenuOutlined className="text-lg text-gray-700" />}
              onClick={toggleDrawer}
              className="md:hidden flex items-center justify-center p-2 rounded-xl"
            />

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-gray-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                  Lexi<span className="text-emerald-600">Learn</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  বিসিএস ও ব্যাংক প্রস্তুতি
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-black shadow-xs'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Add + Streak + Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Add Word Button */}
            <Link href="/add" className="hidden sm:inline-block">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold shadow-xs text-xs h-9"
              >
                শব্দ যোগ
              </Button>
            </Link>

            {/* Daily Streak Badge */}
            {streak !== null && streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-200 shadow-xs">
                <FireOutlined className="text-amber-500 text-xs animate-pulse" />
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
                className="rounded-xl font-bold text-xs h-9 border-gray-300 hover:!border-emerald-500 hover:!text-emerald-600"
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <span className="text-lg font-black text-gray-900">LexiLearn</span>
          </div>
        }
        placement="left"
        onClose={toggleDrawer}
        open={visible}
        width={280}
        closeIcon={<CloseOutlined className="text-gray-700" />}
      >
        <div className="flex flex-col h-full justify-between pb-6">
          <nav className="flex flex-col gap-1.5 mt-2">
            {navLinks.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleDrawer}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 pt-4">
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
