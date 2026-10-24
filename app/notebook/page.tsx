'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Input,
  Select,
  Spin,
  Empty,
  Modal,
  Badge,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  BookOutlined,
  ReadOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  UndoOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  RobotOutlined,
  PrinterOutlined,
  FilterOutlined,
  FireOutlined,
  ThunderboltFilled,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';
import QuickSaveModal from '../../components/Notebook/QuickSaveModal';

interface NotebookItem {
  _id: string;
  title: string;
  itemType: 'word' | 'topic' | 'rule' | 'question' | 'quick_note';
  subject: 'english' | 'bangla' | 'gk' | 'math' | 'science_it' | 'general';
  category?: string;
  content: string;
  secondaryText?: string;
  mnemonic?: string;
  tags: string[];
  targetExam: string;
  priority: 'high' | 'medium' | 'normal';
  isMastered: boolean;
  reviewCount: number;
  createdAt: string;
}

export default function NotebookPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, mastered: 0, pending: 0 });

  // Filters
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activePriority, setActivePriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Active email
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('lexi_user_email');
      if (email) setStoredEmail(email);
    }
  }, []);

  const activeEmail = session?.user?.email || storedEmail || 'learner@lexilearn.com';

  // Fetch notebook items
  const fetchNotebook = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/user/notebook', {
        params: {
          userEmail: activeEmail,
          subject: activeSubject,
          itemType: activeType,
          isMastered: activeStatus === 'all' ? 'all' : activeStatus === 'mastered',
          priority: activePriority,
          search: searchQuery,
        },
      });

      if (res.data.success) {
        setItems(res.data.items || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch {
      toast.error('নোটবুক লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebook();
  }, [activeSubject, activeType, activeStatus, activePriority, activeEmail]);

  // Handle Search on enter or debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotebook();
  };

  // Toggle mastered status
  const handleToggleMastered = async (id: string) => {
    try {
      const res = await axios.patch('/api/user/notebook', {
        id,
        userEmail: activeEmail,
        action: 'toggle-mastered',
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setItems((prev) =>
          prev.map((item) => (item._id === id ? { ...item, isMastered: !item.isMastered } : item))
        );
        setStats((prev) => {
          const current = items.find((i) => i._id === id);
          if (current?.isMastered) {
            return { ...prev, mastered: Math.max(0, prev.mastered - 1), pending: prev.pending + 1 };
          } else {
            return { ...prev, mastered: prev.mastered + 1, pending: Math.max(0, prev.pending - 1) };
          }
        });
      }
    } catch {
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    try {
      const res = await axios.delete('/api/user/notebook', {
        params: { id, userEmail: activeEmail },
      });

      if (res.data.success) {
        toast.success('আইটেমটি সফলভাবে মুছে ফেলা হয়েছে');
        setItems((prev) => prev.filter((i) => i._id !== id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      }
    } catch {
      toast.error('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  // Ask AI about this topic
  const handleAskAI = (item: NotebookItem) => {
    const prompt =
      item.itemType === 'word'
        ? `"${item.title}" (${item.secondaryText || ''}) শব্দটির বিস্তারিত অর্থ, বিসিএস ও ব্যাংক পরীক্ষায় ব্যবহারের উদাহরণ এবং ৩টি সিনোনিম বুঝিয়ে দিন।`
        : item.itemType === 'rule'
        ? `এই ব্যাকরণ নিয়মটি বিস্তারিত ব্যাখ্যা করুন: "${item.title}". সঙ্গে বিগত বছরের ৩টি প্রশ্ন উদাহরণ দিন।`
        : `এই বিষয়ে বিসিএস প্রিলিমিনারি প্রস্তুতির জন্য শর্টকাট ও জরুরি তথ্য বুঝিয়ে দিন: "${item.title}". বিবরণ: ${item.content}`;

    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lexibot:ask', { detail: { prompt } });
      window.dispatchEvent(event);
    }
  };

  const getSubjectName = (sub: string) => {
    switch (sub) {
      case 'english':
        return 'ইংরেজি';
      case 'bangla':
        return 'বাংলা';
      case 'gk':
        return 'সাধারণ জ্ঞান';
      case 'math':
        return 'গণিত ও মানসিক';
      case 'science_it':
        return 'বিজ্ঞান ও আইসিটি';
      default:
        return 'সাধারণ প্রস্তুতি';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'word':
        return <Tag color="blue" className="rounded-md m-0 font-bold text-[10px]">শব্দভাণ্ডার</Tag>;
      case 'rule':
        return <Tag color="gold" className="rounded-md m-0 font-bold text-[10px]">নিয়ম/ট্রিক</Tag>;
      case 'question':
        return <Tag color="volcano" className="rounded-md m-0 font-bold text-[10px]">কনফিউজিং প্রশ্ন</Tag>;
      default:
        return <Tag color="cyan" className="rounded-md m-0 font-bold text-[10px]">টপিক/বিষয়</Tag>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-2">
              <BookOutlined className="text-amber-400" />
              <span>Aspirant&apos;s Personal Binder • আপনার ব্যক্তিগত প্রস্তুতি হাব</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight">
              প্রস্তুতি নোটবুক ও সেভড হাব
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm font-normal max-w-xl m-0 leading-relaxed">
              পড়ার সময় চোখে পড়া যেকোনো কনফিউজিং শব্দ, গ্রামার নিয়ম, দেশি ট্রিক বা সংবিধানের অনুচ্ছেদ এক ক্লিকে সেভ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsQuickSaveOpen(true)}
              className="bg-emerald-600 hover:!bg-emerald-500 font-black rounded-xl h-11 px-4 text-xs shadow-md border-0"
            >
              নতুন কিছু সেভ করুন
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-white/10 hover:!bg-white/20 !text-white border-white/20 rounded-xl h-11 px-3.5 backdrop-blur-sm text-xs font-bold"
            >
              রিভিশন শিট ভিউ
            </Button>
          </div>
        </div>

        {/* Telemetry Counter Chips */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-white/10 max-w-lg">
          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-emerald-200/80 font-medium block">মোট সংরক্ষিত</span>
            <span className="text-xl md:text-2xl font-black text-white">{stats.total}টি</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-amber-200/80 font-medium block">রিভিশন বাকি</span>
            <span className="text-xl md:text-2xl font-black text-amber-300">{stats.pending}টি</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-teal-200/80 font-medium block">আয়ত্ত সম্পন্ন</span>
            <span className="text-xl md:text-2xl font-black text-emerald-400">{stats.mastered}টি</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-4">
        {/* Subject Filter Bar */}
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs flex items-center overflow-x-auto gap-1">
          {[
            { id: 'all', label: 'সকল বিষয়' },
            { id: 'english', label: 'ইংরেজি (English)' },
            { id: 'bangla', label: 'বাংলা (Bangla)' },
            { id: 'gk', label: 'সাধারণ জ্ঞান (GK)' },
            { id: 'math', label: 'গণিত ও মানসিক দক্ষতা' },
            { id: 'science_it', label: 'বিজ্ঞান ও আইসিটি' },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSubject === sub.id
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter & Search Control Row */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={activeType}
              onChange={(val) => setActiveType(val)}
              className="w-36 text-xs"
              options={[
                { label: 'সকল ধরন', value: 'all' },
                { label: 'শব্দভাণ্ডার', value: 'word' },
                { label: 'বিষয়/অধ্যায়', value: 'topic' },
                { label: 'নিয়ম ও ট্রিক', value: 'rule' },
                { label: 'কনফিউজিং প্রশ্ন', value: 'question' },
              ]}
            />

            <Select
              value={activeStatus}
              onChange={(val) => setActiveStatus(val)}
              className="w-36 text-xs"
              options={[
                { label: 'সকল স্ট্যাটাস', value: 'all' },
                { label: 'রিভিশন বাকি', value: 'pending' },
                { label: 'আয়ত্ত হয়েছে', value: 'mastered' },
              ]}
            />

            <Select
              value={activePriority}
              onChange={(val) => setActivePriority(val)}
              className="w-36 text-xs"
              options={[
                { label: 'সকল অগ্রাধিকার', value: 'all' },
                { label: 'জরুরি রিভিশন (High)', value: 'high' },
                { label: 'মাঝারি (Medium)', value: 'medium' },
                { label: 'সাধারণ (Normal)', value: 'normal' },
              ]}
            />
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="টপিক, শব্দ বা ট্রিক খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 rounded-xl text-xs"
              allowClear
            />
            <Button
              htmlType="submit"
              className="bg-slate-100 hover:!bg-slate-200 border-gray-200 text-xs font-bold rounded-xl"
            >
              খুঁজুন
            </Button>
          </form>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-gray-100">
            <Spin size="large" />
            <p className="mt-3 text-xs text-gray-400 font-bold">নোটবুক লোড হচ্ছে...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <Empty description="এই ফিল্টারে কোনো সংরক্ষিত আইটেম পাওয়া যায়নি" />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsQuickSaveOpen(true)}
              className="mt-4 bg-emerald-600 rounded-xl font-bold text-xs"
            >
              প্রথম টপিক বা শব্দ যোগ করুন
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-3xl border p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                    item.isMastered
                      ? 'border-emerald-200/80 bg-emerald-50/10'
                      : item.priority === 'high'
                      ? 'border-amber-200 shadow-xs'
                      : 'border-gray-100'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getTypeBadge(item.itemType)}
                        <Tag color="geekblue" className="rounded-md m-0 font-bold text-[10px]">
                          {getSubjectName(item.subject)}
                        </Tag>
                        {item.targetExam && (
                          <Tag color="purple" className="rounded-md m-0 text-[10px]">
                            {item.targetExam}
                          </Tag>
                        )}
                      </div>

                      {item.isMastered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                          <CheckCircleFilled /> আয়ত্ত হয়েছে
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <FireOutlined /> রিভিশন বাকি
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-black text-gray-900 m-0 mb-1 leading-snug">
                      {item.title}
                    </h3>

                    {/* Secondary text (Bangla meaning for word) */}
                    {item.secondaryText && (
                      <span className="text-xs font-bold text-emerald-800 block mb-2">
                        {item.secondaryText}
                      </span>
                    )}

                    {/* Category */}
                    {item.category && (
                      <span className="text-[11px] text-gray-400 block mb-2 font-medium">
                        অধ্যায়/ক্যাটাগরি: {item.category}
                      </span>
                    )}

                    {/* Content / Rule Breakdown */}
                    {item.content && (
                      <div className="bg-slate-50/80 p-3 rounded-2xl border border-gray-100 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-medium mb-3">
                        {item.content}
                      </div>
                    )}

                    {/* Desi Mnemonic Shortcut */}
                    {item.mnemonic && (
                      <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-2xl text-xs text-amber-950 mb-3 flex items-start gap-2">
                        <BulbOutlined className="text-amber-600 text-sm mt-0.5 shrink-0" />
                        <div>
                          <span className="font-black text-[11px] text-amber-900 block">দেশি স্মৃতিসূত্র:</span>
                          <span className="font-medium text-amber-950">{item.mnemonic}</span>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                    <Button
                      size="small"
                      icon={item.isMastered ? <UndoOutlined /> : <CheckCircleOutlined />}
                      onClick={() => handleToggleMastered(item._id)}
                      className={`text-xs font-bold rounded-xl ${
                        item.isMastered
                          ? 'bg-slate-100 text-gray-700 border-gray-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:!bg-emerald-100'
                      }`}
                    >
                      {item.isMastered ? 'রিভিশনে নিন' : 'আয়ত্ত হয়েছে'}
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Tooltip title="লেক্সিবট AI মেন্টর দিয়ে এই বিষয়টি বিস্তারিত বুঝুন">
                        <Button
                          size="small"
                          icon={<RobotOutlined />}
                          onClick={() => handleAskAI(item)}
                          className="text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200 rounded-xl hover:!bg-indigo-100"
                        >
                          AI বুঝুন
                        </Button>
                      </Tooltip>

                      <Tooltip title="নোটবুক থেকে মুছুন">
                        <Button
                          size="small"
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteItem(item._id)}
                          className="hover:!bg-rose-50 rounded-xl"
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Save Modal */}
      <QuickSaveModal
        open={isQuickSaveOpen}
        onClose={() => setIsQuickSaveOpen(false)}
        userEmail={activeEmail}
        onItemSaved={() => fetchNotebook()}
      />

      {/* Printable Revision Sheet Modal */}
      <Modal
        open={isPrintModalOpen}
        onCancel={() => setIsPrintModalOpen(false)}
        footer={null}
        width={760}
        centered
        className="rounded-3xl overflow-hidden font-sans"
      >
        <div className="p-4">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-black text-gray-900 m-0">পরীক্ষার কুইক রিভিশন শিট</h2>
              <p className="text-xs text-gray-500 m-0">
                আপনার সকল গুরুত্বপূর্ণ শব্দ, ব্যাকরণ নিয়ম ও ট্রিকসের এক নজরে সারসংক্ষেপ
              </p>
            </div>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="bg-emerald-600 font-bold rounded-xl text-xs h-9"
            >
              প্রিন্ট বা পিডিএফ সেভ
            </Button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-slate-50 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-gray-900 text-sm">{idx + 1}. {item.title}</span>
                  <Tag color="blue" className="text-[10px] m-0 font-bold">
                    {getSubjectName(item.subject)}
                  </Tag>
                </div>
                {item.secondaryText && (
                  <p className="text-emerald-800 font-bold m-0 mb-1">{item.secondaryText}</p>
                )}
                {item.content && (
                  <p className="text-gray-700 m-0 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                )}
                {item.mnemonic && (
                  <p className="text-amber-900 font-bold m-0 mt-1.5 bg-amber-100/70 p-1.5 rounded-lg">
                    স্মৃতিসূত্র: {item.mnemonic}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
