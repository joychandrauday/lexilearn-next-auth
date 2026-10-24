'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, Select, Radio } from 'antd';
import {
  EditOutlined,
  TrophyOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import axios from 'axios';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  onPostCreated: () => void;
}

export default function CreatePostModal({
  open,
  onClose,
  userEmail,
  userName,
  onPostCreated,
}: CreatePostModalProps) {
  const [postType, setPostType] = useState<'user_progress' | 'vocab_card' | 'micro_lesson'>('user_progress');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'bcs' | 'bank' | 'primary' | 'general'>('bcs');

  // Progress fields
  const [wordsLearned, setWordsLearned] = useState<number>(30);
  const [accuracy, setAccuracy] = useState<number>(90);
  const [streakDays, setStreakDays] = useState<number>(5);

  // Vocab fields
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [bangla, setBangla] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('অনুগ্রহ করে পোস্টের শিরোনাম দিন');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title,
        content,
        type: postType,
        category,
        tags: [category, postType === 'vocab_card' ? 'vocab' : 'progress'],
        author: {
          name: userName || 'BCS Aspirant',
          email: userEmail || 'user@lexilearn.com',
          role: 'user',
        },
      };

      if (postType === 'user_progress') {
        payload.progressData = {
          wordsLearned: Number(wordsLearned),
          accuracy: Number(accuracy),
          streakDays: Number(streakDays),
          badgeTitle: 'Active Achiever',
        };
      } else if (postType === 'vocab_card') {
        if (!word.trim() || !bangla.trim()) {
          toast.error('শব্দ এবং বাংলা অর্থ আবশ্যক');
          setSubmitting(false);
          return;
        }
        payload.vocabData = {
          word,
          meaning,
          bangla,
          mnemonic,
          examTags: [category.toUpperCase()],
        };
      }

      const res = await axios.post('/api/feed', payload);
      if (res.data.success) {
        toast.success('পোস্টটি সফলভাবে ফিডে পাবলিশ হয়েছে!');
        setTitle('');
        setContent('');
        setWord('');
        setBangla('');
        setMnemonic('');
        onPostCreated();
        onClose();
      }
    } catch {
      toast.error('পোস্ট পাবলিশ করতে সমস্যা হয়েছে');
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
      className="rounded-3xl overflow-hidden"
      width={520}
    >
      <div className="p-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <EditOutlined className="text-base" />
          </div>
          <h3 className="text-lg font-black text-gray-900 m-0">কমিউনিটি ফিডে পোস্ট করুন</h3>
        </div>

        {/* Post Type Selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setPostType('user_progress')}
            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
              postType === 'user_progress'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <TrophyOutlined className="text-base" />
            <span>অগ্রগতি শেয়ার</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('vocab_card')}
            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
              postType === 'vocab_card'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <BookOutlined className="text-base" />
            <span>ভোকাবুলারি কার্ড</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('micro_lesson')}
            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
              postType === 'micro_lesson'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <QuestionCircleOutlined className="text-base" />
            <span>প্রশ্ন বা টিপস</span>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">পরীক্ষার ক্যাটাগরি:</label>
            <Select
              value={category}
              onChange={(val) => setCategory(val)}
              className="w-full rounded-xl"
              options={[
                { label: 'বিসিএস (BCS)', value: 'bcs' },
                { label: 'ব্যাংক (Bank)', value: 'bank' },
                { label: 'প্রাইমারি শিক্ষক (Primary)', value: 'primary' },
                { label: 'সাধারণ প্রস্তুতি (General)', value: 'general' },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">পোস্ট শিরোনাম:</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                postType === 'user_progress'
                  ? 'উদা: আজকে একটানা ৪৫ মিনিট ফ্ল্যাশকার্ড রিভিশন সম্পন্ন!'
                  : postType === 'vocab_card'
                  ? 'উদা: হাই-ফ্রিকোয়েন্সি শব্দ ও মজার দেশি ট্রিক'
                  : 'উদা: Right form of verbs এর একটি সূক্ষ্ম ট্র্যাপ'
              }
              className="rounded-xl p-2.5 text-sm"
            />
          </div>

          {/* Progress Extra Fields */}
          {postType === 'user_progress' && (
            <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">আজকের শব্দ:</label>
                <Input
                  type="number"
                  value={wordsLearned}
                  onChange={(e) => setWordsLearned(Number(e.target.value))}
                  className="rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">একুরেসি %:</label>
                <Input
                  type="number"
                  value={accuracy}
                  onChange={(e) => setAccuracy(Number(e.target.value))}
                  className="rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">স্ট্রিক দিন:</label>
                <Input
                  type="number"
                  value={streakDays}
                  onChange={(e) => setStreakDays(Number(e.target.value))}
                  className="rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Vocab Extra Fields */}
          {postType === 'vocab_card' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="ইংরেজি শব্দ (e.g. Benevolent)"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="rounded-lg text-xs"
                />
                <Input
                  placeholder="বাংলা অর্থ (e.g. পরোপকারী)"
                  value={bangla}
                  onChange={(e) => setBangla(e.target.value)}
                  className="rounded-lg text-xs"
                />
              </div>
              <Input
                placeholder="ইংরেজি সংজ্ঞা (Meaning)"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                className="rounded-lg text-xs"
              />
              <Input
                placeholder="মজার স্মৃতিসূত্র বা দেশি ট্রিক (Desi Mnemonic)"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                className="rounded-lg text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">
              বিস্তারিত বার্তা / অনুভূতি:
            </label>
            <Input.TextArea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="আপনার প্রস্তুতি অভিজ্ঞতা বা ব্যাখ্যামূলক নোট লিখুন..."
              className="rounded-xl p-2.5 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button onClick={onClose} className="rounded-xl font-bold">
            বাতিল
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:!bg-emerald-500 rounded-xl font-bold px-6"
          >
            পাবলিশ করুন
          </Button>
        </div>
      </div>
    </Modal>
  );
}
