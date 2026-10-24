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
  ThunderboltOutlined,
  BookOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
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
    { label: 'ভোকাবুলারি', href: '/words' },
    { label: 'ফ্ল্যাশ কার্ড ⚡', href: '/flashcards' },
    { label: 'বাংলা হাব', href: '/bangla' },
    { label: 'বাগধারা', href: '/bangla/baghdhara' },
    { label: 'কুইজ', href: '/quiz' },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="py-1">
          <p className="font-bold text-gray-800 m-0">{session?.user?.name || 'Aspirant'}</p>
          <p className="text-xs text-gray-500 truncate m-0">{session?.user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'my-words',
      label: <Link href="/my-words">আমার সংরক্ষিত শব্দ</Link>,
    },
    {
      key: 'add-word',
      label: <Link href="/add">+ নতুন শব্দ যোগ</Link>,
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<MenuOutlined className="text-xl text-gray-700" />}
              onClick={toggleDrawer}
              className="md:hidden flex items-center justify-center p-2 rounded-xl"
            />

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-gray-800 tracking-tight leading-none group-hover:text-emerald-700 transition">
                  Lexi<span className="text-emerald-600">Learn</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  বিসিএস ও ব্যাংক প্রস্তুতি
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Add + Streak + Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Add Word Button */}
            <Link href="/add" className="hidden sm:inline-block">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold shadow-sm"
              >
                শব্দ যোগ
              </Button>
            </Link>

            {/* Daily Streak Badge */}
            {streak !== null && streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-xs font-black border border-amber-200 shadow-xs">
                <FireOutlined className="text-amber-500 text-sm animate-pulse" />
                <span>{streak} দিন</span>
              </div>
            )}

            {/* Auth Dropdown */}
            {session?.user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="cursor-pointer p-1 rounded-full hover:ring-2 hover:ring-emerald-500 transition">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} className="bg-emerald-600" />
                  )}
                </div>
              </Dropdown>
            ) : (
              <Button
                type="default"
                onClick={() => signIn('google')}
                className="rounded-xl font-bold border-gray-300 hover:!border-emerald-500 hover:!text-emerald-600"
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
            <span className="text-xl font-black text-gray-800">LexiLearn</span>
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
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
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
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} className="bg-emerald-600" />
                  )}
                  <div className="truncate">
                    <p className="font-bold text-sm text-gray-800 m-0 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 m-0 truncate">{session.user.email}</p>
                  </div>
                </div>
                <Button
                  danger
                  block
                  onClick={() => signOut()}
                  className="rounded-xl font-bold"
                >
                  সাইন আউট
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                block
                onClick={() => signIn('google')}
                className="bg-emerald-600 rounded-xl font-bold h-11"
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
