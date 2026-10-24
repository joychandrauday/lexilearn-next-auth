'use client';

import React, { useState } from 'react';
import {
  HeartFilled,
  HeartOutlined,
  BookFilled,
  BookOutlined,
  SoundOutlined,
  ShareAltOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ThunderboltFilled,
  BulbOutlined,
  TagOutlined,
  RobotOutlined,
  TrophyOutlined,
  UserOutlined,
  FireOutlined,
  CheckOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Tag, Progress } from 'antd';
import { toast } from 'sonner';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export interface IReelPost {
  _id: string;
  title: string;
  content: string;
  type: 'micro_lesson' | 'vocab_card' | 'exam_mcq' | 'user_progress' | 'daily_editorial';
  tags: string[];
  category: 'bcs' | 'bank' | 'primary' | 'ntrca' | 'general';
  difficulty?: 'easy' | 'medium' | 'hard';
  author: {
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user' | 'lexibot';
  };
  mcqData?: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    userVotes?: Record<string, number>;
  };
  vocabData?: {
    word: string;
    meaning: string;
    bangla: string;
    mnemonic?: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    examTags?: string[];
  };
  progressData?: {
    wordsLearned?: number;
    quizScore?: number;
    accuracy?: number;
    streakDays?: number;
    badgeTitle?: string;
  };
  likes: number;
  likedBy: string[];
  bookmarks: number;
  bookmarkedBy: string[];
  viewsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  createdAt: string;
}

interface ReelCardProps {
  post: IReelPost;
  userEmail: string;
  onTagClick?: (tag: string) => void;
  onAskAI?: (prompt: string) => void;
}

