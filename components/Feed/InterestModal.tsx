'use client';

import React, { useState } from 'react';
import { Modal, Button, Tag } from 'antd';
import {
  CompassOutlined,
  CheckCircleFilled,
  FireOutlined,
  ThunderboltOutlined,
  BookOutlined,
  StarFilled,
} from '@ant-design/icons';

interface InterestModalProps {
  open: boolean;
  onClose: () => void;
  selectedInterests: string[];
  onSave: (interests: string[]) => void;
}

const AVAILABLE_TOPICS = [
  { id: 'bcs', label: 'বিসিএস প্রিলিমিনারি (BCS)', category: 'exam' },
  { id: 'bank', label: 'বাংলাদেশ ব্যাংক ও সরকারি ব্যাংক (Bank)', category: 'exam' },
  { id: 'primary', label: 'প্রাইমারি শিক্ষক ও NTRCA', category: 'exam' },
  { id: 'grammar', label: 'গুরুত্বপূর্ণ গ্রামার ট্র্যাপ (Grammar)', category: 'skill' },
  { id: 'vocab', label: 'হাই-ফ্রিকোয়েন্সি শব্দভাণ্ডার (Vocab)', category: 'skill' },
  { id: 'preposition', label: 'এপ্রোপ্রিয়েট প্রিপজিশন (Preposition)', category: 'skill' },
  { id: 'editorial', label: 'ডেইলি স্টার ও জাতীয় সম্পাদকীয় (Editorial)', category: 'skill' },
  { id: 'spelling', label: 'বানান শুদ্ধিকরণ (Spelling)', category: 'skill' },
  { id: 'literature', label: 'ইংরেজি ও বাংলা সাহিত্য (Literature)', category: 'skill' },
];

export default function InterestModal({
  open,
  onClose,
  selectedInterests,
  onSave,
}: InterestModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedInterests);

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleApply = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-3xl overflow-hidden"
      width={500}
    >
      <div className="p-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CompassOutlined className="text-base" />
          </div>
          <h3 className="text-lg font-black text-gray-900 m-0">আপনার প্রস্তুতির আগ্রহ নির্বাচন করুন</h3>
        </div>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed font-medium">
          আপনার লক্ষ্য অনুযায়ী আমরা ফিডে সবচেয়ে প্রাসঙ্গিক বিসিএস/ব্যাংক প্রশ্ন, শব্দ ও ১ মিনিটের গ্রামার ট্রিকস আগে দেখাব।
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              লক্ষ্যভিত্তিক পরীক্ষা:
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOPICS.filter((t) => t.category === 'exam').map((topic) => {
                const isChecked = selected.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => toggleInterest(topic.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {isChecked && <CheckCircleFilled className="text-emerald-600" />}
                    <span>{topic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              গুরুত্বপূর্ণ বিষয় ও দক্ষতা:
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOPICS.filter((t) => t.category === 'skill').map((topic) => {
                const isChecked = selected.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => toggleInterest(topic.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {isChecked && <CheckCircleFilled className="text-emerald-600" />}
                    <span>{topic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button onClick={onClose} className="rounded-xl font-bold">
            বাতিল
          </Button>
          <Button
            type="primary"
            onClick={handleApply}
            className="bg-emerald-600 hover:!bg-emerald-500 rounded-xl font-bold px-5"
          >
            ফিড পারসোনালাইজ করুন ({selected.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
