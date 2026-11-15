'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, InputNumber } from 'antd';
import { FireFilled, RocketOutlined, TrophyOutlined, CheckCircleFilled, EditOutlined } from '@ant-design/icons';

interface BatchStarterCardProps {
  totalWords: number;
  masteredCount: number;
  remainingCount: number;
  onStart: (batchSize: number) => void;
  loading: boolean;
}

const PRESET_BATCHES = [5, 7, 10, 15];

export default function BatchStarterCard({
  totalWords,
  masteredCount,
  remainingCount,
  onStart,
  loading,
}: BatchStarterCardProps) {
  const [selectedBatch, setSelectedBatch] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('prepowl_hf333_batch_size');
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return 7;
  });

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState<number>(selectedBatch);

  useEffect(() => {
    if (!PRESET_BATCHES.includes(selectedBatch)) {
      setIsCustomMode(true);
      setCustomValue(selectedBatch);
    }
  }, [selectedBatch]);

  const handleSelectPreset = (size: number) => {
    setSelectedBatch(size);
    setIsCustomMode(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prepowl_hf333_batch_size', String(size));
    }
  };

  const handleApplyCustom = (val: number | null) => {
    if (val && val > 0) {
      const clamped = Math.min(Math.max(val, 1), Math.max(remainingCount, 1));
      setCustomValue(clamped);
      setSelectedBatch(clamped);
      if (typeof window !== 'undefined') {
        localStorage.setItem('prepowl_hf333_batch_size', String(clamped));
      }
    }
  };

  const progressPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
  const effectiveBatch = isCustomMode ? customValue : selectedBatch;

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

        {/* Batch Size Preference Selector */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              আপনার পছন্দের ব্যাচ সাইজ নির্বাচন করুন
            </label>
            <span className="text-xs font-bold text-emerald-700">
              {effectiveBatch}টি শব্দ / ব্যাচ
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {PRESET_BATCHES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSelectPreset(size)}
                className={`flex-1 min-w-[70px] max-w-[100px] py-3 px-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                  !isCustomMode && selectedBatch === size
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm scale-105'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-black">{size}</div>
                <div className="text-[10px] font-normal text-gray-500">শব্দ/ব্যাচ</div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 min-w-[90px] max-w-[120px] py-3 px-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                isCustomMode
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm scale-105'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-black flex items-center justify-center gap-1">
                <EditOutlined className="text-sm" /> {isCustomMode ? customValue : 'কাস্টম'}
              </div>
              <div className="text-[10px] font-normal text-gray-500">ইচ্ছামত সংখ্যা</div>
            </button>
          </div>

          {/* Custom Batch Input Panel */}
          {isCustomMode && (
            <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center justify-center gap-3">
              <span className="text-xs font-bold text-emerald-950">কতটি শব্দ আয়ত্ত করতে চান?</span>
              <InputNumber
                min={1}
                max={Math.min(50, Math.max(remainingCount, 1))}
                value={customValue}
                onChange={handleApplyCustom}
                className="w-24 font-black text-center rounded-xl"
              />
              <span className="text-[11px] text-gray-500 font-medium">
                (১ থেকে {Math.min(50, remainingCount)} এর মধ্যে)
              </span>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            📌 এই ব্যাচটি সম্পন্ন না করা পর্যন্ত লক থাকবে এবং কোনো শব্দ মিস হবে না।
          </p>
        </div>

        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={() => onStart(effectiveBatch)}
          icon={<RocketOutlined />}
          className="w-full sm:w-auto px-8 h-13 rounded-2xl bg-emerald-600 hover:!bg-emerald-700 font-bold text-base shadow-lg shadow-emerald-200"
        >
          {effectiveBatch}টি শব্দের নতুন ব্যাচ শুরু করুন
        </Button>
      </Card>
    </div>
  );
}