export default function ReelCard({ post, userEmail, onTagClick, onAskAI }: ReelCardProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [bookmarks, setBookmarks] = useState(post.bookmarks || 0);
  const [isBookmarked, setIsBookmarked] = useState(!!post.isBookmarked);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [savingDeck, setSavingDeck] = useState(false);
  const [savedToDeck, setSavedToDeck] = useState(false);
  const [savedToNotebook, setSavedToNotebook] = useState(false);
  const [savingNotebook, setSavingNotebook] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Save to Notebook handler
  const handleSaveToNotebook = async () => {
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('lexi_user_email') : null;
    const isAuthed = !!(session?.user?.email || savedEmail);

    if (!isAuthed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      toast.error('নোটবুকে সংরক্ষণ করতে অনুগ্রহ করে সাইন ইন বা রেজিস্টার করুন');
      return;
    }

    const effectiveEmail = session?.user?.email || savedEmail || userEmail;
    setSavingNotebook(true);

    try {
      const res = await axios.post('/api/user/notebook', {
        userEmail: effectiveEmail,
        title: post.vocabData?.word || post.title,
        itemType:
          post.type === 'vocab_card'
            ? 'word'
            : post.type === 'micro_lesson'
            ? 'rule'
            : post.type === 'exam_mcq'
            ? 'question'
            : 'topic',
        subject: post.category === 'bcs' || post.category === 'bank' ? 'english' : 'general',
        content: post.vocabData?.meaning || post.mcqData?.explanation || post.content || '',
        secondaryText: post.vocabData?.bangla || '',
        mnemonic: post.vocabData?.mnemonic || '',
        tags: post.tags || [post.category],
        targetExam: post.category?.toUpperCase() || 'BCS',
        priority: 'high',
      });

      if (res.data.success) {
        setSavedToNotebook(true);
        toast.success('প্রস্তুতি নোটবুকে যুক্ত হয়েছে!');
      }
    } catch {
      toast.error('নোটবুকে যুক্ত করতে সমস্যা হয়েছে');
    } finally {
      setSavingNotebook(false);
    }
  };

  // Like handler
  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikes((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await axios.post(`/api/feed/${post._id}/react`, {
        action: 'like',
        userEmail: session?.user?.email || userEmail,
      });
    } catch {
      // rollback
      setIsLiked(!nextState);
      setLikes((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  // Bookmark handler
  const handleBookmark = async () => {
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('lexi_user_email') : null;
    const isAuthed = !!(session?.user?.email || savedEmail);

    if (!isAuthed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      toast.error('বুকমার্ক করতে অনুগ্রহ করে সাইন ইন বা রেজিস্টার করুন');
      return;
    }

    const effectiveEmail = session?.user?.email || savedEmail || userEmail;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    setBookmarks((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await axios.post(`/api/feed/${post._id}/react`, {
        action: 'bookmark',
        userEmail: effectiveEmail,
      });
      toast.success(nextState ? 'কার্ডটি বুকমার্কে সংরক্ষিত হয়েছে' : 'বুকমার্ক সরানো হয়েছে');
    } catch {
      setIsBookmarked(!nextState);
      setBookmarks((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  // Save to Deck handler
  const handleSaveToDeck = async () => {
    if (!post.vocabData?.word) return;

    // Strict Auth Gate
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('lexi_user_email') : null;
    const isAuthed = !!(session?.user?.email || savedEmail);

    if (!isAuthed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      toast.error('শব্দটি ডেক-এ সংরক্ষণ করতে অনুগ্রহ করে সাইন ইন বা রেজিস্টার করুন');
      return;
    }

    const effectiveEmail = session?.user?.email || savedEmail || userEmail;

    setSavingDeck(true);
    try {
      const res = await axios.post(`/api/feed/${post._id}/react`, {
        action: 'save_to_deck',
        userEmail: effectiveEmail,
      });
      if (res.data.success) {
        setSavedToDeck(true);
        setIsBookmarked(true);
        toast.success(res.data.message || `"${post.vocabData.word}" আপনার রিভিশন ডেকে সেভ হয়েছে!`);
      }
    } catch {
      toast.error('ডেকে সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingDeck(false);
    }
  };

  // Text to speech
  const handlePronounce = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // MCQ selection
  const handleSelectOption = async (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    try {
      await axios.post(`/api/feed/${post._id}/react`, {
        action: 'vote',
        optionIndex: idx,
        userEmail: session?.user?.email || userEmail,
      });
    } catch {
      // silent
    }
  };

  // Share
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `#${post._id}`);
      toast.success('লিংক কপি করা হয়েছে!');
    }
  };

  // Calculate MCQ percentages
  const votes = post.mcqData?.userVotes || {};
  const totalVotes = Object.values(votes).reduce((a, b) => a + (Number(b) || 0), 0);

  const getVotePercent = (idx: number) => {
    if (totalVotes === 0) return 25;
    const count = Number((votes as any)[String(idx)]) || 0;
    return Math.round((count / totalVotes) * 100);
  };

  return (
    <div
      id={post._id}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-6 relative"
    >
      {/* Top Banner Tag for Pinned / Editorial */}
      {post.isPinned && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black px-4 py-1 flex items-center gap-1.5 uppercase tracking-wider">
          <ThunderboltFilled />
          <span>আজকের স্পেশাল পিন্ড ক্যাপসুল</span>
        </div>
      )}

      {post.type === 'daily_editorial' && !post.isPinned && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-800 text-white text-[11px] font-bold px-4 py-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <BulbOutlined className="text-amber-300" /> জাতীয় সম্পাদকীয় ভোকাবুলারি ক্যাপসুল
          </span>
          <span className="text-[10px] text-indigo-200">Daily Spotlight</span>
        </div>
      )}

      {/* Capsule Header */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
              post.author.role === 'lexibot'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                : post.author.role === 'admin'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                : 'bg-gradient-to-br from-slate-600 to-slate-800'
            }`}
          >
            {post.author.role === 'lexibot' ? (
              <RobotOutlined className="text-lg" />
            ) : post.author.role === 'admin' ? (
              <ThunderboltFilled className="text-lg" />
            ) : (
              <UserOutlined className="text-base" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-sm text-gray-900 m-0">{post.author.name}</h4>
              {post.author.role === 'lexibot' && (
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                  AI Mentor
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {post.category?.toUpperCase()} প্রস্তুতি • {new Date(post.createdAt).toLocaleDateString('bn-BD')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Tag color="cyan" className="font-bold text-[11px] rounded-lg m-0 border-0">
            {post.type === 'vocab_card'
              ? 'ভোকাব কার্ড'
              : post.type === 'exam_mcq'
              ? 'MCQ চ্যালেঞ্জ'
              : post.type === 'micro_lesson'
              ? '১ মিনিটের রুল'
              : post.type === 'user_progress'
              ? 'অগ্রগতি'
              : 'সম্পাদকীয়'}
          </Tag>
        </div>
      </div>

      {/* Capsule Body */}
      <div className="px-5 py-2">
        <h3 className="font-black text-lg text-gray-900 mb-2 leading-snug">{post.title}</h3>

        {/* 1. VOCABULARY CARD TYPE */}
        {post.vocabData && (
          <div className="bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-5 rounded-2xl border border-emerald-100/60 my-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight block">
                  {post.vocabData.word}
                </span>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  {post.vocabData.partOfSpeech || 'word'}
                </span>
              </div>
              <Button
                shape="circle"
                icon={<SoundOutlined />}
                loading={speaking}
                onClick={() => handlePronounce(post.vocabData?.word || '')}
                className="bg-emerald-600 hover:!bg-emerald-500 !text-white border-0 shadow-sm"
              />
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900 text-base">বাংলা অর্থ:</span>
                <span className="font-black text-emerald-800 text-lg">{post.vocabData.bangla}</span>
              </div>

              {post.vocabData.meaning && (
                <div>
                  <span className="font-bold text-gray-500 text-xs block">ইংরেজি অর্থ:</span>
                  <p className="font-medium text-gray-800 m-0 text-xs md:text-sm">
                    {post.vocabData.meaning}
                  </p>
                </div>
              )}

              {post.vocabData.mnemonic && (
                <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl mt-3 flex items-start gap-2">
                  <BulbOutlined className="text-amber-600 text-base mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 text-xs block">দেশি স্মৃতিসূত্র:</span>
                    <p className="text-xs text-amber-900 font-medium m-0 leading-relaxed">
                      {post.vocabData.mnemonic}
                    </p>
                  </div>
                </div>
              )}

              {post.vocabData.exampleSentence && (
                <div className="bg-white/80 p-3 rounded-xl border border-gray-100 mt-2 text-xs text-gray-600 italic">
                  &ldquo;{post.vocabData.exampleSentence}&rdquo;
                </div>
              )}

              {post.vocabData.examTags && post.vocabData.examTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[11px] font-bold text-gray-400">বিগত পরীক্ষা:</span>
                  {post.vocabData.examTags.map((et, idx) => (
                    <Tag key={idx} color="purple" className="text-[10px] font-bold rounded-md m-0">
                      {et}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action: Save to Revision Deck */}
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">ব্যক্তিগত রিভিশন ডেকে যুক্ত করবেন?</span>
              <Button
                size="small"
                type="primary"
                icon={savedToDeck ? <CheckOutlined /> : <BookOutlined />}
                loading={savingDeck}
                onClick={handleSaveToDeck}
                disabled={savedToDeck}
                className={
                  savedToDeck
                    ? 'bg-slate-700 font-bold rounded-xl text-xs'
                    : 'bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl text-xs'
                }
              >
                {savedToDeck ? 'ডেকে সংরক্ষিত' : 'ডেকে সেভ করুন'}
              </Button>
            </div>
          </div>
        )}

        {/* 2. MCQ CHALLENGE TYPE */}
        {post.mcqData && (
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-gray-200/80 my-3">
            <div className="flex items-start gap-2 mb-3">
              <span className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-lg shrink-0">
                MCQ
              </span>
              <h4 className="font-bold text-sm sm:text-base text-gray-900 m-0 leading-snug">
                {post.mcqData.question}
              </h4>
            </div>

            {/* Options list */}
            <div className="space-y-2 mt-3">
              {post.mcqData.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = opt.trim() === post.mcqData?.correctAnswer?.trim();
                const answered = selectedOption !== null;
                const percent = getVotePercent(idx);

                let btnStyle = 'bg-white border-gray-200 text-gray-800 hover:border-emerald-500';
                if (answered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                  } else {
                    btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-70';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all duration-200 relative overflow-hidden flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </span>

                    {answered && (
                      <div className="relative z-10 flex items-center gap-2 text-xs font-bold">
                        <span>{percent}%</span>
                        {isCorrect ? (
                          <CheckCircleFilled className="text-emerald-600 text-base" />
                        ) : isSelected ? (
                          <CloseCircleFilled className="text-rose-500 text-base" />
                        ) : null}
                      </div>
                    )}

                    {/* Background vote percentage fill */}
                    {answered && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 ${
                          isCorrect ? 'bg-emerald-100/50' : isSelected ? 'bg-rose-100/40' : 'bg-gray-100/60'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {showExplanation && post.mcqData.explanation && (
              <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl animate-in fade-in duration-300">
                <span className="font-bold text-xs text-emerald-900 block mb-1">সঠিক উত্তরের ব্যাখ্যা:</span>
                <p className="text-xs text-emerald-950 leading-relaxed m-0 font-medium">
                  {post.mcqData.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. MICRO-LESSON / RULE TYPE */}
        {post.type === 'micro_lesson' && (
          <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-2xl my-3">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-2">
              <BulbOutlined />
              <span>১ মিনিটের গুরুত্বপূর্ণ ব্যাকরণ রুল</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal m-0 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        )}

        {/* 4. USER PROGRESS ACHIEVER TYPE */}
        {post.progressData && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-700 text-white p-5 rounded-2xl my-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-amber-300 text-2xl" />
                <div>
                  <span className="text-[10px] text-emerald-200 uppercase font-black tracking-wider block">
                    স্টাডি মাইলস্টোন
                  </span>
                  <span className="font-black text-base text-white">
                    {post.progressData.badgeTitle || 'সফল প্রস্তুতি অর্জন'}
                  </span>
                </div>
              </div>
              {post.progressData.streakDays && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-xl text-xs font-black">
                  <FireOutlined className="text-amber-300" />
                  <span>{post.progressData.streakDays} দিন স্ট্রিক</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
              <div>
                <span className="text-2xl font-black block text-amber-300">
                  {post.progressData.wordsLearned || 35}+
                </span>
                <span className="text-[10px] text-emerald-100 font-medium">শব্দ আয়ত্ত</span>
              </div>
              <div>
                <span className="text-2xl font-black block text-emerald-200">
                  {post.progressData.accuracy || 92}%
                </span>
                <span className="text-[10px] text-emerald-100 font-medium">কুইজ নির্ভুলতা</span>
              </div>
            </div>

            {post.content && (
              <p className="text-xs text-emerald-100/90 leading-relaxed m-0 italic mt-3">
                &ldquo;{post.content}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Tags row */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                onClick={() => onTagClick?.(tag)}
                className="text-[11px] font-bold text-gray-500 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* Like button */}
          <Button
            type="text"
            icon={
              isLiked ? (
                <HeartFilled className="text-rose-500 text-lg" />
              ) : (
                <HeartOutlined className="text-gray-500 text-lg" />
              )
            }
            onClick={handleLike}
            className="font-bold text-xs flex items-center gap-1.5 text-gray-700 hover:!text-rose-600 rounded-xl px-2.5"
          >
            {likes > 0 && likes}
          </Button>

          {/* Bookmark */}
          <Button
            type="text"
            icon={
              isBookmarked ? (
                <BookFilled className="text-emerald-600 text-lg" />
              ) : (
                <BookOutlined className="text-gray-500 text-lg" />
              )
            }
            onClick={handleBookmark}
            className="font-bold text-xs flex items-center gap-1.5 text-gray-700 hover:!text-emerald-700 rounded-xl px-2.5"
          >
            {bookmarks > 0 && bookmarks}
          </Button>

          {/* Share */}
          <Button
            type="text"
            icon={<ShareAltOutlined className="text-gray-500 text-lg" />}
            onClick={handleShare}
            className="font-bold text-xs text-gray-700 hover:!text-gray-900 rounded-xl px-2"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="small"
            icon={savedToNotebook ? <CheckOutlined /> : <PlusOutlined />}
            loading={savingNotebook}
            onClick={handleSaveToNotebook}
            className={`text-xs font-bold rounded-xl ${
              savedToNotebook
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-gray-700 border-gray-200 hover:border-emerald-500'
            }`}
          >
            {savedToNotebook ? 'নোটবুকে আছে' : 'নোটবুকে সেভ'}
          </Button>

          {/* Ask AI Explanation */}
          <Button
            size="small"
            icon={<RobotOutlined className="text-indigo-600" />}
          onClick={() => {
            const prompt = post.vocabData?.word
              ? `"${post.vocabData.word}" শব্দটির ব্যবহার, বিগত বিসিএস/ব্যাংক পরীক্ষার উদাহরণ এবং সিনোনিম বুঝিয়ে বলুন।`
              : post.mcqData?.question
              ? `এই প্রশ্নটির ব্যাকরণগত নিয়ম বুঝিয়ে বলুন: "${post.mcqData.question}"`
              : `এই বিষয়টির বিশদ বিসিএস প্রস্তুতি টিপস দিন: "${post.title}"`;
            onAskAI?.(prompt);
          }}
          className="text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200 rounded-xl hover:!bg-indigo-100"
        >
          AI ব্যাখ্যা নিন
        </Button>
      </div>
    </div>
  </div>
);
}
