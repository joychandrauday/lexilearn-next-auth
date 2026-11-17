'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  GlobalOutlined,
  BookOutlined,
  TagsOutlined,
  FireOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import WordByLanguageModal from './WordByLanguageModal';
import { toast } from 'sonner';

const POPULAR_LANGUAGES = [
  'পর্তুগিজ',
  'আরবি',
  'ফারসি',
  'তুর্কি',
  'ওলন্দাজ',
  'ফরাসি',
  'জাপানি',
  'দেশি',
  'তৎসম',
  'তদ্ভব',
  'ইংরেজি',
  'চীনা',
  'গুজরাটি',
  'পাঞ্জাবি',
];

const EXAM_OPTIONS = [
  { value: 'bcs', label: 'বিসিএস (BCS)' },
  { value: 'bank', label: 'ব্যাংক (BANK AD & Officer)' },
  { value: 'primary', label: 'প্রাথমিক সহকারী শিক্ষক (Primary)' },
  { value: 'ntrca', label: 'শিক্ষক নিবন্ধন (NTRCA)' },
  { value: 'others', label: 'অন্যান্য নিয়োগ পরীক্ষা (Others)' },
];

const WordSourceManager = () => {
  const [data, setData] = useState<any[]>([]);
  const [options, setOptions] = useState<{ languages: string[]; exams: string[]; totalCount?: number }>({
    languages: [],
    exams: [],
    totalCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [examFilters, setExamFilters] = useState<string[]>([]);
  const [sorter, setSorter] = useState<{ field?: string; order?: 'ascend' | 'descend' }>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
  const [form] = Form.useForm();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>();

  // Fetch options for dynamic filters and selects
  const fetchOptions = async () => {
    try {
      const res = await fetch('/api/wordsource?getOptions=true');
      const json = await res.json();
      setOptions(json);
    } catch {
      toast.error('উৎস ও পরীক্ষার তালিকা লোড করতে সমস্যা হয়েছে');
    }
  };

  // Fetch words with server-side params
  const fetchWords = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchText) params.append('search', searchText);
    if (sourceFilter && sourceFilter !== 'all') params.append('sourceLanguage', sourceFilter);
    if (examFilters.length) params.append('exams', examFilters.join(','));
    if (sorter.field) {
      params.append('sortField', sorter.field);
      params.append('sortDir', sorter.order === 'ascend' ? '1' : '-1');
    }
    params.append('page', pagination.current.toString());
    params.append('limit', pagination.pageSize.toString());

    try {
      const res = await fetch(`/api/wordsource?${params.toString()}`);
      const json = await res.json();
      setData(json.words || []);
      setPagination((prev) => ({ ...prev, total: json.total || 0 }));
    } catch {
      toast.error('শব্দ তালিকা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchWords();
  }, [searchText, sourceFilter, examFilters, sorter, pagination.current, pagination.pageSize]);

  // Debounced search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchText(val);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 400);
  };

  // Create or update word
  const handleSave = async (values: any) => {
    setSubmitLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/wordsource/${editingId}` : '/api/wordsource';
    const payload = {
      ...values,
      sourceLanguage: Array.isArray(values.sourceLanguage)
        ? values.sourceLanguage[0]
        : values.sourceLanguage,
      userEmail: session?.user?.email || 'community@lexilearn.com',
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(resData.message || `শব্দ সফলভাবে ${editingId ? 'আপডেট' : 'সংরক্ষিত'} হয়েছে!`);
        setIsModalOpen(false);
        form.resetFields();
        fetchWords();
        fetchOptions();
      } else {
        toast.error(resData.error || 'শব্দ সংরক্ষণে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যার কারণে শব্দ সংরক্ষণ করা যায়নি');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete word
  const deleteWord = async (id: string) => {
    try {
      const res = await fetch(`/api/wordsource/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('শব্দটি সফলভাবে মুছে ফেলা হয়েছে');
        fetchWords();
        fetchOptions();
      } else {
        toast.error('শব্দ মুছতে ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    }
  };

  // Table columns (No illegal React hooks inside filterDropdown)
  const columns = [
    {
      title: 'বাংলা শব্দ ও ব্যুৎপত্তি',
      dataIndex: 'banglaWord',
      key: 'banglaWord',
      sorter: true,
      render: (text: string, record: any) => (
        <div className="py-1">
          <div className="text-base font-black text-gray-900">{text}</div>
          {record.meaning && (
            <div className="text-xs text-gray-500 font-medium mt-0.5">{record.meaning}</div>
          )}
        </div>
      ),
    },
    {
      title: 'উৎস ভাষা (কোন দেশি)',
      dataIndex: 'sourceLanguage',
      key: 'sourceLanguage',
      sorter: true,
      render: (lang: string) => {
        const isCommon = ['পর্তুগিজ', 'আরবি', 'ফারসি', 'তুর্কি', 'ওলন্দাজ', 'ফরাসি'].includes(lang);
        return (
          <Tooltip title={`"${lang}" ভাষার সকল শব্দ দেখতে ক্লিক করুন`}>
            <Tag
              className="cursor-pointer font-bold px-2.5 py-1 text-xs rounded-md shadow-2xs hover:scale-105 transition-transform"
              onClick={() => {
                setSelectedLanguage(lang);
                setOpen(true);
              }}
              color={
                lang === 'পর্তুগিজ'
                  ? 'volcano'
                  : lang === 'আরবি'
                  ? 'emerald'
                  : lang === 'ফারসি'
                  ? 'purple'
                  : lang === 'তুর্কি'
                  ? 'magenta'
                  : lang === 'ওলন্দাজ'
                  ? 'orange'
                  : lang === 'ফরাসি'
                  ? 'blue'
                  : isCommon
                  ? 'geekblue'
                  : 'default'
              }
            >
              <GlobalOutlined className="mr-1" />
              {lang || 'অন্যান্য'}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'টার্গেট পরীক্ষা ও বিগত সালের প্রশ্ন',
      dataIndex: 'exam',
      key: 'exam',
      render: (exams: string[], record: any) => (
        <div className="flex flex-wrap items-center gap-1.5 py-1">
          {record.examTags && record.examTags.length > 0
            ? record.examTags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md"
                >
                  <TagsOutlined className="text-amber-600" />
                  {tag}
                </span>
              ))
            : exams?.map((e) => (
                <Tag color="cyan" key={e} className="font-semibold text-xs uppercase m-0">
                  {e}
                </Tag>
              ))}
        </div>
      ),
    },
    {
      title: 'অ্যাকশন',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => {
        const isOwner =
          !record.userEmail ||
          record.userEmail === 'community@lexilearn.com' ||
          session?.user?.email === record.userEmail;

        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => {
                setEditingId(record._id);
                form.setFieldsValue({
                  banglaWord: record.banglaWord,
                  sourceLanguage: record.sourceLanguage,
                  exam: record.exam,
                  examTag: record.examTags?.[0] || '',
                  meaning: record.meaning || '',
                });
                setIsModalOpen(true);
              }}
              disabled={!isOwner}
            />
            <Popconfirm
              title="শব্দটি মুছে ফেলতে চান?"
              description="এটি স্থায়ীভাবে মুছে ফেলা হবে।"
              onConfirm={() => deleteWord(record._id)}
              okText="মুছুন"
              cancelText="বাতিল"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} disabled={!isOwner} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Breadcrumbs & Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full">
                বাংলা ভাষা ও ব্যাকরণ
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-bold text-gray-500">শব্দতত্ত্ব ও ব্যুৎপত্তি</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 m-0">
              বাংলা শব্দ উৎস ও উৎপত্তি
            </h1>
            <p className="text-xs text-gray-500 mt-1 mb-0">
              পর্তুগিজ, আরবি, ফারসি, তুর্কি, ওলন্দাজ, ফরাসি, তৎসম ও তদ্ভব শব্দের উৎস ও বিগত বিসিএস/ব্যাংক নিয়োগ প্রশ্নকোষ
            </p>

            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] font-black bg-cyan-800 text-white px-2.5 py-0.5 rounded-md">
                বাংলা শব্দ উৎস
              </span>
              <Link
                href="/words"
                className="text-[11px] font-bold text-gray-600 hover:text-emerald-800 bg-gray-100 hover:bg-emerald-50 px-2.5 py-0.5 rounded-md transition-all flex items-center gap-1 border border-gray-200"
              >
                ইংরেজি ভোকাবুলারি হাব ↗
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
              className="bg-cyan-700 hover:!bg-cyan-600 font-black rounded-xl h-11 px-5 shadow-md border-none text-white"
            >
              শব্দ যোগ করুন
            </Button>
          </div>
        </div>

        {/* Quick Language Filter Pills */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-xs font-bold text-gray-500 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GlobalOutlined className="text-cyan-700" /> কুইক ভাষা ফিল্টার:
            </span>
            <span className="text-gray-400 text-[11px]">
              মোট শব্দ: <b className="text-cyan-800">{pagination.total}</b> টি
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setSourceFilter(null);
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                !sourceFilter
                  ? 'bg-cyan-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              সকল ভাষা ({pagination.total})
            </button>

            {POPULAR_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setSourceFilter(sourceFilter === lang ? null : lang);
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                  sourceFilter === lang
                    ? 'bg-cyan-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-cyan-50 hover:text-cyan-900 border border-transparent hover:border-cyan-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Table Card */}
        <Card className="rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <Input
              placeholder="বাংলা শব্দ, উৎস ভাষা, অর্থ বা পরীক্ষার সাল দিয়ে খুঁজুন..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              onChange={handleSearchChange}
              className="max-w-md rounded-xl py-2 font-medium"
            />

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                ✓ ১৬০+ অথেনটিক শব্দ তালিকাভুক্ত
              </span>
            </div>
          </div>

          <Table
            dataSource={data}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `মোট ${total} টি শব্দ পাওয়া গেছে`,
            }}
            onChange={(page, _, sor) => {
              setPagination((prev) => ({ ...prev, current: page.current || 1, pageSize: page.pageSize || 12 }));
              setSorter(sor as any);
            }}
            className="rounded-xl overflow-hidden"
          />
        </Card>

        {/* Modal: View Words By Language */}
        <WordByLanguageModal
          open={open}
          sourceLanguage={selectedLanguage}
          onClose={() => setOpen(false)}
        />

        {/* Modal: Create or Edit Word */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-gray-900 font-black text-lg">
              <BookOutlined className="text-cyan-700" />
              <span>{editingId ? 'শব্দ তথ্য আপডেট করুন' : 'নতুন বাংলা শব্দ উৎস যোগ করুন'}</span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          confirmLoading={submitLoading}
          onOk={() => form.submit()}
          okText={editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          cancelText="বাতিল"
          centered
          width={520}
          destroyOnClose
          className="font-sans"
        >
          {!session?.user?.email && (
            <div className="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl flex items-center gap-2">
              <InfoCircleOutlined className="text-amber-600 shrink-0" />
              <span>
                আপনি অতিথি হিসেবে শব্দ যুক্ত করছেন। পয়েন্ট ও স্ট্রিক ট্র্যাক করতে চাইলে পরবর্তীতে লগইন করতে পারেন।
              </span>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{ sourceLanguage: 'পর্তুগিজ', exam: ['bcs'] }}
          >
            <Form.Item
              name="banglaWord"
              label={<span className="font-bold text-gray-700">বাংলা শব্দ (Bangla Word)</span>}
              rules={[{ required: true, message: 'অনুগ্রহ করে বাংলা শব্দটি লিখুন' }]}
            >
              <Input placeholder="যেমন: আনারস, আদালত, চশমা, দারোগা..." className="rounded-xl py-2" />
            </Form.Item>

            <Form.Item
              name="sourceLanguage"
              label={<span className="font-bold text-gray-700">উৎস ভাষা (Source Language)</span>}
              rules={[{ required: true, message: 'উৎস ভাষা নির্বাচন করুন' }]}
            >
              <Select
                showSearch
                options={Array.from(new Set([...POPULAR_LANGUAGES, ...(options.languages || [])])).map((lang) => ({
                  value: lang,
                  label: lang,
                }))}
                placeholder="উৎস ভাষা নির্বাচন করুন বা লিখুন"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="meaning"
              label={<span className="font-bold text-gray-700">অর্থ বা ব্যুৎপত্তি রূপ (ঐচ্ছিক)</span>}
            >
              <Input placeholder="যেমন: হস্ত > হত্থ > হাত, অথবা শব্দের অর্থ" className="rounded-xl py-2" />
            </Form.Item>

            <Form.Item
              name="exam"
              label={<span className="font-bold text-gray-700">টার্গেট পরীক্ষা ক্যাটাগরি</span>}
            >
              <Select mode="multiple" options={EXAM_OPTIONS} placeholder="পরীক্ষা নির্বাচন করুন" className="rounded-xl" />
            </Form.Item>

            <Form.Item
              name="examTag"
              label={<span className="font-bold text-gray-700">নির্দিষ্ট পরীক্ষার নাম ও সাল (ঐচ্ছিক)</span>}
            >
              <Input placeholder="যেমন: ৩৮তম বিসিএস, BB AD 2022" className="rounded-xl py-2" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default WordSourceManager;
