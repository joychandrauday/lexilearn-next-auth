'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  DashboardOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  SafetyCertificateFilled,
  FireOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  RobotOutlined,
  PlusOutlined,
  BarChartOutlined,
  ReloadOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  BulbOutlined,
  TagsOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  Button,
  Table,
  Tag,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Progress,
  message,
  Tabs,
  Slider,
  Badge,
  Popconfirm,
} from 'antd';
import { useSession } from 'next-auth/react';

const { TextArea } = Input;
const { Option } = Select;

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Stats Data
  const [stats, setStats] = useState<any>(null);
  const [distribution, setDistribution] = useState<any>(null);
  const [recentWords, setRecentWords] = useState<any[]>([]);
  const [topMistakes, setTopMistakes] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Vocabulary Tab State
  const [words, setWords] = useState<any[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordSearch, setWordSearch] = useState('');
  const [wordExamFilter, setWordExamFilter] = useState('all');
  const [wordPage, setWordPage] = useState(1);
  const [totalWordsCount, setTotalWordsCount] = useState(0);

  // Edit Word Modal
  const [editingWord, setEditingWord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [savingEdit, setSavingEdit] = useState(false);

  // AI Past-Paper Importer State
  const [rawExamText, setRawExamText] = useState('');
  const [importerExamName, setImporterExamName] = useState('45th BCS Preliminary');
  const [importing, setImporting] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);

  // Contribution Moderation State
  const [contributions, setContributions] = useState<any[]>([]);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [contribStatusFilter, setContribStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [contribTypeFilter, setContribTypeFilter] = useState<'all' | 'feed_post' | 'word' | 'exam_tag'>('all');
  const [contribSearch, setContribSearch] = useState('');
  const [pendingCounts, setPendingCounts] = useState({ total: 0, feedPosts: 0, words: 0, examTags: 0 });
  const [processingActionId, setProcessingActionId] = useState<string | null>(null);

  // 1. Fetch Admin Telemetry & Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get('/api/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setDistribution(res.data.distribution);
        setRecentWords(res.data.recentWords || []);
        setTopMistakes(res.data.topMistakes || []);
      }
    } catch {
      message.error('অ্যাডমিন পরিসংখ্যান লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Contributions List
  const fetchContributions = useCallback(async () => {
    setLoadingContributions(true);
    try {
      const res = await axios.get('/api/admin/contributions', {
        params: {
          status: contribStatusFilter,
          type: contribTypeFilter,
          search: contribSearch,
        },
      });
      if (res.data.success) {
        setContributions(res.data.items || []);
        if (res.data.counts) {
          setPendingCounts(res.data.counts);
        }
      }
    } catch {
      message.error('কন্ট্রিবিউশন তালিকা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoadingContributions(false);
    }
  }, [contribStatusFilter, contribTypeFilter, contribSearch]);

  const handleContributionAction = async (item: any, action: 'approve' | 'reject') => {
    setProcessingActionId(item.id);
    try {
      const res = await axios.patch('/api/admin/contributions', {
        id: item.id,
        type: item.type,
        action,
        tag: item.details?.examTag,
        userEmail: item.contributor?.email,
      });

      if (res.data.success) {
        message.success(res.data.message);
        fetchContributions();
        fetchStats();
      } else {
        message.error(res.data.error || 'অ্যাকশন সম্পন্ন করা যায়নি');
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || 'ত্রুটি হয়েছে');
    } finally {
      setProcessingActionId(null);
    }
  };

  useEffect(() => {
    fetchStats();
    axios
      .get('/api/admin/contributions?status=pending')
      .then((res) => {
        if (res.data.success && res.data.counts) {
          setPendingCounts(res.data.counts);
        }
      })
      .catch(() => {});
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'contributions') {
      fetchContributions();
    }
  }, [activeTab, fetchContributions]);

  // 2. Fetch Words for Vocabulary Management Table
  const fetchWordsList = useCallback(async () => {
    setWordsLoading(true);
    try {
      const params: any = {
        limit: 50,
        page: wordPage,
        sort: 'recent',
      };
      if (wordSearch) params.search = wordSearch;
      if (wordExamFilter !== 'all') params.exam = wordExamFilter;

      const res = await axios.get('/api/words', { params });
      if (res.data.success) {
        setWords(res.data.data || []);
        setTotalWordsCount(res.data.meta?.total || 0);
      }
    } catch {
      message.error('শব্দ তালিকা লোড করা যায়নি');
    } finally {
      setWordsLoading(false);
    }
  }, [wordPage, wordSearch, wordExamFilter]);

  useEffect(() => {
    if (activeTab === 'words') {
      fetchWordsList();
    }
  }, [activeTab, fetchWordsList]);

  // Quick 100% Verify
  const handleQuickVerify = async (wordId: string) => {
    try {
      const res = await axios.patch('/api/admin/stats', {
        wordId,
        action: 'quick-verify',
      });
      if (res.data.success) {
        message.success(res.data.message);
        setWords((prev) =>
          prev.map((w) =>
            w._id === wordId
              ? { ...w, verificationScore: 100, verificationStatus: 'verified' }
              : w
          )
        );
        fetchStats();
      }
    } catch {
      message.error('ভেরিফাই করতে ব্যর্থ হয়েছে');
    }
  };

  // AI Auto-Enrich word
  const handleAIEnrich = async (wordId: string) => {
    message.loading({ content: 'এআই দ্বারা শব্দ বিশ্লেষণ করা হচ্ছে...', key: 'enrich' });
    try {
      const res = await axios.patch('/api/admin/stats', {
        wordId,
        action: 'ai-enrich',
      });
      if (res.data.success) {
        message.success({ content: res.data.message, key: 'enrich' });
        setWords((prev) => prev.map((w) => (w._id === wordId ? res.data.word : w)));
        fetchStats();
      }
    } catch {
      message.error({ content: 'এআই বিশ্লেষণ ব্যর্থ হয়েছে', key: 'enrich' });
    }
  };

  // Open Edit Modal
  const openEditModal = (record: any) => {
    setEditingWord(record);
    editForm.setFieldsValue({
      word: record.word,
      bangla: record.bangla,
      meaning: record.meaning,
      partOfSpeech: record.partOfSpeech || 'noun',
      examTags: Array.isArray(record.examTags) ? record.examTags.join(', ') : record.exam || '',
      mnemonic: record.mnemonic || '',
      example: record.example || '',
      verificationScore: record.verificationScore || 90,
    });
    setEditModalOpen(true);
  };

  // Save Word Edits
  const handleSaveEdit = async (values: any) => {
    if (!editingWord) return;
    setSavingEdit(true);
    try {
      const res = await axios.patch('/api/admin/stats', {
        wordId: editingWord._id,
        ...values,
      });

      if (res.data.success) {
        message.success(res.data.message);
        setWords((prev) => prev.map((w) => (w._id === editingWord._id ? res.data.word : w)));
        setEditModalOpen(false);
        fetchStats();
      }
    } catch {
      message.error('সংরক্ষণে ত্রুটি হয়েছে');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete word from DB
  const handleDeleteWord = (record: any) => {
    Modal.confirm({
      title: `"${record.word}" স্থায়ীভাবে মুছে ফেলতে চান?`,
      content: 'এই শব্দটি ডেটাবেস থেকে মুছে ফেলা হবে।',
      okText: 'হ্যাঁ, মুছুন',
      okType: 'danger',
      cancelText: 'বাতিল',
      centered: true,
      onOk: async () => {
        try {
          await axios.delete('/api/words', {
            data: { wordId: record._id, userEmail: record.userEmail },
          });
          message.success('শব্দটি মুছে ফেলা হয়েছে');
          setWords((prev) => prev.filter((w) => w._id !== record._id));
          fetchStats();
        } catch {
          message.error('শব্দ মুছতে ব্যর্থ হয়েছে');
        }
      },
    });
  };

  // AI Past-Paper Question Importer
  const handleParseQuestions = async () => {
    if (!rawExamText.trim()) return;
    setImporting(true);
    try {
      const res = await axios.post('/api/admin/import', {
        rawText: rawExamText,
        exam: importerExamName,
        saveDirectly: true,
      });

      if (res.data.success && res.data.questions) {
        setParsedQuestions(res.data.questions);
        message.success(res.data.message || 'প্রশ্ন সফলভাবে পার্স ও সংরক্ষণ করা হয়েছে!');
        fetchStats();
      } else {
        message.error(res.data.message || 'প্রশ্ন পার্স করা সম্ভব হয়নি');
      }
    } catch {
      message.error('ইম্পোর্ট প্রক্রিয়ায় ত্রুটি হয়েছে');
    } finally {
      setImporting(false);
    }
  };

  // Columns for Vocabulary Management
  const wordColumns = [
    {
      title: 'শব্দ',
      dataIndex: 'word',
      key: 'word',
      width: 170,
      render: (text: string, record: any) => (
        <div>
          <span className="capitalize font-black text-gray-900 block text-base">{text}</span>
          <span className="text-[11px] text-gray-400 font-semibold">{record.partOfSpeech || 'noun'}</span>
        </div>
      ),
    },
    {
      title: 'বাংলা অর্থ',
      dataIndex: 'bangla',
      key: 'bangla',
      render: (text: string) => (
        <span className="font-bold text-emerald-800 text-sm">{text || '—'}</span>
      ),
    },
    {
      title: 'বিগত পরীক্ষার ট্যাগ',
      key: 'examTags',
      render: (_: any, record: any) => {
        const tags = Array.isArray(record.examTags) && record.examTags.length > 0 ? record.examTags : [record.exam || 'BCS'];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((t: string, i: number) => (
              <Tag key={i} color="blue" className="text-[11px] font-bold border-none m-0">
                {t}
              </Tag>
            ))}
            {record.frequencyCount >= 2 && (
              <Tag color="volcano" className="text-[10px] font-black border-none m-0 flex items-center gap-0.5">
                <FireOutlined /> {record.frequencyCount} বার
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'যাচাই স্কোর',
      dataIndex: 'verificationScore',
      key: 'verificationScore',
      width: 140,
      render: (score: number) => {
        const val = score || 90;
        return (
          <div className="space-y-1">
            <span className="text-xs font-black text-gray-800 flex items-center gap-1">
              <SafetyCertificateFilled className={val >= 90 ? 'text-emerald-600' : 'text-blue-500'} />
              {val}% ভেরিফাইড
            </span>
            <Progress percent={val} size="small" showInfo={false} strokeColor="#059669" />
          </div>
        );
      },
    },
    {
      title: 'অ্যাডমিন অ্যাকশন',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="small"
            icon={<CheckCircleFilled className="text-emerald-600" />}
            onClick={() => handleQuickVerify(record._id)}
            title="১০০% ভেরিফাই করুন"
            className="rounded-lg text-xs font-bold"
          >
            ভেরিফাই
          </Button>
          <Button
            size="small"
            icon={<RobotOutlined className="text-blue-600" />}
            onClick={() => handleAIEnrich(record._id)}
            title="এআই দিয়ে তথ্য সমৃদ্ধ করুন"
            className="rounded-lg text-xs"
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="rounded-lg text-xs"
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteWord(record)}
            className="rounded-lg text-xs"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-slate-50 to-white font-sans pb-28 md:pb-16">
      {/* Top Admin Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-emerald-950 text-white px-6 py-6 border-b border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-gray-400 hover:text-emerald-400 flex items-center gap-1 text-xs font-bold transition"
              >
                <ArrowLeftOutlined /> সাইটে ফিরুন
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-wider bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                অ্যাডমিন প্যানেল
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 m-0">
              <DashboardOutlined className="text-emerald-400" />
              <span>লেক্সিলার্ন সেন্ট্রাল কন্ট্রোল সেন্টার</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 m-0">
              ভোকাবুলারি ব্যাংক, মাল্টি-এক্সাম ট্যাগিং, বাগধারা কোষ এবং এআই প্রশ্ন ইম্পোর্টার ব্যবস্থাপনা
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchStats();
                if (activeTab === 'words') fetchWordsList();
                if (activeTab === 'contributions') fetchContributions();
              }}
              className="rounded-xl font-bold bg-white/10 hover:!bg-white/20 !text-white border-white/20"
            >
              রিফ্রেশ
            </Button>
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => setActiveTab('contributions')}
              className="bg-amber-600 hover:!bg-amber-500 font-bold rounded-xl border-none flex items-center gap-1.5"
            >
              <span>পেন্ডিং অনুমোদন</span>
              {pendingCounts.total > 0 && (
                <span className="bg-amber-400 text-gray-950 text-xs px-2 py-0.5 rounded-full font-black">
                  {pendingCounts.total}
                </span>
              )}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setActiveTab('words')}
              className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl border-none"
            >
              শব্দ ব্যবস্থাপনা
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-gray-200 shadow-xs mb-6 flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'ড্যাশবোর্ড ও মেট্রিক্স', icon: BarChartOutlined },
            {
              key: 'contributions',
              label: 'কন্ট্রিবিউশন অনুমোদন',
              icon: SafetyCertificateOutlined,
              badge: pendingCounts.total,
            },
            { key: 'words', label: 'ভোকাবুলারি ডাটাবেস', icon: BookOutlined },
            { key: 'importer', label: 'এআই প্রশ্ন ইম্পোর্টার', icon: RobotOutlined },
            { key: 'mistakes', label: 'শিক্ষার্থীদের ভুল ব্যাংক', icon: WarningOutlined },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ml-1 ${
                      isActive ? 'bg-amber-400 text-gray-900' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Pending Approvals Notice Banner */}
            {pendingCounts.total > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    <ClockCircleOutlined />
                  </div>
                  <div>
                    <h4 className="font-black text-amber-950 text-sm m-0">
                      {pendingCounts.total} টি নতুন কন্ট্রিবিউশন পর্যালোচনার অপেক্ষায় আছে
                    </h4>
                    <p className="text-xs text-amber-800 m-0">
                      ইউজারদের ফিড পোস্ট ({pendingCounts.feedPosts}), নতুন শব্দ ({pendingCounts.words}) এবং পরীক্ষার ট্যাগ ({pendingCounts.examTags}) অনুমোদন করে পয়েন্ট যোগ করুন।
                    </p>
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={() => setActiveTab('contributions')}
                  className="bg-amber-600 hover:!bg-amber-500 font-bold rounded-xl border-none shrink-0"
                >
                  অনুমোদন করুন ({pendingCounts.total})
                </Button>
              </div>
            )}

            {/* Stat Cards */}
            {loadingStats ? (
              <div className="py-20 text-center">
                <Spin size="large" tip="পরিসংখ্যান লোড হচ্ছে..." />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                    <span className="text-xs font-bold text-gray-400 block mb-1">মোট শব্দভাণ্ডার</span>
                    <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
                      {stats?.totalWords || 0}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <BookOutlined /> গ্লোবাল রিপোজিটরি
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                    <span className="text-xs font-bold text-gray-400 block mb-1">মোস্ট রিপিটেড শব্দ</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 block">
                      {stats?.mostRepeatedWords || 0}
                    </span>
                    <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1 mt-1">
                      <FireOutlined /> একাধিক পরীক্ষায় আসা
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                    <span className="text-xs font-bold text-gray-400 block mb-1">ভেরিফাইড আইটেম</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">
                      {stats?.verifiedWords || 0}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <SafetyCertificateFilled /> ৯০%+ নির্ভুলতা
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                    <span className="text-xs font-bold text-gray-400 block mb-1">বাংলা বাগধারা</span>
                    <span className="text-2xl sm:text-3xl font-black text-teal-700 block">
                      {stats?.totalBaghdhara || 0}
                    </span>
                    <span className="text-[11px] text-teal-600 font-bold flex items-center gap-1 mt-1">
                      <FileTextOutlined /> বর্ণানুক্রমিক কোষ
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                    <span className="text-xs font-bold text-gray-400 block mb-1">ভুল ব্যাংক এন্ট্রি</span>
                    <span className="text-2xl sm:text-3xl font-black text-rose-600 block">
                      {stats?.totalMistakes || 0}
                    </span>
                    <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                      <WarningOutlined /> শিক্ষার্থীদের ভুল
                    </span>
                  </div>
                </div>

                {/* Exam Distribution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
                    <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                      <TagsOutlined className="text-emerald-600" />
                      <span>পরীক্ষা ক্যাটাগরি ভিত্তিক উপস্থিতি</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>বিসিএস (BCS Examination)</span>
                          <span className="text-emerald-700">{distribution?.bcs || 0} টি</span>
                        </div>
                        <Progress
                          percent={Math.min(100, Math.round(((distribution?.bcs || 0) / (stats?.totalWords || 1)) * 100))}
                          strokeColor="#059669"
                          showInfo={false}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>ব্যাংক নিয়োগ (Bank AD & Officer)</span>
                          <span className="text-blue-700">{distribution?.bank || 0} টি</span>
                        </div>
                        <Progress
                          percent={Math.min(100, Math.round(((distribution?.bank || 0) / (stats?.totalWords || 1)) * 100))}
                          strokeColor="#2563eb"
                          showInfo={false}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>প্রাথমিক শিক্ষক (Primary DPE)</span>
                          <span className="text-teal-700">{distribution?.primary || 0} টি</span>
                        </div>
                        <Progress
                          percent={Math.min(100, Math.round(((distribution?.primary || 0) / (stats?.totalWords || 1)) * 100))}
                          strokeColor="#0d9488"
                          showInfo={false}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>শিক্ষক নিবন্ধন (NTRCA)</span>
                          <span className="text-purple-700">{distribution?.ntrca || 0} টি</span>
                        </div>
                        <Progress
                          percent={Math.min(100, Math.round(((distribution?.ntrca || 0) / (stats?.totalWords || 1)) * 100))}
                          strokeColor="#7c3aed"
                          showInfo={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Traps in Negative Marking */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
                    <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                      <WarningOutlined className="text-rose-600" />
                      <span>শিক্ষার্থীদের সবচেয়ে বেশি ভুল করা প্রশ্নসমূহ</span>
                    </h3>

                    {topMistakes.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">এখনো কোনো ভুলের রেকর্ড নেই</p>
                    ) : (
                      <div className="space-y-2.5">
                        {topMistakes.slice(0, 5).map((m: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-gray-900 capitalize block text-sm">
                                {m.wordOrTitle}
                              </span>
                              <span className="text-gray-500">
                                সঠিক অর্থ: <strong className="text-emerald-700">{m.correctMeaning}</strong>
                              </span>
                            </div>
                            <Tag color="error" className="font-bold border-none">
                              {m.failureCount} বার ভুল
                            </Tag>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: PENDING CONTRIBUTIONS MODERATION */}
        {activeTab === 'contributions' && (
          <div className="space-y-6">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold text-gray-400 block mb-1">মোট অপেক্ষমাণ</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 block">
                  {pendingCounts.total}
                </span>
                <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1 mt-1">
                  <ClockCircleOutlined /> অনুমোদনের অপেক্ষায়
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold text-gray-400 block mb-1">ফিড পোস্ট</span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 block">
                  {pendingCounts.feedPosts}
                </span>
                <span className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
                  <FileTextOutlined /> রিলস ও অভিজ্ঞতা
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold text-gray-400 block mb-1">ভোকাবুলারি শব্দ</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">
                  {pendingCounts.words}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <BookOutlined /> নতুন শব্দভাণ্ডার
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold text-gray-400 block mb-1">পরীক্ষার ট্যাগ</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-600 block">
                  {pendingCounts.examTags}
                </span>
                <span className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-1">
                  <TagsOutlined /> এক্সাম রেফারেন্স
                </span>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Type Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'সকল টাইপ' },
                  { key: 'feed_post', label: `ফিড পোস্ট (${pendingCounts.feedPosts})` },
                  { key: 'word', label: `নতুন শব্দ (${pendingCounts.words})` },
                  { key: 'exam_tag', label: `পরীক্ষার ট্যাগ (${pendingCounts.examTags})` },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setContribTypeFilter(t.key as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      contribTypeFilter === t.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Status Filter & Search */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Select
                  value={contribStatusFilter}
                  onChange={(val) => setContribStatusFilter(val)}
                  className="w-40"
                >
                  <Option value="pending">অপেক্ষমাণ (Pending)</Option>
                  <Option value="approved">অনুমোদিত (Approved)</Option>
                  <Option value="rejected">বাতিলকৃত (Rejected)</Option>
                  <Option value="all">সব স্ট্যাটাস</Option>
                </Select>

                <Input
                  placeholder="ইউজার বা বিষয় খুঁজুন..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={contribSearch}
                  onChange={(e) => setContribSearch(e.target.value)}
                  className="rounded-xl text-xs w-48 sm:w-56"
                />

                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchContributions}
                  loading={loadingContributions}
                  className="rounded-xl font-bold"
                >
                  রিফ্রেশ
                </Button>
              </div>
            </div>

            {/* Contributions List */}
            {loadingContributions ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-gray-200">
                <Spin size="large" tip="কন্ট্রিবিউশন তালিকা লোড হচ্ছে..." />
              </div>
            ) : contributions.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 space-y-2">
                <CheckCircleFilled className="text-4xl text-emerald-500" />
                <h3 className="font-black text-gray-800 text-base m-0">কোন পেন্ডিং কন্ট্রিবিউশন নেই</h3>
                <p className="text-xs text-gray-500">
                  সব কন্ট্রিবিউশন অনুমোদিত অথবা ফিল্টারের সাথে কোন রেকর্ড পাওয়া যায়নি।
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contributions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 p-5 shadow-xs transition-all flex flex-col md:flex-row items-start justify-between gap-4"
                  >
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Item Header Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {item.type === 'feed_post' && (
                          <Tag color="blue" className="font-bold text-xs rounded-lg px-2 py-0.5 border-none">
                            ফিড পোস্ট • {item.details?.postType || 'পোস্ট'}
                          </Tag>
                        )}
                        {item.type === 'word' && (
                          <Tag color="green" className="font-bold text-xs rounded-lg px-2 py-0.5 border-none">
                            নতুন শব্দ
                          </Tag>
                        )}
                        {item.type === 'exam_tag' && (
                          <Tag color="purple" className="font-bold text-xs rounded-lg px-2 py-0.5 border-none">
                            পরীক্ষার ট্যাগ
                          </Tag>
                        )}

                        {item.status === 'pending' && (
                          <Tag color="orange" className="font-bold text-xs rounded-lg px-2 py-0.5 border-none flex items-center gap-1">
                            <ClockCircleOutlined /> পর্যালোচনায় অপেক্ষমাণ
                          </Tag>
                        )}
                        {item.status === 'approved' && (
                          <Tag color="success" className="font-bold text-xs rounded-lg px-2 py-0.5 border-none flex items-center gap-1">
                            <CheckCircleOutlined /> অনুমোদিত
                          </Tag>
                        )}
                        {item.status === 'rejected' && (
                          <Tag color="error" className="font-bold text-xs rounded-lg px-2 py-0.5 border-none">
                            বাতিলকৃত
                          </Tag>
                        )}

                        <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ThunderboltOutlined className="text-amber-600" />
                          +{item.xpReward} XP রিওয়ার্ড
                        </span>
                      </div>

                      {/* Title & Contributor */}
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-gray-900 m-0">
                          {item.title}
                        </h3>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-700">{item.contributor.name}</span>
                          <span>•</span>
                          <span className="text-gray-400">{item.contributor.email}</span>
                          <span>•</span>
                          <span className="text-gray-400">
                            {new Date(item.createdAt).toLocaleString('bn-BD', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Details Box */}
                      {item.type === 'feed_post' && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                          {item.details?.content && (
                            <p className="text-gray-700 whitespace-pre-line m-0">
                              {item.details.content}
                            </p>
                          )}
                          {item.details?.vocabData && (
                            <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                              <span className="font-black text-emerald-800 text-sm">
                                {item.details.vocabData.word}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {item.details.vocabData.bangla}
                              </span>
                              {item.details.vocabData.meaning && (
                                <p className="text-gray-500 mt-1 m-0">
                                  {item.details.vocabData.meaning}
                                </p>
                              )}
                              {item.details.vocabData.mnemonic && (
                                <span className="text-amber-700 font-semibold block mt-1">
                                  ট্রিক: {item.details.vocabData.mnemonic}
                                </span>
                              )}
                            </div>
                          )}
                          {item.details?.mcqData && (
                            <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1.5">
                              <p className="font-bold text-gray-900 m-0">
                                {item.details.mcqData.question}
                              </p>
                              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                {item.details.mcqData.options?.map((opt: string, i: number) => {
                                  const isCorrect = opt === item.details.mcqData.correctAnswer;
                                  return (
                                    <div
                                      key={i}
                                      className={`px-2 py-1 rounded-md border ${
                                        isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                          : 'bg-gray-50 border-gray-200 text-gray-600'
                                      }`}
                                    >
                                      {opt} {isCorrect && '(সঠিক)'}
                                    </div>
                                  );
                                })}
                              </div>
                              {item.details.mcqData.explanation && (
                                <p className="text-gray-500 text-[11px] italic m-0 pt-1">
                                  ব্যাখ্যা: {item.details.mcqData.explanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {item.type === 'word' && (
                        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                          <p className="text-gray-700 m-0">
                            <strong>ইংরেজি সংজ্ঞা:</strong> {item.details?.meaning || 'সংজ্ঞা নেই'}
                          </p>
                          {item.details?.mnemonic && (
                            <p className="text-amber-800 m-0">
                              <strong>মনে রাখার ট্রিক:</strong> {item.details.mnemonic}
                            </p>
                          )}
                          {item.details?.example && (
                            <p className="text-gray-600 italic m-0">
                              <strong>বাক্য:</strong> {item.details.example}
                            </p>
                          )}
                        </div>
                      )}

                      {item.type === 'exam_tag' && (
                        <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100 text-xs">
                          <p className="text-gray-800 m-0">
                            শব্দ: <strong className="text-purple-900 capitalize text-sm">{item.details?.word}</strong> ({item.details?.bangla})
                          </p>
                          <p className="text-purple-700 font-black text-sm mt-1 m-0">
                            প্রস্তাবিত পরীক্ষার ট্যাগ: &quot;{item.details?.examTag}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                      {item.status === 'pending' ? (
                        <>
                          <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            loading={processingActionId === item.id}
                            onClick={() => handleContributionAction(item, 'approve')}
                            className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl border-none flex-1 md:w-44 text-xs h-9"
                          >
                            অনুমোদন করুন (+{item.xpReward} XP)
                          </Button>

                          <Popconfirm
                            title="কন্ট্রিবিউশনটি বাতিল করতে চান?"
                            description="এটি বাতিল করা হলে প্ল্যাটফর্মে প্রদর্শিত হবে না।"
                            onConfirm={() => handleContributionAction(item, 'reject')}
                            okText="হ্যাঁ, বাতিল করুন"
                            cancelText="না"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              danger
                              icon={<CloseOutlined />}
                              loading={processingActionId === item.id}
                              className="font-bold rounded-xl flex-1 md:w-44 text-xs h-9"
                            >
                              প্রত্যাখ্যান
                            </Button>
                          </Popconfirm>
                        </>
                      ) : item.status === 'approved' ? (
                        <Popconfirm
                          title="অনুমোদন বাতিল করতে চান?"
                          onConfirm={() => handleContributionAction(item, 'reject')}
                          okText="হ্যাঁ, বাতিল করুন"
                          cancelText="না"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            danger
                            size="small"
                            loading={processingActionId === item.id}
                            className="font-bold rounded-xl text-xs"
                          >
                            অনুমোদন বাতিল করুন
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Button
                          type="primary"
                          size="small"
                          loading={processingActionId === item.id}
                          onClick={() => handleContributionAction(item, 'approve')}
                          className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl border-none text-xs"
                        >
                          পুনরায় অনুমোদন করুন
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VOCABULARY DATABASE MANAGEMENT */}
        {activeTab === 'words' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Input
                  placeholder="শব্দ বা অর্থ লিখে খুঁজুন..."
                  prefix={<SearchOutlined />}
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  onPressEnter={() => {
                    setWordPage(1);
                    fetchWordsList();
                  }}
                  className="w-full sm:w-72 rounded-xl"
                  allowClear
                />

                <Select
                  value={wordExamFilter}
                  onChange={(val) => {
                    setWordExamFilter(val);
                    setWordPage(1);
                  }}
                  className="w-40 rounded-xl"
                >
                  <Option value="all">সকল পরীক্ষা</Option>
                  <Option value="bcs">বিসিএস (BCS)</Option>
                  <Option value="bank">ব্যাংক (BANK)</Option>
                  <Option value="primary">প্রাইমারি শিক্ষক</Option>
                </Select>
              </div>

              <span className="text-xs font-bold text-gray-500">
                মোট প্রাপ্ত: <strong className="text-emerald-700">{totalWordsCount}</strong> টি শব্দ
              </span>
            </div>

            <Table
              columns={wordColumns}
              dataSource={words}
              rowKey={(r) => r._id || r.word}
              loading={wordsLoading}
              pagination={{
                current: wordPage,
                pageSize: 50,
                total: totalWordsCount,
                showSizeChanger: false,
                onChange: (p) => setWordPage(p),
              }}
              scroll={{ x: 900 }}
              className="font-sans"
            />
          </div>
        )}

        {/* TAB 3: AI PAST-PAPER IMPORTER */}
        {activeTab === 'importer' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <RobotOutlined className="text-emerald-600 text-xl" />
              <h2 className="text-xl font-black text-gray-900 m-0">এআই পাস্ট-পেপার প্রশ্ন ইম্পোর্টার</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              বিসিএস, ব্যাংক বা প্রাইমারি পরীক্ষার বিগত প্রশ্নপত্রের টেক্সট বা শিটের লেখা হুবহু পেস্ট করুন।
              Groq (Llama 3.3 70B) ও Gemini AI স্বয়ংক্রিয়ভাবে প্রশ্ন, চারটি অপশন, সঠিক উত্তর ও বাংলা ব্যাখ্যা
              নির্ধারণ করে ডেটাবেসে রূপান্তর করবে।
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">পরীক্ষার নাম ও সংস্করণ</label>
                <Input
                  value={importerExamName}
                  onChange={(e) => setImporterExamName(e.target.value)}
                  placeholder="যেমন: 45th BCS Preliminary, Bangladesh Bank AD 2023..."
                  className="rounded-xl font-bold py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  কাঁচা প্রশ্ন টেক্সট (Raw Question Paper Text)
                </label>
                <TextArea
                  rows={8}
                  value={rawExamText}
                  onChange={(e) => setRawExamText(e.target.value)}
                  placeholder="এখানে পরীক্ষার প্রশ্ন পেস্ট করুন...
যেমন:
1. What is the synonym of 'CANDID'?
a) Frank b) Shy c) Secretive d) False
Answer: a

2. He died ___ overeating.
a) of b) from c) by d) for
Answer: b"
                  className="rounded-xl font-mono text-xs sm:text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleParseQuestions}
                  loading={importing}
                  disabled={!rawExamText.trim()}
                  icon={<ThunderboltOutlined />}
                  className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-xl h-11 px-8 border-none"
                >
                  এআই দিয়ে পার্স ও সংরক্ষণ করুন
                </Button>
              </div>
            </div>

            {/* Parsed Output Preview */}
            {parsedQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-black text-emerald-800 mb-4 flex items-center gap-1.5">
                  <CheckCircleFilled className="text-emerald-600" />
                  <span>সফলভাবে পার্সকৃত {parsedQuestions.length}টি প্রশ্ন ডেটাবেসে সংরক্ষিত হয়েছে</span>
                </h3>

                <div className="space-y-3">
                  {parsedQuestions.map((q: any, i: number) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs">
                      <div className="font-bold text-gray-900 text-sm mb-2">{q.question}</div>
                      <div className="grid grid-cols-2 gap-2 mb-2 text-gray-600">
                        {q.options?.map((opt: string, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border ${
                              opt === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 m-0 leading-relaxed">{q.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MISTAKE VAULT TELEMETRY */}
        {activeTab === 'mistakes' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <WarningOutlined className="text-rose-600 text-xl" />
              <h2 className="text-xl font-black text-gray-900 m-0">শিক্ষার্থীদের ভুল প্রশ্নের বিশ্লেষণ</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              নেগেটিভ মার্কিং পরীক্ষায় শিক্ষার্থীরা কোন কোন প্রশ্নে সবচেয়ে বেশি ভুল করছে তা পর্যবেক্ষণ করুন।
            </p>

            <div className="space-y-3">
              {topMistakes.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 text-base capitalize block">
                      {m.wordOrTitle}
                    </span>
                    <span className="text-emerald-700 font-semibold block mt-0.5">
                      সঠিক অর্থ: {m.correctMeaning}
                    </span>
                    {m.userFailedAnswer && (
                      <span className="text-rose-600 block mt-0.5">
                        শিক্ষার্থীর ভুল উত্তর ছিল: &quot;{m.userFailedAnswer}&quot;
                      </span>
                    )}
                  </div>
                  <Tag color="error" className="font-black text-xs px-3 py-1 rounded-full border-none">
                    {m.failureCount} বার ভুল হয়েছে
                  </Tag>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Word Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-black text-gray-900 text-base">
            <EditOutlined className="text-emerald-600" />
            <span>শব্দ সম্পাদনা ও ভেরিফিকেশন: &quot;{editingWord?.word}&quot;</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={560}
        centered
        className="font-sans"
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item label="ইংরেজি শব্দ" name="word" rules={[{ required: true }]}>
            <Input className="rounded-xl font-bold" />
          </Form.Item>

          <Form.Item label="বাংলা অর্থ" name="bangla" rules={[{ required: true }]}>
            <Input className="rounded-xl font-bold text-emerald-800" />
          </Form.Item>

          <Form.Item label="ইংরেজি সংজ্ঞা" name="meaning">
            <TextArea rows={2} className="rounded-xl text-xs" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="পদ (Part of Speech)" name="partOfSpeech">
              <Select>
                <Option value="noun">Noun</Option>
                <Option value="verb">Verb</Option>
                <Option value="adjective">Adjective</Option>
                <Option value="adverb">Adverb</Option>
                <Option value="preposition">Preposition</Option>
              </Select>
            </Form.Item>

            <Form.Item label="বিগত পরীক্ষার ট্যাগ (কমা দিয়ে লিখুন)" name="examTags">
              <Input placeholder="যেমন: ৪৪তম বিসিএস, BB AD 2022" className="rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item label="মনে রাখার দেশি ট্রিক (Mnemonic)" name="mnemonic">
            <Input className="rounded-xl" />
          </Form.Item>

          <Form.Item label="যাচাইকরণ স্কোর (Verification Score %)" name="verificationScore">
            <Slider min={50} max={100} />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button onClick={() => setEditModalOpen(false)} className="rounded-xl font-bold">
              বাতিল
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={savingEdit}
              className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl border-none"
            >
              পরিবর্তন সংরক্ষণ করুন
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
