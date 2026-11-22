'use client';

import React, { useState } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { SoundOutlined, RetweetOutlined, FireFilled, BookOutlined } from '@ant-design/icons';
import { SerializedIdiom } from '../../actions/idioms.actions';

interface IdiomsFlipCardProps {
  idiom: SerializedIdiom;
  isFlipped: boolean;
  onFlipToggle: () => void;
}

export default function IdiomsFlipCard({ idiom, isFlipped, onFlipToggle }: IdiomsFlipCardProps) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(idiom.idiom);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const examText = idiom.examTags?.length
    ? idiom.examTags.join(' • ')
    : 'বিগত ব্যাংক ও বিসিএস পরীক্ষা';

  return (
    <div
      onClick={onFlipToggle}
      className="w-full max-w-xl mx-auto h-[430px] sm:h-[460px] cursor-pointer select-none [perspective:1000px]"
    >
      <div
        className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-gray-100 shadow-xl p-6 sm:p-8 flex flex-col justify-between [backface-visibility:hidden]">
          <div className="flex justify-between items-start">
            <Tag color="blue" className="font-semibold text-xs px-2.5 py-1 rounded-lg uppercase">
              Idiom & Phrase
            </Tag>

            {/* Exam Repetition Badge */}
            <div className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
              <FireFilled className="text-amber-500" />
              <span>{idiom.repetitionCount}x রিপিটেশন</span>
            </div>
          </div>

          {/* Idiom Center */}
          <div className="text-center my-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight capitalize mb-3">
              {idiom.idiom}
            </h2>

            <div className="flex justify-center items-center gap-2">
              <Button
                type="text"
                shape="circle"
                size="large"
                icon={<SoundOutlined className={speaking ? 'text-blue-600 scale-125' : 'text-gray-500'} />}
                onClick={handleSpeak}
                className="hover:bg-blue-50"
              />
              <span className="text-xs text-gray-400 font-mono">শুনুন</span>
            </div>

            {/* Exam occurrences tag pill */}
            <div className="mt-4 px-3 py-1.5 bg-gray-50 rounded-xl text-[12px] text-gray-600 max-w-md mx-auto line-clamp-1 border border-gray-100">
              📌 {examText}
            </div>
          </div>

          {/* Flip Hint */}
          <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
            <span>স্পেসবার অথবা কার্ডে ক্লিক করে উল্টান</span>
            <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
              অর্থ দেখুন <RetweetOutlined />
            </span>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 w-full h-full rounded-3xl bg-slate-900 text-white shadow-2xl p-6 sm:p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-2xl font-black tracking-tight text-blue-400 capitalize">
                {idiom.idiom}
              </h3>
              <Tag color="cyan" className="text-xs uppercase font-bold">
                Phrase
              </Tag>
            </div>

            {/* Bengali Meaning */}
            <div className="mb-4">
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-300 mb-1">
                বাংলা অর্থ ও ভাবার্থ
              </div>
              <p className="text-xl font-bold text-white leading-snug">
                {idiom.banglaMeaning}
              </p>
            </div>

            {/* English Meaning */}
            {idiom.meaning && (
              <div className="mb-4 text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                <strong className="text-slate-100">English Definition: </strong>{idiom.meaning}
              </div>
            )}

            {/* Mnemonic / Technique Box */}
            {idiom.mnemonic && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl">
                <div className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1 mb-1">
                  💡 মনে রাখার টেকনিক ও প্রয়োগ (Mnemonic)
                </div>
                <p className="text-xs text-amber-100 font-medium leading-relaxed">
                  {idiom.mnemonic}
                </p>
              </div>
            )}

            {/* Contextual Example Sentence */}
            {idiom.example && (
              <div className="mb-3 text-xs text-slate-300 italic border-l-2 border-blue-500 pl-3">
                &ldquo;{idiom.example}&rdquo;
              </div>
            )}

            {/* Exam Tags */}
            {idiom.examTags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400 font-bold mr-1">পরীক্ষা:</span>
                {idiom.examTags.map((s, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-md text-blue-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3 mt-2">
            <span>ক্লিক করে সামনে ফিরুন</span>
            <span className="text-blue-400 font-bold inline-flex items-center gap-1">
              <RetweetOutlined /> ফ্লিপ কার্ড
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
