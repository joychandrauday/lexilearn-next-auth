'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeOutlined,
  ReadOutlined,
  ThunderboltOutlined,
  BookOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const navItems = [
  { label: 'হোম', href: '/', icon: HomeOutlined },
  { label: 'ভোকাবুলারি', href: '/words', icon: ReadOutlined },
  { label: 'ফ্ল্যাশ কার্ড', href: '/flashcards', icon: ThunderboltOutlined },
  { label: 'বাংলা', href: '/bangla', icon: BookOutlined },
  { label: 'কুইজ', href: '/quiz', icon: TrophyOutlined },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-black scale-105'
                  : 'text-gray-400 hover:text-gray-700 font-medium'
              }`}
            >
              <Icon className={`text-lg mb-0.5 ${isActive ? 'text-emerald-600' : ''}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
