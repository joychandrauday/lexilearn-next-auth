'use client';

import React, { useState } from 'react';
import { Button, Tag } from 'antd';
import {
  ShareAltOutlined,
  CopyOutlined,
  CheckOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { siteConfig } from '../lib/config/site';

interface Props {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  penalty: number;
  exam: string;
  userName?: string;
}

export default function ShareableScoreCard({
  score,
  total,
  correct,
  wrong,
  penalty,
  exam,
  userName = 'শিক্ষার্থী',
}: Props) {
  const [copied, setCopied] = useState(false);

  const getRankTitle = () => {
    if (score >= total * 0.8) return 'প্রিলি ক্র্যাকার';
    if (score >= total * 0.5) return 'লাইব্রেরি তপস্বী';
    return 'ফ্রেশার ফাইটার';
  };

  const copyFacebookText = () => {
    const text = `[${siteConfig.name}] বিসিএস ও ব্যাংক প্রস্তুতি টেস্ট সম্পন্ন করলাম!
━━━━━━━━━━━━━━━━━━━━
পরীক্ষার্থী: ${userName}
নেট স্কোর: ${score} / ${total}
সঠিক উত্তর: ${correct} টি
ভুল উত্তর: ${wrong} টি (নেগেটিভ মার্ক: -${penalty.toFixed(2)})
বর্তমান স্ট্যাটাস: ${getRankTitle()}
━━━━━━━━━━━━━━━━━━━━
বিনামূল্যে স্পেসড রিপিটেশন ও কুইজ দিন:
${siteConfig.links.url} #BCS #BankJobs #${siteConfig.name}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('ফেসবুকে পোস্ট করার জন্য টেক্সট কপি হয়েছে! গ্রুপে পেস্ট করুন');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/30 my-4 text-left relative overflow-hidden font-sans">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-black text-xs">
              🦉
            </span>
            <span className="font-black text-sm tracking-tight">{siteConfig.name}</span>
            <Tag color="gold" className="text-[10px] uppercase font-bold m-0 rounded">
              {exam.toUpperCase()}
            </Tag>
          </div>
          <span className="text-xs text-emerald-300 font-semibold">মডেল টেস্ট স্কোর কার্ড</span>
        </div>

        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <FireOutlined /> {getRankTitle()}
        </span>
      </div>

      <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-400 block font-medium">প্রাপ্ত নেট নম্বর:</span>
          <div className="text-4xl font-black text-emerald-400">
            {score} <span className="text-base font-normal text-gray-400">/ {total}</span>
          </div>
        </div>

        <div className="text-right text-xs space-y-1 font-semibold">
          <div className="text-emerald-300">সঠিক: {correct} টি</div>
          <div className="text-rose-400">ভুল: {wrong} টি (-{penalty.toFixed(2)})</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="primary"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={copyFacebookText}
          className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-11 flex-1 shadow-md"
        >
          {copied ? 'কপি সম্পন্ন হয়েছে ✓' : 'ফেসবুক গ্রুপে শেয়ার করার টেক্সট কপি'}
        </Button>
      </div>
    </div>
  );
}
