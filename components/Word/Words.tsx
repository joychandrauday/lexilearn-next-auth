'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  Tag,
  Spin,
  message,
  Input,
  Select,
  Tooltip,
  Modal,
  Typography,
  Divider,
  Row,
  Col,
  Button,
  Form,
  AutoComplete,
  Drawer,
  Progress,
  Badge,
} from 'antd';
import {
  DeleteOutlined,
  SoundOutlined,
  PlusOutlined,
  FireOutlined,
  SafetyCertificateFilled,
  StarFilled,
  StarOutlined,
  CheckCircleFilled,
  LikeOutlined,
  TeamOutlined,
  BulbOutlined,
  CompassOutlined,
  TagsOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { IWord } from '../../lib/models/Word';
import { useSession, signIn } from 'next-auth/react';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const Words: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // URL sync params
  const urlSearch = searchParams.get('search') || '';
  const urlIntensity = searchParams.get('intensity') || undefined;
  const urlExam = searchParams.get('exam') || undefined;
  const urlFilter = searchParams.get('filter') || 'all';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const [words, setWords] = useState<any[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    repeatedCount: number;
    verifiedCount: number;
  }>({ total: 0, repeatedCount: 0, verifiedCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchText, setSearchText] = useState(urlSearch);
  const [intensityFilter, setIntensityFilter] = useState<string | undefined>(urlIntensity);
  const [examFilter, setExamFilter] = useState<string | undefined>(urlExam);
  const [activeTab, setActiveTab] = useState<string>(urlFilter);
  const [sortBy, setSortBy] = useState<'frequency' | 'verification' | 'alphabetical' | 'recent'>('frequency');
  const [currentPage, setCurrentPage] = useState(urlPage);

  // Selected word drawer
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add word modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const [form] = Form.useForm();

  // Add exam tag modal
  const [examTagModalVisible, setExamTagModalVisible] = useState(false);
  const [taggingWord, setTaggingWord] = useState<any | null>(null);
  const [customExamTag, setCustomExamTag] = useState('');
  const [taggingLoading, setTaggingLoading] = useState(false);

  const [modal, modalHolder] = Modal.useModal();

  // Scroll behavior: hide header on scroll down
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 140) {
        setHideHeader(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHideHeader(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchText) params.set('search', searchText);
    if (intensityFilter) params.set('intensity', intensityFilter);
    if (examFilter) params.set('exam', examFilter);
    if (activeTab && activeTab !== 'all') params.set('filter', activeTab);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const query = params.toString();
    router.replace(`/words${query ? `?${query}` : ''}`, { scroll: false });
  }, [searchText, intensityFilter, examFilter, activeTab, currentPage]);

  // Initial & Reactive Fetch
  useEffect(() => {
    fetchWords();
  }, [session, activeTab, sortBy]);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort: sortBy,
        limit: 100,
      };

      if (session?.user?.email) {
        params.user = session.user.email;
      }

      if (activeTab === 'saved') {
        params.savedOnly = 'true';
      } else if (activeTab === 'repeated') {
        params.filter = 'most-repeated';
      } else if (activeTab === 'verified') {
        params.filter = 'verified';
      }

      const res = await axios.get('/api/words', { params });
      if (res.data.success) {
        setWords(res.data.data || []);
        if (res.data.meta) {
          setMeta({
            total: res.data.meta.total || 0,
            repeatedCount: res.data.meta.repeatedCount || 0,
            verifiedCount: res.data.meta.verifiedCount || 0,
          });
        }
      }
    } catch (err) {
      console.error(err);
      message.error('শব্দভাণ্ডার লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Autocomplete suggestions
  const fetchSuggestions = async (value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    setFetchingSuggestions(true);
    try {
      const res = await axios.get(`https://api.datamuse.com/sug?s=${encodeURIComponent(value)}&max=8`);
      const filtered = res.data
        .map((item: any) => item.word)
        .filter((word: string) => !word.includes(' ') && word.length > 2);
      setSuggestions(filtered);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    } finally {
      setFetchingSuggestions(false);
    }
  };

  // Add word (reusing existing word if already in db)
  const handleAddWord = async (values: any) => {
    setAdding(true);
    try {
      const payload = {
        word: values.word.trim(),
        intensity: values.intensity || 'medium',
        exam: values.exam || 'bcs',
        examTag: values.examTag?.trim() || undefined,
        mnemonic: values.mnemonic?.trim() || undefined,
        userEmail: session?.user?.email || 'community@lexilearn.com',
      };

      const res = await axios.post('/api/words', payload);

      if (res.data.success) {
        if (res.data.reused) {
          message.success(
            `"${values.word}" পূর্বেই সংরক্ষিত ছিল! আপনার ডেকে যুক্ত ও ভেরিফিকেশন স্কোর আপডেট হয়েছে।`
          );
        } else {
          message.success(`"${values.word}" সফলভাবে AI ভেরিফিকেশনসহ যুক্ত হয়েছে!`);
        }
        form.resetFields();
        setSuggestions([]);
        setAddModalVisible(false);
        fetchWords();
        setCurrentPage(1);
      } else {
        message.error(res.data.message || 'শব্দ সংরক্ষণে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'শব্দ সংরক্ষণে ত্রুটি');
    } finally {
      setAdding(false);
    }
  };

  // Toggle Save to personal deck
  const handleToggleSave = async (word: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!session?.user?.email) {
      message.info('আপনার ব্যক্তিগত ডেকে সেভ করতে অনুগ্রহ করে লগইন করুন');
      signIn('google');
      return;
    }

    try {
      const res = await axios.post(`/api/words/${word._id}/verify`, {
        action: 'toggle-save',
        userEmail: session.user.email,
      });

      if (res.data.success) {
        message.success(res.data.message);
        // Optimistic UI update
        setWords((prev) =>
          prev.map((w) => {
            if (w._id === word._id) {
              const currentSaved = Array.isArray(w.savedBy) ? w.savedBy : [];
              const isNowSaved = res.data.isSaved;
              const newSaved = isNowSaved
                ? [...currentSaved, session.user!.email!]
                : currentSaved.filter((email) => email !== session.user!.email);
              return { ...w, savedBy: newSaved, savedCount: newSaved.length };
            }
            return w;
          })
        );
        if (selectedWord?._id === word._id) {
          const currentSaved = Array.isArray(selectedWord.savedBy) ? selectedWord.savedBy : [];
          const isNowSaved = res.data.isSaved;
          const newSaved = isNowSaved
            ? [...currentSaved, session.user!.email!]
            : currentSaved.filter((email) => email !== session.user!.email);
          setSelectedWord({ ...selectedWord, savedBy: newSaved, savedCount: newSaved.length });
        }
      }
    } catch {
      message.error('ডেক আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  // Upvote / Verify word accuracy
  const handleUpvoteVerify = async (word: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const res = await axios.post(`/api/words/${word._id}/verify`, {
        action: 'upvote',
        userEmail: session?.user?.email,
      });

      if (res.data.success) {
        message.success(res.data.message);
        setWords((prev) =>
          prev.map((w) =>
            w._id === word._id
              ? {
                  ...w,
                  verificationScore: res.data.verificationScore,
                  upvotes: res.data.upvotes,
                  verificationStatus:
                    res.data.verificationScore >= 90 ? 'verified' : w.verificationStatus,
                }
              : w
          )
        );
        if (selectedWord?._id === word._id) {
          setSelectedWord({
            ...selectedWord,
            verificationScore: res.data.verificationScore,
            upvotes: res.data.upvotes,
          });
        }
      }
    } catch {
      message.error('যাচাই স্কোর আপডেটে সমস্যা হয়েছে');
    }
  };

  // Add past-exam tag
  const handleAddExamTag = async () => {
    if (!taggingWord || !customExamTag.trim()) return;

    setTaggingLoading(true);
    try {
      const res = await axios.post(`/api/words/${taggingWord._id}/verify`, {
        action: 'add-exam',
        examTag: customExamTag.trim(),
        userEmail: session?.user?.email,
      });

      if (res.data.success) {
        message.success(res.data.message);
        setWords((prev) =>
          prev.map((w) =>
            w._id === taggingWord._id
              ? {
                  ...w,
                  examTags: res.data.examTags,
                  frequencyCount: res.data.frequencyCount,
                  isMostRepeated: res.data.isMostRepeated,
                }
              : w
          )
        );
        setExamTagModalVisible(false);
        setCustomExamTag('');
      }
    } catch {
      message.error('পরীক্ষার ট্যাগ যুক্ত করতে সমস্যা হয়েছে');
    } finally {
      setTaggingLoading(false);
    }
  };

  // Delete word (removes from personal deck or database if owner)
  const handleDeleteWord = async (wordId: string) => {
    if (!session?.user?.email || !wordId) return;

    modal.confirm({
      title: 'শব্দটি আপনার ডেক থেকে সরাতে চান?',
      content: 'এটি আপনার ব্যক্তিগত রিভিশন তালিকা থেকে সরে যাবে।',
      okText: 'হ্যাঁ, সরান',
      okType: 'danger',
      cancelText: 'বাতিল',
      centered: true,
      onOk: async () => {
        try {
          const res = await axios.delete('/api/words', {
            data: { wordId, userEmail: session.user.email },
          });

          if (res.data.success) {
            message.success(res.data.message);
            fetchWords();
          }
        } catch {
          message.error('শব্দ সরাতে ব্যর্থ হয়েছে');
        }
      },
    });
  };

  const playTTS = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return <>{text}</>;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <Text mark key={i} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">
              {part}
            </Text>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const search = searchText.toLowerCase();
      const matchesSearch =
        !search ||
        word.word.toLowerCase().includes(search) ||
        (word.meaning || '').toLowerCase().includes(search) ||
        (word.bangla || '').toLowerCase().includes(search) ||
        (word.examTags || []).some((t) => t.toLowerCase().includes(search));

      const matchesIntensity = !intensityFilter || word.intensity === intensityFilter;
      const matchesExam =
        !examFilter ||
        word.exam === examFilter ||
        (word.examTags || []).some((t) => t.toLowerCase().includes(examFilter.toLowerCase()));

      return matchesSearch && matchesIntensity && matchesExam;
    });
  }, [words, searchText, intensityFilter, examFilter]);

  // Enhanced Columns showcasing Multi-Exam & Verification
  const columns = [
    {
      title: 'শব্দ ও উচ্চারণ',
      dataIndex: 'word',
      key: 'word',
      width: 220,
      render: (text: string, record: any) => {
        const isSaved = session?.user?.email && record.savedBy?.includes(session.user.email);

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="capitalize font-black text-lg sm:text-xl text-gray-900 tracking-tight">
                {highlightText(text, searchText)}
              </span>
              <button
                onClick={(e) => playTTS(record.word, e)}
                className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                title="উচ্চারণ শুনুন"
              >
                <SoundOutlined className="text-sm" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Tag color="cyan" className="font-bold border-none text-[11px] m-0">
                {record.partOfSpeech || 'noun'}
              </Tag>
              {record.savedCount > 1 && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <TeamOutlined /> {record.savedCount} জন পড়ছে
                </span>
              )}
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => a.word.localeCompare(b.word),
    },
    {
      title: 'বিগত পরীক্ষার উপস্থিতি (Multi-Exam)',
      key: 'examAppearances',
      width: 250,
      render: (_: any, record: IWord) => {
        const tags = Array.isArray(record.examTags) && record.examTags.length > 0
          ? record.examTags
          : [record.exam ? `${record.exam.toUpperCase()} Exam` : 'BCS Past Paper'];
        const isRepeated = (record.frequencyCount || 1) >= 2 || record.isMostRepeated;

        return (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            {isRepeated && (
              <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                <FireOutlined className="text-amber-600" />
                <span>{record.frequencyCount || tags.length}টি পরীক্ষায় রিপিটেড!</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {tags.map((tag, idx) => (
                <Tag
                  key={idx}
                  color={tag.includes('BCS') || tag.includes('বিসিএস') ? 'geekblue' : 'purple'}
                  className="font-bold text-[11px] border-none m-0"
                >
                  {tag}
                </Tag>
              ))}

              <button
                onClick={() => {
                  setTaggingWord(record);
                  setExamTagModalVisible(true);
                }}
                className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold transition flex items-center gap-1"
                title="কোন পরীক্ষায় এই প্রশ্ন এসেছিল যোগ করুন"
              >
                <PlusOutlined className="text-[9px]" /> পরীক্ষা যোগ
              </button>
            </div>
          </div>
        );
      },
    },
    {
      title: 'যাচাইকরণ স্কোর (Verification)',
      key: 'verification',
      width: 170,
      render: (_: any, record: IWord) => {
        const score = record.verificationScore || 90;
        const isFullyVerified = score >= 90;

        return (
          <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <SafetyCertificateFilled
                className={`text-base ${isFullyVerified ? 'text-emerald-600' : 'text-blue-500'}`}
              />
              <span className="font-black text-xs text-gray-800">{score}% যাচাইকৃত</span>
            </div>

            <Progress
              percent={score}
              size="small"
              strokeColor={isFullyVerified ? '#059669' : '#2563eb'}
              trailColor="#e5e7eb"
              showInfo={false}
              className="m-0"
            />

            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span className="truncate max-w-[100px]">{record.verifiedBy || 'পিএসসি যাচাইকৃত'}</span>
              <button
                onClick={(e) => handleUpvoteVerify(record, e)}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 bg-gray-50 hover:bg-emerald-50 px-1 py-0.5 rounded transition"
                title="তথ্যটি নির্ভুল নিশ্চিত করুন"
              >
                <LikeOutlined /> {record.upvotes || 1}
              </button>
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => (a.verificationScore || 85) - (b.verificationScore || 85),
    },
    {
      title: 'বাংলা ও ইংরেজি অর্থ',
      key: 'meaning',
      render: (_: any, record: IWord) => (
        <div className="space-y-1">
          <div className="font-bold text-emerald-800 text-sm sm:text-base">
            {highlightText(record.bangla || '—', searchText)}
          </div>
          <div className="text-xs text-gray-600 line-clamp-2">
            {highlightText(record.meaning || '', searchText)}
          </div>
          {record.mnemonic && (
            <div className="text-[11px] text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/80 flex items-center gap-1 font-semibold">
              <BulbOutlined className="text-amber-500" />
              <span>{record.mnemonic}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'সমার্থক ও বিপরীত',
      key: 'synAnt',
      width: 180,
      render: (_: any, record: IWord) => (
        <div className="space-y-1">
          {record.synonyms && record.synonyms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {record.synonyms.slice(0, 2).map((s, idx) => (
                <Tag color="green" key={idx} className="text-[10px] m-0 border-none">
                  {s}
                </Tag>
              ))}
              {record.synonyms.length > 2 && (
                <Tag color="green" className="text-[10px] m-0 border-dashed">
                  +{record.synonyms.length - 2}
                </Tag>
              )}
            </div>
          )}

          {record.antonyms && record.antonyms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {record.antonyms.slice(0, 2).map((a, idx) => (
                <Tag color="red" key={idx} className="text-[10px] m-0 border-none">
                  {a}
                </Tag>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'সংরক্ষণ',
      key: 'action',
      width: 80,
      render: (_: any, record: IWord) => {
        const isSaved = session?.user?.email && record.savedBy?.includes(session.user.email);

        return (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
            <button
              onClick={(e) => handleToggleSave(record, e)}
              className={`p-2 rounded-xl transition ${
                isSaved
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100'
              }`}
              title={isSaved ? 'আমার ডেক থেকে সরান' : 'আমার রিভিশন ডেকে যোগ করুন'}
            >
              {isSaved ? <StarFilled className="text-lg" /> : <StarOutlined className="text-lg" />}
            </button>

            {session?.user?.email === record.userEmail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWord(record._id!.toString());
                }}
                className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="মুছে ফেলুন"
              >
                <DeleteOutlined className="text-sm" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const handleRowClick = (record: any) => {
    setSelectedWord(record);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-emerald-50/20 to-white font-sans pb-24 md:pb-12">
      {/* Top Header */}
      <div
        className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ${
          hideHeader ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  বিসিএস ও ব্যাংক প্রস্তুতি
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-bold text-gray-500">
                  বিগত পরীক্ষার প্রশ্নভিত্তিক শব্দকোষ
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 m-0">
                ভোকাবুলারি কোষ ও অনুশীলন
              </h1>
            </div>

            {/* Quick Metrics & Add Word */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="hidden lg:flex items-center gap-4 bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl text-xs font-bold">
                <span className="flex items-center gap-1 text-gray-700">
                  <span className="text-emerald-700 font-black">{meta.total}</span> মোট শব্দ
                </span>
                <span className="h-4 w-[1px] bg-gray-300" />
                <span className="flex items-center gap-1 text-amber-700">
                  <FireOutlined className="text-amber-500" />
                  <span className="font-black">{meta.repeatedCount}</span> মোস্ট রিপিটেড
                </span>
                <span className="h-4 w-[1px] bg-gray-300" />
                <span className="flex items-center gap-1 text-emerald-700">
                  <SafetyCertificateFilled className="text-emerald-600" />
                  <span className="font-black">{meta.verifiedCount}</span> ভেরিফাইড
                </span>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
                className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-xl h-11 px-5 shadow-md border-none"
              >
                নতুন শব্দ যোগ করুন
              </Button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
            {[
              { key: 'all', label: `সকল শব্দ (${meta.total})` },
              { key: 'repeated', label: `মোস্ট রিপিটেড শব্দ (${meta.repeatedCount})` },
              { key: 'verified', label: `ভেরিফাইড শব্দকোষ (${meta.verifiedCount})` },
              ...(session?.user?.email
                ? [{ key: 'saved', label: 'আমার সংরক্ষিত ডেক' }]
                : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                  activeTab === tab.key
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Search & Controls */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Search
              placeholder="শব্দ, বাংলা অর্থ, সমার্থক বা পরীক্ষা খুঁজুন..."
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full"
            />

            <Select
              placeholder="কঠিনতার স্তর"
              allowClear
              size="large"
              value={intensityFilter}
              onChange={(val) => {
                setIntensityFilter(val);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <Option value="low">সহজ (Low / Primary)</Option>
              <Option value="medium">মাঝারি (Medium / BCS)</Option>
              <Option value="high">উচ্চ (High / Bank AD)</Option>
            </Select>

            <Select
              placeholder="পরীক্ষা সেক্টর"
              allowClear
              size="large"
              value={examFilter}
              onChange={(val) => {
                setExamFilter(val);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <Option value="bcs">বিসিএস (BCS)</Option>
              <Option value="bank">ব্যাংক (BANK AD)</Option>
              <Option value="primary">প্রাথমিক শিক্ষক (DPE)</Option>
              <Option value="ntrca">নিবন্ধন (NTRCA)</Option>
            </Select>

            <Select
              size="large"
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <Option value="frequency">সবচেয়ে বেশি রিপিটেড</Option>
              <Option value="verification">ভেরিফিকেশন স্কোর</Option>
              <Option value="alphabetical">বর্ণানুক্রমিক (A-Z)</Option>
              <Option value="recent">নতুন সংযোজিত</Option>
            </Select>
          </div>
        </div>

        {/* Word Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Spin size="large" tip="শব্দভাণ্ডার ও ভেরিফিকেশন ডাটা লোড হচ্ছে..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredWords}
              rowKey={(record) => record._id?.toString() || record.word}
              pagination={{
                current: currentPage,
                pageSize: 15,
                total: filteredWords.length,
                showSizeChanger: false,
                onChange: (page) => setCurrentPage(page),
                className: 'px-6 py-4',
              }}
              scroll={{ x: 1000 }}
              rowClassName="cursor-pointer hover:bg-emerald-50/40 transition"
              onRow={(record) => ({
                onClick: (e: any) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button') || target.tagName === 'BUTTON') return;
                  handleRowClick(record);
                },
              })}
            />
          )}
        </div>
      </div>

      {/* Drawer: Word Detailed Dossier */}
      <Drawer
        title={
          selectedWord && (
            <div className="flex items-center justify-between w-full pr-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black capitalize text-gray-900 tracking-tight">
                  {selectedWord.word}
                </span>
                <button
                  onClick={() => playTTS(selectedWord.word)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-100 text-emerald-800 transition"
                  title="উচ্চারণ শুনুন"
                >
                  <SoundOutlined className="text-base" />
                </button>
                <Tag color="cyan" className="font-bold border-none text-xs">
                  {selectedWord.partOfSpeech || 'noun'}
                </Tag>
              </div>

              <button
                onClick={(e) => handleToggleSave(selectedWord, e)}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              >
                {session?.user?.email && selectedWord.savedBy?.includes(session.user.email) ? (
                  <>
                    <StarFilled className="text-amber-500" /> ডেকে সংরক্ষিত
                  </>
                ) : (
                  <>
                    <StarOutlined /> ডেকে সংরক্ষণ করুন
                  </>
                )}
              </button>
            </div>
          )
        }
        placement="bottom"
        height="85%"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closeIcon={<CloseOutlined className="text-gray-700" />}
        className="rounded-t-3xl overflow-hidden font-sans"
      >
        {selectedWord && (
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Multi-Exam Badges & Verification Bar */}
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block mb-1">
                  বিগত পরীক্ষার তথ্য ও পুনরাবৃত্তি
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {(selectedWord.examTags && selectedWord.examTags.length > 0
                    ? selectedWord.examTags
                    : ['বিসিএস প্রিলিমিনারি']
                  ).map((t, i) => (
                    <Tag key={i} color="gold" className="font-bold border-none text-xs px-2.5 py-0.5">
                      {t}
                    </Tag>
                  ))}
                  <button
                    onClick={() => {
                      setTaggingWord(selectedWord);
                      setExamTagModalVisible(true);
                    }}
                    className="text-xs text-emerald-300 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded font-bold transition"
                  >
                    + নতুন পরীক্ষা যুক্ত করুন
                  </button>
                </div>
              </div>

              {/* Verification score pill */}
              <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3">
                <SafetyCertificateFilled className="text-2xl text-emerald-400" />
                <div>
                  <div className="text-sm font-black text-white">
                    {selectedWord.verificationScore || 92}% নির্ভুলতা
                  </div>
                  <div className="text-[10px] text-gray-300">
                    {selectedWord.verifiedBy || 'পিএসসি ও অভিধান যাচাইকৃত'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bangla & English Meanings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-2">
                  বাংলা অর্থ
                </span>
                <p className="text-xl font-black text-emerald-950 m-0">
                  {selectedWord.bangla || '—'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">
                  ইংরেজি সংজ্ঞা (Definition)
                </span>
                <p className="text-sm text-gray-800 font-medium m-0 leading-relaxed">
                  {selectedWord.meaning || '—'}
                </p>
              </div>
            </div>

            {/* Desi Mnemonic Hook */}
            {selectedWord.mnemonic && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                <BulbOutlined className="text-amber-600 text-2xl shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 block mb-1">
                    মনে রাখার দেশি ট্রিক (Mnemonic Hook)
                  </span>
                  <p className="text-sm font-bold text-amber-950 m-0 leading-relaxed">
                    {selectedWord.mnemonic}
                  </p>
                </div>
              </div>
            )}

            {/* Examples */}
            {selectedWord.example && (
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5">
                <span className="text-xs font-black uppercase tracking-wider text-blue-800 block mb-2">
                  পরীক্ষায় ব্যবহৃত বাক্য (Exam Usage Example)
                </span>
                <p className="text-sm font-semibold italic text-blue-950 m-0">
                  &quot;{selectedWord.example}&quot;
                </p>
              </div>
            )}

            {/* Synonyms & Antonyms */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 h-full">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block mb-3">
                    সমার্থক শব্দ (Synonyms)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.synonyms && selectedWord.synonyms.length > 0 ? (
                      selectedWord.synonyms.map((s, i) => (
                        <Tag key={i} color="green" className="text-sm font-bold px-3 py-1">
                          {s}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">কোনো সমার্থক শব্দ নেই</span>
                    )}
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 h-full">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-700 block mb-3">
                    বিপরীত শব্দ (Antonyms)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.antonyms && selectedWord.antonyms.length > 0 ? (
                      selectedWord.antonyms.map((a, i) => (
                        <Tag key={i} color="red" className="text-sm font-bold px-3 py-1">
                          {a}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">কোনো বিপরীত শব্দ নেই</span>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Drawer>

      {/* Modal: Add New Word */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-gray-900 font-black text-lg">
            <PlusOutlined className="text-emerald-600" />
            <span>নতুন শব্দ যোগ করুন</span>
          </div>
        }
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
          setSuggestions([]);
        }}
        footer={null}
        width={520}
        centered
        className="font-sans"
      >
        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
          <BulbOutlined className="text-amber-500" />
          <span>আপনি যে শব্দটি যোগ করবেন, তা পূর্বেই থাকলে সিস্টেম আপনার ডেক ও পরীক্ষার ট্যাগ আপডেট করে
          রিইউজ করবে। ফলে কোনো তথ্য ডুপ্লিকেট হয় না।</span>
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddWord}
          initialValues={{ intensity: 'medium', exam: 'bcs' }}
        >
          <Form.Item
            label="ইংরেজি শব্দ (Word)"
            name="word"
            rules={[
              { required: true, message: 'শব্দটি লিখুন' },
              { min: 2, message: 'কমপক্ষে ২ অক্ষরের হতে হবে' },
            ]}
          >
            <AutoComplete
              options={suggestions.map((w) => ({ value: w }))}
              onSearch={fetchSuggestions}
              placeholder="যেমন: ubiquitous, pristine, benevolent..."
              notFoundContent={fetchingSuggestions ? <Spin size="small" /> : 'পরামর্শ নেই'}
              filterOption={false}
              className="font-bold"
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="পরীক্ষা ক্যাটাগরি" name="exam">
                <Select>
                  <Option value="bcs">বিসিএস (BCS)</Option>
                  <Option value="bank">ব্যাংক (BANK AD)</Option>
                  <Option value="primary">প্রাথমিক শিক্ষক (DPE)</Option>
                  <Option value="ntrca">নিবন্ধন (NTRCA)</Option>
                  <Option value="others">অন্যান্য</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="কঠিনতার স্তর" name="intensity">
                <Select>
                  <Option value="low">সহজ (Low)</Option>
                  <Option value="medium">মাঝারি (Medium)</Option>
                  <Option value="high">উচ্চ (Hard)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="নির্দিষ্ট পরীক্ষার নাম ও সাল (ঐচ্ছিক)"
            name="examTag"
            tooltip="যেমন: ৪৪তম বিসিএস, কম্বাইন্ড ৮ ব্যাংক ২০২৩"
          >
            <Input placeholder="যেমন: ৪৩তম বিসিএস, BB AD 2022" />
          </Form.Item>

          <Form.Item
            label="মনে রাখার দেশি ট্রিক (ঐচ্ছিক)"
            name="mnemonic"
            tooltip="খালি রাখলে Groq / Gemini AI স্বয়ংক্রিয়ভাবে তৈরি করবে"
          >
            <Input placeholder="যেমন: Bene = ভালো, সুতরাং Benevolent = দয়ালু" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={() => {
                form.resetFields();
                setAddModalVisible(false);
              }}
              className="rounded-xl font-bold"
            >
              বাতিল
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={adding}
              className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-10 px-6 border-none"
            >
              সংরক্ষণ ও AI ভেরিফাই
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Add Exam Appearance Tag */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-gray-900 font-black text-base">
            <TagsOutlined className="text-emerald-600" />
            <span>পরীক্ষার ট্যাগ যোগ করুন: &quot;{taggingWord?.word}&quot;</span>
          </div>
        }
        open={examTagModalVisible}
        onCancel={() => {
          setExamTagModalVisible(false);
          setCustomExamTag('');
        }}
        footer={null}
        centered
        width={440}
        className="font-sans"
      >
        <p className="text-xs text-gray-500 mb-4">
          এই শব্দটি আর কোন কোন সরকারি বা ব্যাংক নিয়োগ পরীক্ষায় এসেছিল? ট্যাগ যুক্ত করলে এর রিপিটেশন
          ফ্রিকোয়েন্সি ও ভেরিফিকেশন স্কোর বৃদ্ধি পাবে।
        </p>

        <div className="space-y-4">
          <Input
            placeholder="যেমন: ৪৪তম বিসিএস, বাংলাদেশ ব্যাংক এডি ২০২২..."
            value={customExamTag}
            onChange={(e) => setCustomExamTag(e.target.value)}
            className="font-bold py-2"
          />

          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-400 block w-full mb-1">কুইক সিলেক্ট:</span>
            {[
              '৪৫তম বিসিএস',
              '৪৪তম বিসিএস',
              '৪৩তম বিসিএস',
              'বাংলাদেশ ব্যাংক এডি',
              'সোনালী ব্যাংক অফিসার',
              'প্রাথমিক সহকারী শিক্ষক',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setCustomExamTag(tag)}
                className="text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg font-semibold transition"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button onClick={() => setExamTagModalVisible(false)} className="rounded-xl font-bold">
              বাতিল
            </Button>
            <Button
              type="primary"
              onClick={handleAddExamTag}
              loading={taggingLoading}
              disabled={!customExamTag.trim()}
              className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl border-none"
            >
              ট্যাগ সংরক্ষণ করুন
            </Button>
          </div>
        </div>
      </Modal>

      {modalHolder}
    </div>
  );
};

export default Words;
