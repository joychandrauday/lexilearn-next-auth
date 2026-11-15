'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BankOutlined,
  ReadOutlined,
  CrownOutlined,
  CheckCircleFilled,
  GlobalOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { MATH_STREAMS } from '../../lib/math/syllabus-config';

interface MathStreamSelectorProps {
  activeStream: 'bank' | 'bcs' | 'primary_ntrca';
  onSelectStream: (stream: 'bank' | 'bcs' | 'primary_ntrca') => void;
}

export default function MathStreamSelector({
  activeStream,
  onSelectStream,
}: MathStreamSelectorProps) {
  const streams = [
    {
      key: 'bank' as const,
      config: MATH_STREAMS.bank,
      icon: BankOutlined,
      gradient: 'from-amber-600/20 via-amber-500/10 to-transparent',
      activeBorder: 'border-amber-500 shadow-amber-500/20',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      key: 'bcs' as const,
      config: MATH_STREAMS.bcs,
      icon: ReadOutlined,
      gradient: 'from-emerald-600/20 via-emerald-500/10 to-transparent',
      activeBorder: 'border-emerald-500 shadow-emerald-500/20',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      key: 'primary_ntrca' as const,
      config: MATH_STREAMS.primary_ntrca,
      icon: CrownOutlined,
      gradient: 'from-blue-600/20 via-blue-500/10 to-transparent',
      activeBorder: 'border-blue-500 shadow-blue-500/20',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {streams.map(({ key, config, icon: Icon, gradient, activeBorder, badgeColor }) => {
          const isActive = activeStream === key;

          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onSelectStream(key)}
              className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
                isActive
                  ? `bg-gray-900/90 ${activeBorder} ring-2 ring-opacity-50 ring-current shadow-lg`
                  : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'
              }`}
            >
              {/* Subtle Ambient Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />

              {/* Header: Icon & Badge */}
              <div className="relative z-10 flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-center ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-gray-800/80 border-gray-700 text-gray-400'
                  }`}
                >
                  <Icon className="text-xl" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {config.language === 'en' ? 'English Medium' : 'বাংলা মাধ্যম'}
                  </span>
                  {isActive && <CheckCircleFilled className="text-amber-400 text-base" />}
                </div>
              </div>

              {/* Title & Bengali Subtitle */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-0.5 tracking-tight">
                  {config.titleBn}
                </h3>
                <p className="text-xs font-medium text-gray-400 mb-2">
                  {config.titleEn}
                </p>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {config.subtitleBn}
                </p>
              </div>

              {/* Micro-Badges */}
              <div className="relative z-10 mt-3 pt-3 border-t border-gray-800/80 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <GlobalOutlined className="text-gray-500" />
                  {config.examFormat.split('(')[0].trim()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CalculatorOutlined className="text-gray-500" />
                  ক্যালকুলেটর নিষিদ্ধ
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
