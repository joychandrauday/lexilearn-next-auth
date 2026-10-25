'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyOutlined,
  ThunderboltOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  UserOutlined,
  TeamOutlined,
  CopyOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
  CrownOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Tag, Spin, Input, Button, Modal, Progress } from 'antd';

interface IDuelQuestion {
  questionId?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic?: string;
  examTag: string;
}

interface IDuelAnswer {
  questionIndex: number;
  selectedOption: string;
  timeSpentSeconds: number;
  isCorrect: boolean;
  pointsEarned: number;
}

interface IDuelPlayer {
  email: string;
  name: string;
  image?: string;
  score: number;
  isReady: boolean;
  isFinished: boolean;
  answers: IDuelAnswer[];
}

interface IQuizDuel {
  _id: string;
  roomCode: string;
  challenger: IDuelPlayer;
  opponent?: IDuelPlayer;
  isBotOpponent: boolean;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  subject: string;
  questions: IDuelQuestion[];
  winnerEmail?: string;
}

interface ILeaderboardItem {
  rank: number;
  name: string;
  email: string;
  duelWins: number;
  duelLosses: number;
  duelDraws: number;
  duelRating: number;
  winRate: number;
  xp: number;
  badges: string[];
}

export default function BattleArenaPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || (userEmail ? userEmail.split('@')[0] : 'Guest Aspirant');

  // Stages: 'lobby' | 'waiting' | 'in_battle' | 'results'
  const [stage, setStage] = useState<'lobby' | 'waiting' | 'in_battle' | 'results'>('lobby');
  const [duel, setDuel] = useState<IQuizDuel | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [leaderboard, setLeaderboard] = useState<ILeaderboardItem[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // In-battle state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);
  const [roundResult, setRoundResult] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswer: string;
    explanation: string;
    botAnswer?: any;
  } | null>(null);

  const [savingMistakeId, setSavingMistakeId] = useState<number | null>(null);
  const [savedMistakes, setSavedMistakes] = useState<Set<number>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Load Leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await axios.get('/api/battle?action=leaderboard');
      if (res.data?.success) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch {
      // ignore
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Poll room status if waiting
  useEffect(() => {
    if (stage === 'waiting' && duel?.roomCode) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await axios.get(`/api/battle?roomCode=${duel.roomCode}`);
          if (res.data?.success && res.data.duel) {
            const updatedDuel: IQuizDuel = res.data.duel;
            if (updatedDuel.status === 'in_progress') {
              setDuel(updatedDuel);
              setStage('in_battle');
              setCurrentQuestionIndex(0);
              startQuestionTimer();
              toast.success('An opponent joined! Battle starting now!');
              if (pollRef.current) clearInterval(pollRef.current);
            }
          }
        } catch {
          // ignore
        }
      }, 2000);

      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [stage, duel?.roomCode]);

  // Question Timer
  const startQuestionTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(15);
    setHasSubmittedCurrent(false);
    setSelectedOption(null);
    setRoundResult(null);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeExpired = () => {
    if (!hasSubmittedCurrent) {
      submitAnswer('', 15);
    }
  };

  // Submit Answer
  const submitAnswer = async (option: string, spentSeconds: number) => {
    if (hasSubmittedCurrent || !duel) return;
    setHasSubmittedCurrent(true);
    setSelectedOption(option);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await axios.post('/api/battle', {
        action: 'submit_answer',
        roomCode: duel.roomCode,
        userEmail: userEmail || 'guest@lexilearn.com',
        userName,
        questionIndex: currentQuestionIndex,
        selectedOption: option,
        timeSpentSeconds: spentSeconds,
      });

      if (res.data?.success) {
        setRoundResult({
          isCorrect: res.data.isCorrect,
          pointsEarned: res.data.pointsEarned,
          correctAnswer: res.data.correctAnswer,
          explanation: res.data.explanation,
          botAnswer: res.data.botAnswer,
        });

        if (res.data.duel) {
          setDuel(res.data.duel);
        }

        if (res.data.duelFinished) {
          setTimeout(() => {
            setStage('results');
            fetchLeaderboard();
          }, 3200);
        }
      }
    } catch {
      toast.error('Failed to submit answer');
    }
  };

  const handleNextQuestion = () => {
    if (!duel) return;
    if (currentQuestionIndex + 1 < duel.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      startQuestionTimer();
    } else {
      setStage('results');
    }
  };

  // Instant Quick Match
  const handleQuickMatch = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/battle', {
        action: 'match',
        userEmail: userEmail || 'guest@lexilearn.com',
        userName,
        subject: selectedSubject,
      });

      if (res.data?.success && res.data.duel) {
        setDuel(res.data.duel);
        setStage('in_battle');
        setCurrentQuestionIndex(0);
        startQuestionTimer();
        toast.success(res.data.message || 'Battle arena ready!');
      } else {
        toast.error(res.data?.error || 'Unable to start match');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error launching match');
    } finally {
      setLoading(false);
    }
  };

  // Create Room
  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/battle', {
        action: 'create',
        userEmail: userEmail || 'guest@lexilearn.com',
        userName,
        subject: selectedSubject,
      });

      if (res.data?.success && res.data.duel) {
        setDuel(res.data.duel);
        setStage('waiting');
        toast.success('Room created! Share room code with your sparring partner.');
      } else {
        toast.error(res.data?.error || 'Could not create room');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  // Join Room
  const handleJoinRoom = async () => {
    if (!inputRoomCode.trim()) {
      toast.error('Please enter a 6-character room code');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/battle', {
        action: 'join',
        roomCode: inputRoomCode.trim(),
        userEmail: userEmail || 'guest@lexilearn.com',
        userName,
      });

      if (res.data?.success && res.data.duel) {
        setDuel(res.data.duel);
        setStage('in_battle');
        setCurrentQuestionIndex(0);
        startQuestionTimer();
        toast.success('Joined duel room! The battle begins!');
      } else {
        toast.error(res.data?.error || 'Could not join room');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to join duel room');
    } finally {
      setLoading(false);
    }
  };

  // Save to Mistake Vault
  const handleSaveToMistakeVault = async (q: IDuelQuestion, userWrongChoice: string, index: number) => {
    if (savedMistakes.has(index)) return;
    setSavingMistakeId(index);
    try {
      const res = await axios.post('/api/battle', {
        action: 'save_mistake',
        userEmail: userEmail || 'guest@lexilearn.com',
        questionData: {
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userWrongAnswer: userWrongChoice,
          explanation: q.explanation,
          subject: q.subject,
          topic: q.topic,
        },
      });
      if (res.data?.success) {
        setSavedMistakes((prev) => new Set(prev).add(index));
        toast.success('Saved to Mistake Vault for review!');
      }
    } catch {
      toast.error('Could not save to Mistake Vault');
    } finally {
      setSavingMistakeId(null);
    }
  };

  // Clean exit
  const handleResetToLobby = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    setDuel(null);
    setStage('lobby');
    setCurrentQuestionIndex(0);
    setHasSubmittedCurrent(false);
    setSelectedOption(null);
    setRoundResult(null);
  };

  // Current question & player helpers
  const currentQ = duel?.questions[currentQuestionIndex];
  const isChallenger = duel?.challenger.email === (userEmail || 'guest@lexilearn.com');
  const myPlayer = isChallenger ? duel?.challenger : duel?.opponent;
  const oppPlayer = isChallenger ? duel?.opponent : duel?.challenger;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* TOP BREADCRUMB / NAV */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
              <ThunderboltOutlined className="text-amber-400" /> 1-vs-1 Aspirant Duel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeaderboardModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              <TrophyOutlined /> Top Gladiators
            </button>
            <Link
              href="/question-bank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <BookOutlined /> Question Bank
            </Link>
          </div>
        </div>

        {/* ----------------- STAGE 1: LOBBY ----------------- */}
        {stage === 'lobby' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
                  <ThunderboltOutlined className="text-amber-400" /> Real-Time Competitive Exam Sparring
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  1-vs-1 Aspirant Quiz Duel
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                  Test your real-time recall speed under exam pressure. Compete 1-on-1 over 5 past BCS & Bank questions with instant score tracking and Mistake Vault integration.
                </p>

                {/* Subject Selector */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 mr-2">Focus Domain:</span>
                  {[
                    { id: 'all', label: 'Mixed BCS/Bank' },
                    { id: 'english', label: 'English' },
                    { id: 'bangladesh', label: 'Bangladesh Affairs' },
                    { id: 'international', label: 'International' },
                    { id: 'math', label: 'Math & Mental' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        selectedSubject === sub.id
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Quick Match */}
              <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-6 flex flex-col justify-between hover:border-emerald-500/60 transition shadow-xl">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl mb-4">
                    <ThunderboltOutlined />
                  </div>
                  <h3 className="text-lg font-bold text-white">Instant Quick Match</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Auto-match with an active candidate queue or an adaptive AI sparring partner in 3 seconds.
                  </p>
                </div>
                <button
                  onClick={handleQuickMatch}
                  disabled={loading}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Spin size="small" /> : <><ThunderboltOutlined /> Quick Match Now</>}
                </button>
              </div>

              {/* Option 2: Create Custom Room */}
              <div className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-6 flex flex-col justify-between hover:border-indigo-500/60 transition shadow-xl">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl mb-4">
                    <TeamOutlined />
                  </div>
                  <h3 className="text-lg font-bold text-white">Create Duel Room</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Generate a 6-character room code to challenge a friend, batchmate, or study partner directly.
                  </p>
                </div>
                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Spin size="small" /> : <><FireOutlined /> Create Room Code</>}
                </button>
              </div>

              {/* Option 3: Join Room */}
              <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 flex flex-col justify-between hover:border-amber-500/60 transition shadow-xl">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl mb-4">
                    <UserOutlined />
                  </div>
                  <h3 className="text-lg font-bold text-white">Join with Code</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Enter the 6-character room code sent by your peer to enter their active arena.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    placeholder="E.g. A9K2L1"
                    className="mt-4 w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-sm focus:border-amber-400 outline-none"
                  />
                </div>
                <button
                  onClick={handleJoinRoom}
                  disabled={loading || !inputRoomCode.trim()}
                  className="mt-4 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Spin size="small" /> : <><ArrowRightOutlined /> Enter Arena</>}
                </button>
              </div>
            </div>

            {/* DUEL RULES & REWARDS */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-emerald-400" /> Duel Arena Guidelines
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-white font-semibold mb-1">⏱️ 15s Per Question</div>
                  Speed matters! Faster answers earn up to +5 speed bonus points on top of the 10 base points.
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-white font-semibold mb-1">⚡ +30 XP & Rating Boost</div>
                  Winners receive +30 contribution XP and increase their arena rating. Runners-up still receive +10 XP.
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-white font-semibold mb-1">📘 1-Click Mistake Vault</div>
                  Every missed question can be saved immediately to your personal Mistake Vault for revision.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ----------------- STAGE 2: WAITING ROOM ----------------- */}
        {stage === 'waiting' && duel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center max-w-lg mx-auto space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl animate-pulse">
              <TeamOutlined />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Duel Room Created!</h2>
              <p className="mt-1 text-xs text-slate-400">
                Share this code with your sparring partner to enter the battle.
              </p>
            </div>

            {/* Room Code Badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-center justify-center gap-4">
              <span className="font-mono text-3xl font-black tracking-widest text-indigo-300">
                {duel.roomCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(duel.roomCode);
                  toast.success('Room code copied to clipboard!');
                }}
                className="p-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 transition"
                title="Copy Room Code"
              >
                <CopyOutlined />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Spin size="small" />
              <span>Waiting for opponent to join...</span>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handleResetToLobby}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel Room
              </button>
              <button
                onClick={handleQuickMatch}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RobotOutlined /> Switch to AI Sparring Partner
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------- STAGE 3: IN BATTLE ----------------- */}
        {stage === 'in_battle' && duel && currentQ && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* DUEL SCOREBOARD HEADER */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl">
              <div className="grid grid-cols-3 items-center">
                {/* Left: You */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {myPlayer?.name?.charAt(0) || 'Y'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      {myPlayer?.name || 'You'} <span className="text-slate-500 font-normal">(You)</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      {myPlayer?.score || 0} <span className="text-xs font-normal text-slate-400">pts</span>
                    </div>
                  </div>
                </div>

                {/* Center: VS & Timer */}
                <div className="text-center">
                  <div className="text-xs font-black tracking-widest text-slate-500 uppercase">VS</div>
                  <div
                    className={`text-2xl sm:text-3xl font-black font-mono transition-colors ${
                      timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                    }`}
                  >
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Question {currentQuestionIndex + 1} of {duel.questions.length}
                  </div>
                </div>

                {/* Right: Opponent */}
                <div className="flex items-center justify-end gap-3 text-right">
                  <div>
                    <div className="text-xs font-bold text-indigo-400 flex items-center justify-end gap-1">
                      {oppPlayer?.name || 'Opponent'}
                      {duel.isBotOpponent && (
                        <Tag color="cyan" className="text-[10px] m-0 px-1 py-0">
                          AI
                        </Tag>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      {oppPlayer?.score || 0} <span className="text-xs font-normal text-slate-400">pts</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    {duel.isBotOpponent ? <RobotOutlined /> : oppPlayer?.name?.charAt(0) || 'O'}
                  </div>
                </div>
              </div>

              {/* Progress bar countdown */}
              <div className="mt-4 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${(timeLeft / 15) * 100}%` }}
                />
              </div>
            </div>

            {/* QUESTION CARD */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {currentQ.subject}
                  </span>
                  {currentQ.topic && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs">
                      {currentQ.topic}
                    </span>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  {currentQ.examTag}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentQ.questionText}
              </h2>

              {/* OPTIONS GRID */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

                  let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/50';

                  if (hasSubmittedCurrent) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={hasSubmittedCurrent}
                      onClick={() => submitAnswer(opt, 15 - timeLeft)}
                      className={`p-4 rounded-2xl border text-left text-sm font-medium transition flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {hasSubmittedCurrent && isCorrect && (
                        <CheckCircleFilled className="text-emerald-400 text-base" />
                      )}
                      {hasSubmittedCurrent && isSelected && !isCorrect && (
                        <CloseCircleFilled className="text-rose-400 text-base" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* POST ANSWER REVEAL & EXPLANATION */}
              {hasSubmittedCurrent && roundResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {roundResult.isCorrect ? (
                        <Tag color="success" className="font-bold text-xs py-0.5 px-2">
                          Correct! +{roundResult.pointsEarned} pts
                        </Tag>
                      ) : (
                        <Tag color="error" className="font-bold text-xs py-0.5 px-2">
                          Incorrect (+0 pts)
                        </Tag>
                      )}

                      {roundResult.botAnswer && (
                        <span className="text-xs text-slate-400">
                          Opponent chose: <strong className="text-indigo-300">{roundResult.botAnswer.selectedOption}</strong>{' '}
                          ({roundResult.botAnswer.isCorrect ? '✅ Correct' : '❌ Wrong'})
                        </span>
                      )}
                    </div>

                    {!roundResult.isCorrect && (
                      <button
                        onClick={() =>
                          handleSaveToMistakeVault(currentQ, selectedOption || 'Time Out', currentQuestionIndex)
                        }
                        disabled={savedMistakes.has(currentQuestionIndex) || savingMistakeId === currentQuestionIndex}
                        className="text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                      >
                        {savedMistakes.has(currentQuestionIndex) ? (
                          '✓ Saved to Mistake Vault'
                        ) : savingMistakeId === currentQuestionIndex ? (
                          <Spin size="small" />
                        ) : (
                          '+ Add to Mistake Vault'
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400">Explanation: </strong>
                    {roundResult.explanation || 'Review the correct answer to reinforce pattern recognition.'}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      {currentQuestionIndex + 1 < duel.questions.length ? 'Next Question →' : 'View Duel Results →'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ----------------- STAGE 4: RESULTS ----------------- */}
        {stage === 'results' && duel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* RESULT BANNER */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Determine Outcome */}
              {(() => {
                const myScore = myPlayer?.score || 0;
                const oppScore = oppPlayer?.score || 0;
                const won = myScore > oppScore;
                const draw = myScore === oppScore;

                return (
                  <div className="relative z-10 max-w-lg mx-auto">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 border shadow-xl bg-slate-950">
                      {won ? (
                        <CrownOutlined className="text-amber-400" />
                      ) : draw ? (
                        <SafetyCertificateOutlined className="text-blue-400" />
                      ) : (
                        <FireOutlined className="text-rose-400" />
                      )}
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {won ? '🏆 VICTORY!' : draw ? '⚔️ TIE GAME / DRAW!' : '🛡️ VALIANT EFFORT!'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      {won
                        ? 'Sensational recall speed! You outscored your rival in today’s duel.'
                        : draw
                        ? 'Neck and neck! Both candidates matched each other stroke for stroke.'
                        : 'Close duel! Review the missed questions below to close your knowledge gaps.'}
                    </p>

                    {/* Final Score Board */}
                    <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-around">
                      <div className="text-center">
                        <div className="text-xs text-emerald-400 font-bold">{myPlayer?.name || 'You'}</div>
                        <div className="text-3xl font-black text-white">{myScore}</div>
                        <div className="text-[11px] text-slate-400">Total Score</div>
                      </div>
                      <div className="text-xl font-bold text-slate-600">VS</div>
                      <div className="text-center">
                        <div className="text-xs text-indigo-400 font-bold">{oppPlayer?.name || 'Opponent'}</div>
                        <div className="text-3xl font-black text-white">{oppScore}</div>
                        <div className="text-[11px] text-slate-400">Total Score</div>
                      </div>
                    </div>

                    {/* XP Bonus Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      <ThunderboltOutlined className="text-amber-400" />
                      {won ? '+30 Contribution XP & +20 Duel Rating Earned' : '+10 Contribution XP (Participation Reward)'}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={handleQuickMatch}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20"
                      >
                        Play Another Duel
                      </button>
                      <button
                        onClick={handleResetToLobby}
                        className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition"
                      >
                        Back to Lobby
                      </button>
                      <button
                        onClick={() => setShowLeaderboardModal(true)}
                        className="px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold text-sm transition flex items-center gap-1.5"
                      >
                        <TrophyOutlined /> View Leaderboard
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* QUESTION REVIEW & 1-CLICK MISTAKE VAULT SYNC */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOutlined className="text-indigo-400" /> Question Breakdown & Mistake Vault Sync
              </h3>

              <div className="space-y-4">
                {duel.questions.map((q, idx) => {
                  const myAns = myPlayer?.answers.find((a) => a.questionIndex === idx);
                  const isCorrect = myAns?.isCorrect;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition ${
                        isCorrect
                          ? 'bg-slate-950/60 border-slate-800/80'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">Q{idx + 1}.</span>
                          <span className="text-xs text-slate-300 font-medium">{q.subject}</span>
                          <span className="text-[11px] text-amber-400">({q.examTag})</span>
                        </div>

                        {!isCorrect && (
                          <button
                            onClick={() =>
                              handleSaveToMistakeVault(q, myAns?.selectedOption || 'Timed Out', idx)
                            }
                            disabled={savedMistakes.has(idx) || savingMistakeId === idx}
                            className="text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                          >
                            {savedMistakes.has(idx) ? (
                              '✓ Saved in Mistake Vault'
                            ) : savingMistakeId === idx ? (
                              <Spin size="small" />
                            ) : (
                              '+ Save to Mistake Vault'
                            )}
                          </button>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-white mb-2">{q.questionText}</div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-slate-500">Your Answer: </span>
                          <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                            {myAns?.selectedOption || 'Not answered'}
                          </strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-slate-500">Correct Answer: </span>
                          <strong className="text-emerald-400">{q.correctAnswer}</strong>
                        </div>
                      </div>

                      {q.explanation && (
                        <div className="mt-2 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-2">
                          <strong className="text-slate-300">Explanation: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ----------------- LEADERBOARD MODAL ----------------- */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-white">
              <TrophyOutlined className="text-amber-400" />
              <span>Aspirant Duel Gladiators (Top Ranks)</span>
            </div>
          }
          open={showLeaderboardModal}
          onCancel={() => setShowLeaderboardModal(false)}
          footer={null}
          width={650}
          className="dark-modal"
          styles={{
            content: { backgroundColor: '#090d16', border: '1px solid #1e293b' },
            header: { backgroundColor: '#090d16' },
          }}
        >
          <div className="py-2 space-y-4 text-slate-200">
            <p className="text-xs text-slate-400">
              Ranked by competitive rating, duel wins, and candidate win percentage.
            </p>

            {loadingLeaderboard ? (
              <div className="py-8 text-center">
                <Spin size="large" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recorded duel champions yet. Be the first to win a duel!
              </div>
            ) : (
              <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
                {leaderboard.map((item) => (
                  <div key={item.email} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          item.rank === 1
                            ? 'bg-amber-500 text-slate-950'
                            : item.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.rank}
                      </span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {item.name}
                          {item.badges.length > 0 && (
                            <Tag color="purple" className="text-[10px] m-0 px-1 py-0">
                              {item.badges[0]}
                            </Tag>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.duelWins}W - {item.duelLosses}L ({item.winRate}% Win Rate)
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-300">{item.duelRating} pts</div>
                      <div className="text-[10px] text-slate-500">+{item.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
