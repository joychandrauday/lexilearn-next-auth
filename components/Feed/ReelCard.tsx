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
} from '@ant-design/icons';
import { Button, Tag, Progress } from 'antd';
import { toast } from 'sonner';
import axios from 'axios';

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
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [bookmarks, setBookmarks] = useState(post.bookmarks || 0);
  const [isBookmarked, setIsBookmarked] = useState(!!post.isBookmarked);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [savingDeck, setSavingDeck] = useState(false);
  const [savedToDeck, setSavedToDeck] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Like handler
  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikes((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await axios.post(`/api/feed/${post._id}/react`, {
        action: 'like',
        userEmail,
      });
    } catch {
      // rollback
      setIsLiked(!nextState);
      setLikes((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  // Bookmark handler
  const handleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    setBookmarks((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await axios.post(`/api/feed/${post._id}/react`, {
        action: 'bookmark',
        userEmail,
      });
      toast.success(nextState ? 'রিলটি বুকমার্কে সংরক্ষিত হয়েছে' : 'বুকমার্ক সরানো হয়েছে');
    } catch {
      setIsBookmarked(!nextState);
      setBookmarks((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  // Save to Deck handler
  const handleSaveToDeck = async () => {
    if (!post.vocabData?.word) return;
    setSavingDeck(true);
    try {
      const res = await axios.post(`/api/feed/${post._id}/react`, {
        action: 'save_to_deck',
        userEmail,
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
        userEmail,
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
          <span>আজকের স্পেশাল পিন্ড রিল</span>
        </div>
      )}

      {post.type === 'daily_editorial' && !post.isPinned && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-800 text-white text-[11px] font-bold px-4 py-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <BulbOutlined className="text-amber-300" /> জাতীয় সম্পাদকীয় ভোকাবুলারি রিল
          </span>
          <span className="text-[10px] text-indigo-200">Daily Spotlight</span>
        </div>
      )}

      {/* Reel Header */}
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
              ? 'ভোকাব রিল'
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

      {/* Reel Body */}
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

            {/* Bengali Meaning */}
            <div className="bg-white p-3 rounded-xl border border-emerald-100 mb-3 shadow-xs">
              <span className="text-xs text-gray-400 font-bold block mb-0.5">বাংলা অর্থ:</span>
              <p className="text-base font-black text-emerald-900 m-0">{post.vocabData.bangla}</p>
              {post.vocabData.meaning && (
                <p className="text-xs text-gray-600 font-medium mt-1 m-0">
                  {post.vocabData.meaning}
                </p>
              )}
            </div>

            {/* Desi Mnemonic Memory Hook */}
            {post.vocabData.mnemonic && (
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 mb-1">
                  <BulbOutlined className="text-amber-600" />
                  <span>দেশি ট্রিক ও মনে রাখার কৌশল (Mnemonic):</span>
                </div>
                <p className="text-xs text-amber-950 font-bold m-0 leading-relaxed">
                  {post.vocabData.mnemonic}
                </p>
              </div>
            )}

            {/* Example sentence */}
            {post.vocabData.exampleSentence && (
              <div className="text-xs text-gray-600 italic bg-white/70 p-2.5 rounded-lg border border-gray-100 mb-3">
                &ldquo;{post.vocabData.exampleSentence}&rdquo;
              </div>
            )}

            {/* Exam appearances */}
            {post.vocabData.examTags && post.vocabData.examTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-[11px] font-bold text-gray-400">পরীক্ষায় এসেছে:</span>
                {post.vocabData.examTags.map((et, i) => (
                  <Tag key={i} color="gold" className="text-[10px] font-bold rounded-md m-0">
                    {et}
                  </Tag>
                ))}
              </div>
            )}

            {/* 1-Click Save to Deck */}
            <Button
              type="primary"
              icon={savedToDeck ? <CheckOutlined /> : <BookOutlined />}
              loading={savingDeck}
              onClick={handleSaveToDeck}
              className={`w-full font-bold rounded-xl h-10 ${
                savedToDeck
                  ? 'bg-emerald-700 hover:!bg-emerald-800'
                  : 'bg-emerald-600 hover:!bg-emerald-500'
              }`}
            >
              {savedToDeck ? 'ডেকে সংরক্ষিত হয়েছে!' : 'আমার রিভিশন ডেকে যুক্ত করুন'}
            </Button>
          </div>
        )}

        {/* 2. EXAM MCQ CHALLENGE TYPE */}
        {post.mcqData && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 my-3">
            <p className="text-sm md:text-base font-bold text-gray-900 mb-4 leading-relaxed">
              {post.mcqData.question}
            </p>

            <div className="space-y-2 mb-3">
              {post.mcqData.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = opt === post.mcqData?.correctAnswer;
                let btnStyle = 'border-gray-200 bg-white text-gray-800';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-bold';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm font-medium transition-all flex items-center justify-between relative overflow-hidden ${btnStyle}`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </span>

                    {selectedOption !== null && (
                      <span className="relative z-10 flex items-center gap-2 font-bold text-xs">
                        {isCorrect && <CheckCircleFilled className="text-emerald-600 text-sm" />}
                        {isSelected && !isCorrect && (
                          <CloseCircleFilled className="text-rose-600 text-sm" />
                        )}
                        <span className="text-gray-400 font-mono text-[11px]">
                          {getVotePercent(idx)}%
                        </span>
                      </span>
                    )}

                    {selectedOption !== null && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 opacity-15 ${
                          isCorrect ? 'bg-emerald-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${getVotePercent(idx)}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {showExplanation && post.mcqData.explanation && (
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed mt-3">
                <span className="font-bold text-emerald-900 block mb-1">
                  নিয়ম ও ব্যাখ্যা (Explanation):
                </span>
                <p className="m-0 whitespace-pre-line">{post.mcqData.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* 3. MICRO-LESSON / TEXT CONTENT */}
        {post.content && !post.vocabData && !post.mcqData && !post.progressData && (
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 my-3 text-sm text-gray-800 leading-relaxed whitespace-pre-line font-medium">
            {post.content}
          </div>
        )}

        {/* 4. USER PROGRESS ACHIEVED CARD */}
        {post.progressData && (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm my-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                <TrophyOutlined className="text-2xl" />
              </div>
              <div>
                <h4 className="text-base font-black text-amber-300 m-0">
                  {post.progressData.badgeTitle || 'লিজেন্ডারি প্রগ্রেস!'}
                </h4>
                <p className="text-xs text-emerald-200/80 m-0">
                  একটানা প্রস্তুতি ও নিয়মিত রিভিশন মাইলস্টোন
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-white/10 p-3 rounded-xl backdrop-blur-xs mb-3">
              <div>
                <span className="text-xl font-black text-white block">
                  {post.progressData.wordsLearned || 50}
                </span>
                <span className="text-[10px] text-emerald-200 font-bold uppercase">শব্দ আয়ত্ত</span>
              </div>
              <div>
                <span className="text-xl font-black text-amber-300 block">
                  {post.progressData.accuracy || 95}%
                </span>
                <span className="text-[10px] text-emerald-200 font-bold uppercase">একুরেসি</span>
              </div>
              <div>
                <span className="text-xl font-black text-emerald-300 block">
                  {post.progressData.streakDays || 7} দিন
                </span>
                <span className="text-[10px] text-emerald-200 font-bold uppercase">স্ট্রিক</span>
              </div>
            </div>

            {post.content && (
              <p className="text-xs text-emerald-100/90 leading-relaxed m-0 italic">
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

      {/* Reel Footer: Action Bar */}
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
  );
}
