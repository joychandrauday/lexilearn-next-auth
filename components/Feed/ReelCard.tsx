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
  RobotOutlined,
  TrophyOutlined,
  UserOutlined,
  FireOutlined,
  CheckOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Tag } from 'antd';
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
      setIsLiked(!nextState);
      setLikes((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
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
      className="w-full max-w-xl h-full max-h-[640px] bg-white rounded-3xl border border-gray-200/90 shadow-xl flex flex-col justify-between overflow-hidden relative transition-all"
    >
      {/* Top Header Badge */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-gray-100 bg-slate-50/70 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs ${
              post.author.role === 'lexibot'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                : post.author.role === 'admin'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                : 'bg-gradient-to-br from-slate-700 to-slate-900'
            }`}
          >
            {post.author.role === 'lexibot' ? (
              <RobotOutlined className="text-sm" />
            ) : post.author.role === 'admin' ? (
              <ThunderboltFilled className="text-sm" />
            ) : (
              <UserOutlined className="text-xs" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-gray-900">{post.author.name}</span>
              {post.author.role === 'lexibot' && (
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                  AI Mentor
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-medium block">
              {post.category?.toUpperCase()} প্রস্তুতি
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {post.isPinned && (
            <Tag color="gold" className="text-[10px] font-black rounded-md m-0 border-0">
              পিন্ড
            </Tag>
          )}
          <Tag color="cyan" className="font-bold text-[10px] rounded-md m-0 border-0">
            {post.type === 'vocab_card'
              ? 'ভোকাবুলারি'
              : post.type === 'exam_mcq'
              ? 'MCQ কুইজ'
              : post.type === 'micro_lesson'
              ? '১ মিনিটের রুল'
              : post.type === 'user_progress'
              ? 'মাইলস্টোন'
              : 'সম্পাদকীয়'}
          </Tag>
        </div>
      </div>

      {/* Main Content Area (Scrollable if needed, nicely padded) */}
      <div className="flex-1 px-5 py-4 overflow-y-auto no-scrollbar space-y-3">
        <h3 className="font-black text-base sm:text-lg text-gray-900 m-0 leading-snug">
          {post.title}
        </h3>

        {/* 1. VOCABULARY CARD */}
        {post.vocabData && (
          <div className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-4 rounded-2xl border border-emerald-100/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
                  {post.vocabData.word}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  {post.vocabData.partOfSpeech || 'Word'}
                </span>
              </div>
              <Button
                shape="circle"
                icon={<SoundOutlined />}
                loading={speaking}
                onClick={() => handlePronounce(post.vocabData?.word || '')}
                className="bg-emerald-600 hover:!bg-emerald-500 !text-white border-0 shadow-xs"
              />
            </div>

            <div className="flex items-baseline gap-2 pt-1 border-t border-emerald-100/60">
              <span className="font-bold text-gray-600 text-xs shrink-0">বাংলা অর্থ:</span>
              <span className="font-black text-emerald-900 text-base sm:text-lg">
                {post.vocabData.bangla}
              </span>
            </div>

            {post.vocabData.meaning && (
              <div className="text-xs text-gray-700 leading-relaxed font-medium">
                <span className="font-bold text-gray-500 text-[11px] block">English Meaning:</span>
                {post.vocabData.meaning}
              </div>
            )}

            {post.vocabData.mnemonic && (
              <div className="bg-amber-50/90 border border-amber-200/80 p-2.5 rounded-xl flex items-start gap-2 text-xs">
                <BulbOutlined className="text-amber-600 text-sm mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-amber-950 text-[11px] block">দেশি স্মৃতিসূত্র:</span>
                  <span className="text-amber-900 leading-snug">{post.vocabData.mnemonic}</span>
                </div>
              </div>
            )}

            {post.vocabData.exampleSentence && (
              <div className="bg-white/90 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-600 italic">
                &ldquo;{post.vocabData.exampleSentence}&rdquo;
              </div>
            )}

            {post.vocabData.examTags && post.vocabData.examTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] font-bold text-gray-400">বিগত পরীক্ষা:</span>
                {post.vocabData.examTags.map((et, idx) => (
                  <Tag key={idx} color="purple" className="text-[10px] font-bold rounded-md m-0">
                    {et}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. MCQ CHALLENGE */}
        {post.mcqData && (
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 m-0 leading-relaxed">
              {post.mcqData.question}
            </h4>

            <div className="space-y-1.5">
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
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </span>

                    {answered && (
                      <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold">
                        <span>{percent}%</span>
                        {isCorrect ? (
                          <CheckCircleFilled className="text-emerald-600" />
                        ) : isSelected ? (
                          <CloseCircleFilled className="text-rose-500" />
                        ) : null}
                      </div>
                    )}

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

            {showExplanation && post.mcqData.explanation && (
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-medium leading-relaxed">
                <span className="font-bold text-emerald-900 block mb-0.5">ব্যাখ্যা:</span>
                {post.mcqData.explanation}
              </div>
            )}
          </div>
        )}

        {/* 3. MICRO-LESSON / RULE */}
        {post.type === 'micro_lesson' && (
          <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-normal">
            {post.content}
          </div>
        )}

        {/* 4. USER PROGRESS */}
        {post.progressData && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-amber-300 text-xl" />
                <div>
                  <span className="text-[10px] text-emerald-200 uppercase font-black block">
                    স্টাডি মাইলস্টোন
                  </span>
                  <span className="font-black text-sm text-white">
                    {post.progressData.badgeTitle || 'সফল প্রস্তুতি অর্জন'}
                  </span>
                </div>
              </div>
              {post.progressData.streakDays && (
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">
                  <FireOutlined className="text-amber-300" />
                  <span>{post.progressData.streakDays} দিন</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white/10 p-2.5 rounded-xl text-center">
              <div>
                <span className="text-xl font-black block text-amber-300">
                  {post.progressData.wordsLearned || 35}+
                </span>
                <span className="text-[10px] text-emerald-100">শব্দ আয়ত্ত</span>
              </div>
              <div>
                <span className="text-xl font-black block text-emerald-200">
                  {post.progressData.accuracy || 92}%
                </span>
                <span className="text-[10px] text-emerald-100">নির্ভুলতা</span>
              </div>
            </div>

            {post.content && (
              <p className="text-xs text-emerald-100/90 italic m-0">&ldquo;{post.content}&rdquo;</p>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                onClick={() => onTagClick?.(tag)}
                className="text-[10px] font-bold text-gray-500 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Rail */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-t border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Like */}
          <Button
            type="text"
            icon={
              isLiked ? (
                <HeartFilled className="text-rose-500 text-base" />
              ) : (
                <HeartOutlined className="text-gray-500 text-base" />
              )
            }
            onClick={handleLike}
            className="font-bold text-xs flex items-center gap-1 text-gray-700 hover:!text-rose-600 rounded-xl px-2 h-8"
          >
            {likes > 0 && likes}
          </Button>

          {/* Share */}
          <Button
            type="text"
            icon={<ShareAltOutlined className="text-gray-500 text-base" />}
            onClick={handleShare}
            className="text-gray-600 hover:!text-gray-900 rounded-xl px-2 h-8"
            title="লিংক কপি করুন"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Save to Notebook */}
          <Button
            size="small"
            icon={savedToNotebook ? <CheckOutlined /> : <PlusOutlined />}
            loading={savingNotebook}
            onClick={handleSaveToNotebook}
            className={`text-xs font-bold rounded-xl h-8 px-2.5 ${
              savedToNotebook
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-500'
            }`}
          >
            {savedToNotebook ? 'নোটবুকে আছে' : 'নোটবুকে সেভ'}
          </Button>

          {/* Ask AI */}
          <Button
            size="small"
            icon={<RobotOutlined className="text-indigo-600" />}
            onClick={() => {
              const prompt = post.vocabData?.word
                ? `"${post.vocabData.word}" শব্দটির অর্থ, ব্যবহার ও বিগত পরীক্ষার প্রশ্ন বুঝিয়ে বলুন।`
                : post.mcqData?.question
                ? `এই প্রশ্নটির নিয়ম বুঝিয়ে বলুন: "${post.mcqData.question}"`
                : `এই টপিকের বিসিএস প্রস্তুতি টিপস দিন: "${post.title}"`;
              onAskAI?.(prompt);
            }}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200 rounded-xl hover:!bg-indigo-100 h-8 px-2.5"
          >
            AI ব্যাখ্যা
          </Button>
        </div>
      </div>
    </div>
  );
}
