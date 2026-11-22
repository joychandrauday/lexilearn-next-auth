'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, InputNumber } from 'antd';
import { FireFilled, RocketOutlined, TrophyOutlined, CheckCircleFilled, EditOutlined } from '@ant-design/icons';

interface IdiomsBatchStarterCardProps {
  totalWords: number;
  masteredCount: number;
  remainingCount: number;
  onStart: (batchSize: number) => void;
  loading: boolean;
}

const PRESET_BATCHES = [5, 7, 10, 15];

export default function IdiomsBatchStarterCard({
  totalWords,
  masteredCount,
  remainingCount,
  onStart,
  loading,
}: IdiomsBatchStarterCardProps) {
  const [selectedBatch, setSelectedBatch] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('prepowl_idioms_batch_size');
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
      localStorage.setItem('prepowl_idioms_batch_size', String(size));
    }
  };

  const handleApplyCustom = (val: number | null) => {
    if (val && val > 0) {
      const clamped = Math.min(Math.max(val, 1), Math.max(remainingCount, 1));
      setCustomValue(clamped);
      setSelectedBatch(clamped);
      if (typeof window !== 'undefined') {
        localStorage.setItem('prepowl_idioms_batch_size', String(clamped));
      }
    }
  };

  const progressPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
  const effectiveBatch = isCustomMode ? customValue : selectedBatch;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center bg-white">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-4 text-3xl shadow-sm">
          <FireFilled />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          English Idioms & Phrases
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          বিসিএস ও ব্যাংক নিয়োগ পরীক্ষায় সর্বাধিক কমন আসা ১১০টি ইডিয়াম ও ফ্রেজ। স্পেসড ব্যাচ পদ্ধতিতে একবারে আয়ত্ত করুন।
        </p>

        {/* Progress Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-100 rounded-2xl p-5 my-6">
          <div className="flex justify-between items-center text-sm font-bold text-gray-700 mb-2">
            <span className="flex items-center gap-1.5">
              <TrophyOutlined className="text-amber-500" /> কোর্স অগ্রগতি
            </span>
            <span className="text-blue-700 font-extrabold">{masteredCount} / {totalWords} শব্দ ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <span>মাস্টার করা: <strong className="text-blue-600">{masteredCount}</strong></span>
            <span>অবশিষ্ট: <strong className="text-gray-700">{remainingCount}</strong></span>
          </div>
        </div>

        {/* Batch Size Preference Selector */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              এক ব্যাচে অনুশীলনের পরিমাণ
            </span>
            <span className="text-xs font-black text-blue-600">
              {effectiveBatch}টি করে ইডিয়াম
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_BATCHES.map((size) => {
              const isSelected = !isCustomMode && selectedBatch === size;
              return (
                <button
                  key={size}
                  onClick={() => handleSelectPreset(size)}
                  className={`py-3 px-2 rounded-2xl font-black text-sm transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-[1.02]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200/80'
                  }`}
                >
                  <span className="text-base">{size}</span>
                  <span className="text-[10px] block opacity-80 font-bold">টি/ব্যাচ</span>
                </button>
              );
            })}
          </div>

          {/* Custom Size Toggle/Input */}
          <div className="flex items-center justify-end gap-2 text-xs">
            {isCustomMode ? (
              <div className="flex items-center gap-2 bg-blue-50 p-1.5 px-3 rounded-xl border border-blue-200">
                <span className="text-gray-600 font-medium">কাস্টম সংখ্যা:</span>
                <InputNumber
                  min={1}
                  max={Math.max(remainingCount, 1)}
                  value={customValue}
                  onChange={handleApplyCustom}
                  size="small"
                  className="w-16 rounded-lg font-bold"
                />
                <Button
                  size="small"
                  type="text"
                  onClick={() => handleSelectPreset(7)}
                  className="text-gray-400 hover:text-gray-600 text-xs p-0 h-auto"
                >
                  রিসেট
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsCustomMode(true)}
                className="text-gray-400 hover:text-blue-600 font-bold transition flex items-center gap-1"
              >
                <EditOutlined /> অন্য সংখ্যা বেছে নিন
              </button>
            )}
          </div>
        </div>

        {/* Start Button */}
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={() => onStart(effectiveBatch)}
          icon={<RocketOutlined />}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-black text-base shadow-lg shadow-blue-200 border-0 flex items-center justify-center gap-2"
        >
          {loading ? 'ব্যাচ তৈরি হচ্ছে...' : `${effectiveBatch}টি ইডিয়ামের ব্যাচ শুরু করুন 🚀`}
        </Button>
      </Card>
    </div>
  );
}
