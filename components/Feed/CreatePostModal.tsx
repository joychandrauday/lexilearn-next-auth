'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, Select, Tag } from 'antd';
import {
  EditOutlined,
  TrophyOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  SendOutlined,
  BulbOutlined,
  FireOutlined,
  StarFilled,
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
  const [postType, setPostType] = useState<'user_progress' | 'vocab_card' | 'exam_mcq' | 'micro_lesson'>('user_progress');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'bcs' | 'bank' | 'primary' | 'general'>('bcs');

  // Experience / Progress fields
  const [experienceTopic, setExperienceTopic] = useState('বিসিএস প্রিলি পড়ার দৈনিক রুটিন ও রিভিশন পদ্ধতি');

  // Vocab fields
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [bangla, setBangla] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');

  // MCQ fields
  const [mcqQuestion, setMcqQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [mcqExplanation, setMcqExplanation] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let finalTitle = title.trim();
      let payload: any = {
        category,
        type: postType,
        author: {
          name: userName || 'BCS Aspirant',
          email: userEmail || 'user@lexilearn.com',
          role: 'user',
        },
      };

      if (postType === 'user_progress') {
        if (!finalTitle) finalTitle = experienceTopic || 'আমার বিসিএস প্রস্তুতি অভিজ্ঞতা ও স্ট্র্যাটেজি';
        if (!content.trim()) {
          toast.error('অনুগ্রহ করে আপনার অভিজ্ঞতা বা পরামর্শ লিখুন');
          setSubmitting(false);
          return;
        }
        payload.title = finalTitle;
        payload.content = content;
        payload.tags = [category, 'অভিজ্ঞতা', 'পরামর্শ', 'স্ট্র্যাটেজি'];
        payload.progressData = {
          badgeTitle: 'কমিউনিটি মেন্টর',
          streakDays: 7,
          wordsLearned: 50,
          accuracy: 92,
        };
      } else if (postType === 'vocab_card') {
        if (!word.trim() || !bangla.trim()) {
          toast.error('শব্দ এবং বাংলা অর্থ আবশ্যক');
          setSubmitting(false);
          return;
        }
        finalTitle = `${word.toUpperCase()} • ${bangla.trim()}`;
        payload.title = finalTitle;
        payload.content = `${meaning || ''}\n\nস্মৃতিসূত্র: ${mnemonic || ''}`;
        payload.tags = [category, 'vocab', 'gre', partOfSpeech];
        payload.vocabData = {
          word: word.trim(),
          meaning: meaning.trim(),
          bangla: bangla.trim(),
          mnemonic: mnemonic.trim(),
          partOfSpeech,
          examTags: [category.toUpperCase(), 'COMMUNITY'],
        };
      } else if (postType === 'exam_mcq') {
        if (!mcqQuestion.trim() || !correctAnswer.trim()) {
          toast.error('প্রশ্ন এবং সঠিক উত্তর আবশ্যক');
          setSubmitting(false);
          return;
        }
        finalTitle = mcqQuestion.trim();
        payload.title = finalTitle;
        payload.content = mcqExplanation.trim();
        payload.tags = [category, 'mcq', 'quiz'];
        payload.mcqData = {
          question: mcqQuestion.trim(),
          options: options.filter((o) => o.trim().length > 0),
          correctAnswer: correctAnswer.trim(),
          explanation: mcqExplanation.trim(),
          userVotes: {},
        };
      } else if (postType === 'micro_lesson') {
        if (!finalTitle || !content.trim()) {
          toast.error('শিরোনাম এবং নিয়মের ব্যাখ্যা আবশ্যক');
          setSubmitting(false);
          return;
        }
        payload.title = finalTitle;
        payload.content = content.trim();
        payload.tags = [category, 'grammar', 'rules'];
      }

      const res = await axios.post('/api/feed', payload);
      if (res.data?.success) {
        toast.success(res.data.message || 'পোস্ট সফলভাবে পাবলিশ হয়েছে! আপনার XP যোগ করা হয়েছে।');
        // Reset fields
        setTitle('');
        setContent('');
        setWord('');
        setBangla('');
        setMeaning('');
        setMnemonic('');
        setMcqQuestion('');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
        setMcqExplanation('');

        onPostCreated();
        onClose();
      }
    } catch (e: any) {
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
      className="rounded-3xl overflow-hidden font-sans"
      width={560}
    >
      <div className="p-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <EditOutlined className="text-base" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 m-0">কমিউনিটি ক্রিয়েটর স্টুডিও</h3>
              <p className="text-[11px] text-gray-500 m-0">শেয়ার করে সহপাঠীদের সাহায্য করুন এবং পয়েন্ট ও ব্যাজ অর্জন করুন</p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-900 font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <StarFilled className="text-amber-500" />
            <span>+৩০ থেকে +৫০ XP</span>
          </span>
        </div>

        {/* Post Type Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setPostType('user_progress')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex flex-col items-center gap-1 ${
              postType === 'user_progress'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrophyOutlined />
            <span>অভিজ্ঞতা (+40)</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('vocab_card')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex flex-col items-center gap-1 ${
              postType === 'vocab_card'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOutlined />
            <span>শব্দ ও ট্রিক (+50)</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('exam_mcq')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex flex-col items-center gap-1 ${
              postType === 'exam_mcq'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <QuestionCircleOutlined />
            <span>কুইজ প্রশ্ন (+35)</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('micro_lesson')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex flex-col items-center gap-1 ${
              postType === 'micro_lesson'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BulbOutlined />
            <span>গ্রামার রুল (+30)</span>
          </button>
        </div>

        {/* Category Target */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 shrink-0">পরীক্ষা ক্যাটাগরি:</span>
          <Select
            value={category}
            onChange={(val) => setCategory(val)}
            className="w-full text-xs"
            options={[
              { label: 'বিসিএস প্রিলিমিনারি ও রিটেন', value: 'bcs' },
              { label: 'বাংলাদেশ ব্যাংক ও সরকারি ব্যাংক', value: 'bank' },
              { label: 'প্রাইমারি শিক্ষক ও NTRCA', value: 'primary' },
              { label: 'সাধারণ প্রস্তুতি ও ক্যারিয়ার', value: 'general' },
            ]}
          />
        </div>

        {/* Dynamic Form per Post Type */}
        <div className="space-y-3">
          {/* 1. EXPERIENCE / STRATEGY */}
          {postType === 'user_progress' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">অভিজ্ঞতার বিষয় / শিরোনাম</label>
                <Input
                  placeholder="যেমন: ৩ মাস চাকরি করার পর যেভাবে বিসিএস প্রিলির সময় বের করেছি..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">আপনার অভিজ্ঞতা ও গুরুত্বপূর্ণ পরামর্শ</label>
                <Input.TextArea
                  rows={4}
                  placeholder="আপনার দৈনন্দিন রুটিন, বই নির্বাচন বা পরীক্ষার হলের টাইম ম্যানেজমেন্টের গল্প লিখুন যা সহপাঠীদের অনুপ্রাণিত করবে..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </>
          )}

          {/* 2. VOCAB CARD */}
          {postType === 'vocab_card' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ইংরেজি শব্দ (Word)</label>
                  <Input
                    placeholder="e.g. Ubiquitous"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">প্রমিত বাংলা অর্থ</label>
                  <Input
                    placeholder="যেমন: সর্বব্যাপী, সর্বত্র বিরাজমান"
                    value={bangla}
                    onChange={(e) => setBangla(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">ইংরেজি সংজ্ঞা বা ব্যবহার</label>
                <Input
                  placeholder="Present, appearing, or found everywhere."
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-800 block mb-1">দেশি নেমোনিক / স্মৃতিসূত্র (Mnemonic)</label>
                <Input.TextArea
                  rows={2}
                  placeholder="সহজে মনে রাখার দেশি ছন্দ বা ট্রিক (যেমন: Ubi মানে কোথায়, quitous মানে সর্বত্র...)"
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </>
          )}

          {/* 3. EXAM MCQ */}
          {postType === 'exam_mcq' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">বিসিএস / ব্যাংক পরীক্ষার প্রশ্ন</label>
                <Input
                  placeholder="যেমন: কোনটি শুদ্ধ বানান? অথবা Which one is the synonym of 'Candid'?"
                  value={mcqQuestion}
                  onChange={(e) => setMcqQuestion(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {options.map((opt, idx) => (
                  <Input
                    key={idx}
                    addonBefore={String.fromCharCode(65 + idx)}
                    placeholder={`অপশন ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[idx] = e.target.value;
                      setOptions(copy);
                    }}
                    className="rounded-xl text-xs"
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-emerald-800 block mb-1">সঠিক উত্তর</label>
                  <Input
                    placeholder="হুবহু সঠিক অপশনটি লিখুন"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">সংক্ষিপ্ত ব্যাখ্যা</label>
                  <Input
                    placeholder="কেন এটি সঠিক তার যুক্তি..."
                    value={mcqExplanation}
                    onChange={(e) => setMcqExplanation(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* 4. MICRO LESSON / RULE */}
          {postType === 'micro_lesson' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">নিয়ম / বিষয়ের নাম</label>
                <Input
                  placeholder="যেমন: Causative Verbs ব্যবহারের শর্টকাট ট্রিক"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">নিয়মের সারসংক্ষেপ ও বিগত পরীক্ষার উদাহরণ</label>
                <Input.TextArea
                  rows={4}
                  placeholder="• Make/Have এর পর Base Form&#10;• Get এর পর to+V1&#10;উদাহরণ: She made him clean the room..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">পোস্ট করার সাথে সাথে আপনার প্রোফাইলে XP যোগ হবে</span>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-xl h-10 px-5 text-xs shadow-md border-0"
          >
            পাবলিশ করুন
          </Button>
        </div>
      </div>
    </Modal>
  );
}
