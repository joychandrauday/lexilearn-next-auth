'use client';

import React, { useState } from 'react';
import { Button, Card, Radio } from 'antd';
import { FireFilled, RocketOutlined, TrophyOutlined, CheckCircleFilled } from '@ant-design/icons';

interface BatchStarterCardProps {
  totalWords: number;
  masteredCount: number;
  remainingCount: number;
  onStart: (batchSize: number) => void;
  loading: boolean;
}

export default function BatchStarterCard({
  totalWords,
  masteredCount,
  remainingCount,
  onStart,
  loading,
}: BatchStarterCardProps) {
  const [selectedBatch, setSelectedBatch] = useState<number>(7);
  const progressPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center bg-white">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 mb-4 text-3xl shadow-sm">
          <FireFilled />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Barron's High Frequency 333
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          বিসিএস ও ব্যাংক নিয়োগ পরীক্ষায় সর্বাধিক কমন আসা ৩৩৩টি শব্দভাণ্ডার। স্পেসড ব্যাচ পদ্ধতিতে একবারে আয়ত্ত করুন।
        </p>

        {/* Progress Summary Card */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100 rounded-2xl p-5 my-6">
          <div className="flex justify-between items-center text-sm font-bold text-gray-700 mb-2">
            <span className="flex items-center gap-1.5">
              <TrophyOutlined className="text-amber-500" /> কোর্স অগ্রগতি
            </span>
            <span className="text-emerald-700 font-extrabold">{masteredCount} / {totalWords} শব্দ ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <span>মাস্টার করা: <strong className="text-emerald-600">{masteredCount}</strong></span>
            <span>অবশিষ্ট: <strong className="text-gray-700">{remainingCount}</strong></span>
          </div>
        </div>

        {/* Batch Size Selector */}
        <div className="my-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            নতুন সেশনের ব্যাচ সাইজ নির্বাচন করুন
          </label>
          <div className="flex justify-center gap-3">
            {[5, 7, 10].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedBatch(size)}
                className={`flex-1 max-w-[110px] py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                  selectedBatch === size
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm scale-105'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-black">{size}</div>
                <div className="text-[11px] font-normal text-gray-500">শব্দ/ব্যাচ</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            📌 এই ব্যাচটি সম্পন্ন না করা পর্যন্ত লক থাকবে এবং কোনো শব্দ মিস হবে না।
          </p>
        </div>

        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={() => onStart(selectedBatch)}
          icon={<RocketOutlined />}
          className="w-full sm:w-auto px-8 h-13 rounded-2xl bg-emerald-600 hover:!bg-emerald-700 font-bold text-base shadow-lg shadow-emerald-200"
        >
          {selectedBatch}টি শব্দের নতুন ব্যাচ শুরু করুন
        </Button>
      </Card>
    </div>
  );
}
