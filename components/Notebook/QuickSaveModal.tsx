'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, Select, Radio, Tag } from 'antd';
import {
  EditOutlined,
  BookOutlined,
  ReadOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  FireOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import axios from 'axios';

interface QuickSaveModalProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  onItemSaved?: () => void;
  initialData?: {
    title?: string;
    itemType?: 'word' | 'topic' | 'rule' | 'question' | 'quick_note';
    subject?: 'english' | 'bangla' | 'gk' | 'math' | 'science_it' | 'general';
    content?: string;
    secondaryText?: string;
    mnemonic?: string;
    tags?: string[];
  };
}

export default function QuickSaveModal({
  open,
  onClose,
  userEmail,
  onItemSaved,
  initialData,
}: QuickSaveModalProps) {
  const [itemType, setItemType] = useState<'word' | 'topic' | 'rule' | 'question' | 'quick_note'>(
    initialData?.itemType || 'topic'
  );
  const [subject, setSubject] = useState<'english' | 'bangla' | 'gk' | 'math' | 'science_it' | 'general'>(
    initialData?.subject || 'english'
  );
  const [title, setTitle] = useState(initialData?.title || '');
  const [secondaryText, setSecondaryText] = useState(initialData?.secondaryText || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [mnemonic, setMnemonic] = useState(initialData?.mnemonic || '');
  const [category, setCategory] = useState('সাধারণ প্রস্তুতি');
  const [targetExam, setTargetExam] = useState('BCS');
  const [priority, setPriority] = useState<'high' | 'medium' | 'normal'>('high');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || 'বিসিএস প্রিলি');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('অনুগ্রহ করে শিরোনাম বা শব্দটি লিখুন');
      return;
    }

    if (!userEmail) {
      toast.error('সংরক্ষণ করতে অনুগ্রহ করে সাইন ইন করুন');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await axios.post('/api/user/notebook', {
        userEmail,
        title,
        itemType,
        subject,
        category,
        content,
        secondaryText,
        mnemonic,
        tags,
        targetExam,
        priority,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'নোটবুকে সংরক্ষিত হয়েছে!');
        setTitle('');
        setContent('');
        setSecondaryText('');
        setMnemonic('');
        onItemSaved?.();
        onClose();
      }
    } catch {
      toast.error('সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={540}
      className="rounded-3xl overflow-hidden font-sans"
    >
      <div className="p-2">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <EditOutlined className="text-lg" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 m-0">প্রস্তুতি নোটবুকে সংরক্ষণ করুন</h3>
            <p className="text-[11px] text-gray-400 m-0">
              যেকোনো শব্দ, বিষয়, ব্যাকরণ নিয়ম বা ট্রিক এক জায়গায় গুছিয়ে রাখুন
            </p>
          </div>
        </div>

        {/* Item Type Selector */}
        <div className="grid grid-cols-4 gap-1.5 mb-3.5">
          <button
            type="button"
            onClick={() => setItemType('topic')}
            className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
              itemType === 'topic'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <ReadOutlined className="text-sm" />
            <span>বিষয়/অধ্যায়</span>
          </button>

          <button
            type="button"
            onClick={() => setItemType('word')}
            className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
              itemType === 'word'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <BookOutlined className="text-sm" />
            <span>শব্দভাণ্ডার</span>
          </button>

          <button
            type="button"
            onClick={() => setItemType('rule')}
            className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
              itemType === 'rule'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <BulbOutlined className="text-sm" />
            <span>নিয়ম বা ট্রিক</span>
          </button>

          <button
            type="button"
            onClick={() => setItemType('question')}
            className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
              itemType === 'question'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <QuestionCircleOutlined className="text-sm" />
            <span>কনফিউজিং প্রশ্ন</span>
          </button>
        </div>

        {/* Subject & Exam Pickers */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">বিষয় (Subject):</label>
            <Select
              value={subject}
              onChange={(val) => setSubject(val)}
              className="w-full text-xs"
              options={[
                { label: 'ইংরেজি (English)', value: 'english' },
                { label: 'বাংলা (Bangla)', value: 'bangla' },
                { label: 'সাধারণ জ্ঞান (GK)', value: 'gk' },
                { label: 'গণিত ও মানসিক দক্ষতা (Math)', value: 'math' },
                { label: 'বিজ্ঞান ও আইসিটি (Science/IT)', value: 'science_it' },
                { label: 'অন্যান্য (General)', value: 'general' },
              ]}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">টার্গেট পরীক্ষা:</label>
            <Select
              value={targetExam}
              onChange={(val) => setTargetExam(val)}
              className="w-full text-xs"
              options={[
                { label: 'বিসিএস প্রিলিমিনারি', value: 'BCS' },
                { label: 'ব্যাংক নিয়োগ (Bank)', value: 'Bank' },
                { label: 'প্রাইমারি শিক্ষক নিয়োগ', value: 'Primary' },
                { label: 'সকল সরকারি চাকরি', value: 'General' },
              ]}
            />
          </div>
        </div>

        {/* Title / Name */}
        <div className="mb-3">
          <label className="text-[11px] font-bold text-gray-600 block mb-1">
            {itemType === 'word'
              ? 'ইংরেজি শব্দ (Word):'
              : itemType === 'rule'
              ? 'নিয়ম বা সূত্রের নাম:'
              : itemType === 'question'
              ? 'প্রশ্নের বিষয় বা প্রশ্ন:'
              : 'টপিক বা শিরোনাম:'}
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              itemType === 'word'
                ? 'যেমন: Ubiquitous, Profligate'
                : itemType === 'rule'
                ? 'যেমন: Causative verbs এর গঠন'
                : 'যেমন: সংবিধানের অনুচ্ছেদ ৭ থেকে ৫০'
            }
            className="rounded-xl p-2 text-xs"
          />
        </div>

        {/* Secondary text if word */}
        {itemType === 'word' && (
          <div className="mb-3">
            <label className="text-[11px] font-bold text-gray-600 block mb-1">বাংলা অর্থ ও পার্টস অফ স্পিচ:</label>
            <Input
              value={secondaryText}
              onChange={(e) => setSecondaryText(e.target.value)}
              placeholder="যেমন: সর্বব্যাপী (adjective)"
              className="rounded-xl p-2 text-xs"
            />
          </div>
        )}

        {/* Detailed Explanation / Rule Notes */}
        <div className="mb-3">
          <label className="text-[11px] font-bold text-gray-600 block mb-1">
            বিস্তারিত ব্যাখ্যা বা নোট:
          </label>
          <Input.TextArea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="গুরুত্বপূর্ণ পয়েন্ট বা নিয়মগুলো বুলেট আকারে লিখুন..."
            className="rounded-xl p-2 text-xs"
          />
        </div>

        {/* Desi Mnemonic / Shortcut */}
        <div className="mb-3 bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200/80">
          <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5 mb-1">
            <BulbOutlined className="text-amber-600" />
            <span>মনে রাখার দেশি ট্রিক বা স্মৃতিসূত্র (Mnemonic - ঐচ্ছিক):</span>
          </label>
          <Input
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            placeholder="যেমন: রোগের কারণে হলে of, কাজের চাপে হলে from..."
            className="rounded-xl p-2 text-xs bg-white"
          />
        </div>

        {/* Priority & Tags */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">অগ্রাধিকার:</label>
            <Select
              value={priority}
              onChange={(val) => setPriority(val)}
              className="w-full text-xs"
              options={[
                { label: 'জরুরি রিভিশন (High)', value: 'high' },
                { label: 'মাঝারি (Medium)', value: 'medium' },
                { label: 'সাধারণ (Normal)', value: 'normal' },
              ]}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">ট্যাগসমূহ (কমা দিয়ে):</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="যেমন: 46th BCS, ট্রিকি"
              className="rounded-xl p-2 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button onClick={onClose} className="rounded-xl text-xs">
            বাতিল
          </Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl text-xs px-5 shadow-xs"
          >
            নোটবুকে সেভ করুন
          </Button>
        </div>
      </div>
    </Modal>
  );
}
