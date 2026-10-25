'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSession, signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockCircleOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  FireOutlined,
  TrophyOutlined,
  PlusOutlined,
  DeleteOutlined,
  PlayCircleFilled,
  PauseCircleFilled,
  ReloadOutlined,
  BookOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  CheckOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Tag, Spin, Modal, Form, Input, Select, Progress } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

export default function StudyPlannerPage() {
  const { data: session } = useSession();
  const [storedEmail, setStoredEmail] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let email = localStorage.getItem('owl_user_email') || localStorage.getItem('lexi_user_email');
      if (!email && !session?.user?.email) {
        let guestId = localStorage.getItem('owl_guest_id') || localStorage.getItem('lexi_guest_id');
        if (!guestId) {
          guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
          localStorage.setItem('owl_guest_id', guestId);
          localStorage.setItem('lexi_guest_id', guestId);
        }
        email = `${guestId}@guest.growwithowl.com`;
      }
      if (email) setStoredEmail(email);
    }
  }, [session]);

  const activeEmail = session?.user?.email || storedEmail || '';

  const [loading, setLoading] = useState(true);
  const [routine, setRoutine] = useState<any>(null);
  const [weeklyHistory, setWeeklyHistory] = useState<any[]>([]);
  const [countdowns, setCountdowns] = useState<any[]>([]);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  // Filters
  const [selectedSlot, setSelectedSlot] = useState<string>('all');

  // Add Task Modal
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [addTaskForm] = Form.useForm();
  const [addingTask, setAddingTask] = useState(false);

  // Reflection
  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);

  // Pomodoro Timer State (25 mins default)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPlanner = async () => {
    if (!activeEmail) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/study-planner', {
        params: { userEmail: activeEmail },
      });
      if (res.data.success) {
        setRoutine(res.data.routine);
        setWeeklyHistory(res.data.weeklyHistory || []);
        setCountdowns(res.data.countdowns || []);
        setTotalFocusMinutes(res.data.totalFocusMinutes || 0);
        if (res.data.routine?.dailyReflection) {
          setReflectionText(res.data.routine.dailyReflection);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to load study planner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEmail) {
      fetchPlanner();
    }
  }, [activeEmail]);

  // Pomodoro Timer Countdown Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);

            if (timerMode === 'study') {
              handleLogPomodoro(25);
              toast.success('অভিনন্দন! ২৫ মিনিটের ডিপ ফোকাস সেশন সম্পন্ন হয়েছে (+১০ XP)।');
              setTimerMode('break');
              return 5 * 60; // 5 min break
            } else {
              toast.info('ব্রেক সমাপ্ত! পুনরায় পড়ার সেশন শুরু করতে পারেন।');
              setTimerMode('study');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = (mode: 'study' | 'break' = 'study') => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimerMode(mode);
    setPomodoroSeconds(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const handleLogPomodoro = async (minutes: number) => {
    if (!activeEmail) return;
    try {
      const res = await axios.post('/api/study-planner', {
        action: 'log-pomodoro',
        userEmail: activeEmail,
        focusMinutes: minutes,
      });
      if (res.data.success) {
        setTotalFocusMinutes((prev) => prev + minutes);
        if (routine) {
          setRoutine({ ...routine, focusMinutes: (routine.focusMinutes || 0) + minutes });
        }
      }
    } catch {
      // ignore
    }
  };

  // Toggle Task Completion with Optimistic UI
  const handleToggleTask = async (taskId: string) => {
    if (!routine) return;

    // Previous snapshot for rollback on network error
    const previousRoutine = { ...routine };

    // Optimistic UI state update
    const updatedTasks = (routine.tasks || []).map((t: any) => {
      if (t.id === taskId) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });

    const completedCount = updatedTasks.filter((t: any) => t.isCompleted).length;
    const isAllCompleted = updatedTasks.length > 0 && completedCount === updatedTasks.length;

    setRoutine({
      ...routine,
      tasks: updatedTasks,
      completedCount,
      isAllCompleted,
    });

    try {
      const res = await axios.post('/api/study-planner', {
        action: 'toggle-task',
        userEmail: activeEmail,
        taskId,
      });

      if (res.data.success) {
        setRoutine(res.data.routine);
        toast.success(res.data.message);
      }
    } catch (err: any) {
      // Rollback on failure
      setRoutine(previousRoutine);
      toast.error(err?.response?.data?.error || 'Failed to update task');
    }
  };

  // Add Custom Task
  const handleAddTask = async (values: any) => {
    setAddingTask(true);
    try {
      const res = await axios.post('/api/study-planner', {
        action: 'add-task',
        userEmail: activeEmail,
        taskData: {
          title: values.title,
          slot: values.slot,
          subject: values.subject,
          estimatedMinutes: values.estimatedMinutes || 30,
        },
      });

      if (res.data.success) {
        setRoutine(res.data.routine);
        toast.success(res.data.message);
        setAddTaskModalOpen(false);
        addTaskForm.resetFields();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await axios.post('/api/study-planner', {
        action: 'delete-task',
        userEmail: activeEmail,
        taskId,
      });

      if (res.data.success) {
        setRoutine(res.data.routine);
        toast.success(res.data.message);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to delete task');
    }
  };

  // Save Reflection
  const handleSaveReflection = async () => {
    setSavingReflection(true);
    try {
      const res = await axios.post('/api/study-planner', {
        action: 'save-reflection',
        userEmail: activeEmail,
        reflection: reflectionText,
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save reflection');
    } finally {
      setSavingReflection(false);
    }
  };

  // Filter Tasks by Slot
  const filteredTasks = (routine?.tasks || []).filter((task: any) => {
    if (selectedSlot === 'all') return true;
    return task.slot === selectedSlot;
  });

  const completionPercent =
    routine?.totalTasks > 0
      ? Math.round((routine.completedCount / routine.totalTasks) * 100)
      : 0;

  // Format Timer text mm:ss
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white pt-8 pb-12 px-4 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Top Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <CalendarOutlined className="text-teal-400" />
              ASPIRANT STUDY ROUTINE & PLANNER
            </span>

            <div className="flex items-center gap-3">
              <div className="bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 rounded-full flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <FireOutlined className="text-amber-400" />
                <span>আজকের ফোকাস: {routine?.focusMinutes || 0} মিনিট</span>
              </div>
              <div className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-slate-200">
                সর্বমোট ফোকাস: {totalFocusMinutes} মিনিট
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight m-0">
              দৈনিক পড়ার রুটিন, সিলেবাস ট্র্যাকার ও পোমোডোরো
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed m-0">
              বিসিএস ও ব্যাংক প্রস্তুতির প্রতিটি দিনকে নিখুঁতভাবে সাজান। সকাল, দুপুর ও রাতের নির্ধারিত পড়াশোনা সম্পন্ন করে আনব্রোকেন ডিসিপ্লিন গড়ে তুলুন।
            </p>
          </div>

          {/* Live Exam Countdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {countdowns.map((exam, idx) => (
              <div
                key={idx}
                className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                    {exam.cadreCategory}
                  </span>
                  <span className="font-bold text-xs text-white block mt-0.5">
                    {exam.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none block">
                    {exam.daysLeft}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">দিন বাকি</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 -mt-6 space-y-6">
        {/* Guest Mode Notice */}
        {!session?.user?.email && (
          <div className="bg-amber-50/90 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <BulbOutlined className="text-amber-600 text-base shrink-0" />
              <div className="text-xs">
                <span className="font-black block sm:inline">আপনি গেস্ট মোডে স্টাডি প্ল্যানার ব্যবহার করছেন।</span>
                <span className="text-amber-700 ml-0 sm:ml-1 font-medium">
                  আপনার পড়ার ধারাবাহিকতা, রুটিন ও অর্জিত XP ক্লাউডে স্থায়ীভাবে সংরক্ষণ করতে গুগল দিয়ে লগইন করুন।
                </span>
              </div>
            </div>
            <Button
              size="small"
              type="primary"
              onClick={() => signIn('google')}
              className="bg-amber-600 hover:!bg-amber-700 rounded-xl font-bold text-xs shrink-0"
            >
              গুগল দিয়ে লগইন
            </Button>
          </div>
        )}
        {/* Progress & Quick Stats Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-black text-teal-800 uppercase tracking-wider">
                আজকের অগ্রগতি
              </span>
              <span className="bg-teal-100 text-teal-800 text-xs font-black px-2 py-0.5 rounded-full">
                {routine?.completedCount || 0} / {routine?.totalTasks || 0} টাস্ক সম্পন্ন
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0">
              {routine?.isAllCompleted
                ? 'অভিনন্দন! আজকের সমস্ত পড়ার লক্ষ্য সম্পন্ন হয়েছে!'
                : `আজকের রুটিনের ${completionPercent}% কাজ সম্পন্ন`}
            </h3>
            <p className="text-xs text-slate-500 max-w-xl m-0">
              প্রতিদিনের রুটিন সম্পন্ন করলে আপনার একাউন্টে +৩০ XP বোনাস ও রুটিন চ্যাম্পিয়ন পদক যোগ হবে।
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <Progress
              type="circle"
              percent={completionPercent}
              strokeColor="#0d9488"
              size={85}
              format={(percent) => (
                <span className="text-sm font-black text-slate-900">{percent}%</span>
              )}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddTaskModalOpen(true)}
              className="bg-teal-600 hover:!bg-teal-500 font-bold rounded-2xl h-11 px-5 border-none shadow-sm"
            >
              নতুন টাস্ক যোগ করুন
            </Button>
          </div>
        </div>

        {/* 2-Column Grid: Left: Routine Tasks | Right: Pomodoro & Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: ROUTINE TASKS */}
          <div className="lg:col-span-2 space-y-4">
            {/* Slot Filter Toolbar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { key: 'all', label: 'সব সময়' },
                  { key: 'morning', label: 'সকাল (Morning)' },
                  { key: 'afternoon', label: 'দুপুর (Afternoon)' },
                  { key: 'evening', label: 'সন্ধ্যা (Evening)' },
                  { key: 'night', label: 'রাত (Night)' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedSlot(s.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSlot === s.key
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={fetchPlanner}
                loading={loading}
                className="rounded-lg text-xs shrink-0"
              />
            </div>

            {/* Task List */}
            {loading ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
                <Spin size="large" tip="রুটিন লোড হচ্ছে..." />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <BookOutlined className="text-3xl text-slate-400" />
                <h4 className="text-sm font-black text-slate-800 m-0">এই স্লটে কোন টাস্ক নেই</h4>
                <p className="text-xs text-slate-500">
                  উপরে &quot;নতুন টাস্ক যোগ করুন&quot; বাটনে ক্লিক করে পড়ার লক্ষ্য নির্ধারণ করুন।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task: any, idx: number) => {
                  return (
                    <motion.div
                      key={task.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        task.isCompleted
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-teal-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Checkbox Icon */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            task.isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'border-2 border-slate-300 hover:border-teal-600'
                          }`}
                        >
                          {task.isCompleted && <CheckOutlined className="text-xs font-black" />}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <h4
                            className={`text-sm sm:text-base font-black m-0 leading-snug transition-all ${
                              task.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <Tag color="cyan" className="font-bold rounded border-none capitalize m-0">
                              {task.subject || 'General'}
                            </Tag>

                            <Tag color="purple" className="font-bold rounded border-none capitalize m-0">
                              {task.slot === 'morning'
                                ? 'সকাল'
                                : task.slot === 'afternoon'
                                ? 'দুপুর'
                                : task.slot === 'evening'
                                ? 'সন্ধ্যা'
                                : task.slot === 'night'
                                ? 'রাত'
                                : 'যে কোনো সময়'}
                            </Tag>

                            <span className="text-slate-400 flex items-center gap-1 ml-1">
                              <ClockCircleOutlined /> ~{task.estimatedMinutes} মিনিট
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Custom Task */}
                      {!task.isDefaultRecommended && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                        >
                          <DeleteOutlined />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Daily Reflection & Notes */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <BulbOutlined className="text-amber-500 text-lg" />
                <h4 className="font-black text-slate-900 text-base m-0">
                  দৈনিক আত্মবিশ্লেষণ ও নোট (Daily Reflection)
                </h4>
              </div>
              <p className="text-xs text-slate-500 m-0">
                আজকের পড়ার কী অর্জন হলো এবং আগামীকালের জন্য কী কী বিষয় জোর দিতে হবে তা লিখে রাখুন।
              </p>
              <TextArea
                rows={3}
                placeholder="যেমন: আজ সংবিধানের ১ম ও ২য় ভাগ ভালো রিভিশন হয়েছে। কাল সকালে প্রিপজিশন এবং লাভ-ক্ষতির অংক সমাধান করতে হবে..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="rounded-2xl text-xs sm:text-sm"
              />
              <div className="flex justify-end pt-1">
                <Button
                  type="primary"
                  loading={savingReflection}
                  onClick={handleSaveReflection}
                  className="bg-slate-900 hover:!bg-slate-800 font-bold rounded-xl text-xs h-9 border-none"
                >
                  নোট সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: POMODORO TIMER & WEEKLY HEATMAP */}
          <div className="space-y-6">
            {/* 1. Pomodoro Focus Timer Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-lg border border-slate-800 text-center space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ThunderboltOutlined />
                  POMODORO FOCUS
                </span>
                <span className="text-xs text-slate-400">
                  {timerMode === 'study' ? '২৫ মিনিট ডিপ ফোকাস' : '৫ মিনিট ব্রেক'}
                </span>
              </div>

              {/* Big Timer Display */}
              <div className="py-2">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-widest font-mono">
                  {formatTimer(pomodoroSeconds)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="primary"
                  icon={isTimerRunning ? <PauseCircleFilled /> : <PlayCircleFilled />}
                  onClick={toggleTimer}
                  className={`font-black rounded-2xl h-11 px-6 border-none text-sm ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:!bg-amber-400 text-slate-950'
                      : 'bg-emerald-500 hover:!bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isTimerRunning ? 'বিরতি (Pause)' : 'শুরু করুন (Start)'}
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => resetTimer(timerMode)}
                  className="bg-white/10 hover:!bg-white/20 !text-white border-white/20 rounded-2xl h-11"
                >
                  রিসেট
                </Button>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-around text-xs text-slate-300">
                <button
                  onClick={() => resetTimer('study')}
                  className={`font-bold transition-colors ${
                    timerMode === 'study' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  পড়া (২৫ মি.)
                </button>
                <span>•</span>
                <button
                  onClick={() => resetTimer('break')}
                  className={`font-bold transition-colors ${
                    timerMode === 'break' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  শর্ট ব্রেক (৫ মি.)
                </button>
              </div>
            </div>

            {/* 2. 7-Day Accountability Heatmap */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm m-0">
                  বিগত ৭ দিনের ধারাবাহিকতা (Weekly Streak)
                </h4>
                <FireOutlined className="text-amber-500 text-base" />
              </div>

              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {weeklyHistory.map((day, i) => {
                  const dayName = new Date(day.date).toLocaleDateString('bn-BD', {
                    weekday: 'narrow',
                  });
                  const isDone = day.isAllCompleted;
                  const ratio = day.totalTasks > 0 ? day.completedCount / day.totalTasks : 0;

                  return (
                    <div key={i} className="text-center space-y-1">
                      <div
                        className={`h-12 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border transition-all ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                            : ratio > 0
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                        title={`${day.date}: ${day.completedCount}/${day.totalTasks} tasks completed`}
                      >
                        {isDone ? <CheckOutlined className="text-xs" /> : `${Math.round(ratio * 100)}%`}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-bold">
                        {dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 text-center m-0 pt-1">
                ধারাবাহিকতা বিসিএস ও ব্যাংকে ক্যাডার হওয়ার একমাত্র গোপন চাবিকাঠি।
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <PlusOutlined className="text-teal-600" />
            <span>নতুন পড়ার লক্ষ্য যুক্ত করুন</span>
          </div>
        }
        open={addTaskModalOpen}
        onCancel={() => setAddTaskModalOpen(false)}
        footer={null}
        width={480}
        centered
        className="font-sans"
      >
        <Form form={addTaskForm} layout="vertical" onFinish={handleAddTask} className="pt-2">
          <Form.Item
            label="পড়ার টপিক বা অধ্যায়ের নাম"
            name="title"
            rules={[{ required: true, message: 'টপিকের নাম লিখুন' }]}
          >
            <Input placeholder="যেমন: সাধারণ বিজ্ঞান - ভিটামিন ও পুষ্টি উপাদান" className="rounded-xl font-bold" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="সময় স্লট (Slot)"
              name="slot"
              initialValue="morning"
              rules={[{ required: true }]}
            >
              <Select className="rounded-xl">
                <Option value="morning">সকাল (Morning)</Option>
                <Option value="afternoon">দুপুর (Afternoon)</Option>
                <Option value="evening">সন্ধ্যা (Evening)</Option>
                <Option value="night">রাত (Night)</Option>
                <Option value="anytime">যে কোনো সময়</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="আনুমানিক সময় (মিনিট)"
              name="estimatedMinutes"
              initialValue={30}
            >
              <Select className="rounded-xl">
                <Option value={15}>১৫ মিনিট</Option>
                <Option value={30}>৩০ মিনিট</Option>
                <Option value={45}>৪৫ মিনিট</Option>
                <Option value={60}>৬০ মিনিট</Option>
                <Option value={90}>৯০ মিনিট</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="বিষয় (Subject)" name="subject" initialValue="General">
            <Select className="rounded-xl">
              <Option value="English">ইংরেজি</Option>
              <Option value="Bangla">বাংলা</Option>
              <Option value="Bangladesh Affairs">বাংলাদেশ বিষয়াবলী</Option>
              <Option value="International">আন্তর্জাতিক বিষয়াবলী</Option>
              <Option value="Math">গণিত ও মানসিক দক্ষতা</Option>
              <Option value="Science & ICT">বিজ্ঞান ও তথ্যপ্রযুক্তি</Option>
              <Option value="General">সাধারণ প্রস্তুতি</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button onClick={() => setAddTaskModalOpen(false)} className="rounded-xl font-bold">
              বাতিল
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addingTask}
              className="bg-teal-600 hover:!bg-teal-500 font-bold rounded-xl border-none"
            >
              টাস্ক সংরক্ষণ করুন
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
