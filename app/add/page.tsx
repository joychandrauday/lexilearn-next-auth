'use client';

import React, { useState, Suspense } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, AutoComplete, Select, Button, Card, Typography, Spin, Input, Segmented } from 'antd';
import {
  PlusOutlined,
  ClearOutlined,
  BookOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';

const { Option } = Select;
const { Title } = Typography;

const BENGALI_LANGUAGES = [
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
  'হিন্দি',
  'বর্মি',
  'মালয়',
  'মেক্সিকান',
];

const EXAM_OPTIONS = [
  { value: 'bcs', label: 'বিসিএস (BCS)' },
  { value: 'bank', label: 'ব্যাংক (BANK)' },
  { value: 'primary', label: 'প্রাথমিক শিক্ষক (Primary)' },
  { value: 'ntrca', label: 'নিবন্ধন (NTRCA)' },
  { value: 'others', label: 'অন্যান্য (Others)' },
];

function AddWordContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'bangla' ? 'bangla' : 'english';
  const [activeTab, setActiveTab] = useState<'english' | 'bangla'>(initialTab);

  // English state
  const [englishLoading, setEnglishLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);

  // Bengali state
  const [banglaLoading, setBanglaLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const [englishForm] = Form.useForm();
  const [banglaForm] = Form.useForm();

  // Fetch suggestions from Datamuse API
  const fetchSuggestions = async (value: string) => {
    if (!value) {
      setSuggestions([]);
      return;
    }
    setFetching(true);
    try {
      const res = await axios.get(`https://api.datamuse.com/sug?s=${encodeURIComponent(value)}&max=10`);
      const filtered = res.data
        .map((item: any) => item.word)
        .filter((word: string) => !word.includes(' '));
      setSuggestions(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // Submit English Word
  const onEnglishFinish = async (values: {
    word: string;
    intensity: string;
    exam: string;
    examTag?: string;
    mnemonic?: string;
  }) => {
    const userEmail = session?.user?.email || 'community@lexilearn.com';
    setEnglishLoading(true);
    try {
      const res = await axios.post('/api/words', {
        word: values.word.trim(),
        intensity: values.intensity,
        exam: values.exam,
        examTag: values.examTag?.trim() || undefined,
        mnemonic: values.mnemonic?.trim() || undefined,
        userEmail,
      });

      if (res.data?.success) {
        if (res.data.reused) {
          toast.success(`"${values.word}" শব্দটি পূর্বে সংরক্ষিত ছিল। আপনার ডেক ও পরীক্ষার ট্যাগ আপডেট করা হয়েছে!`);
        } else {
          toast.success(`"${values.word}" সফলভাবে AI ভেরিফিকেশনসহ সংরক্ষিত হয়েছে!`);
        }
        router.push('/words');
      } else {
        toast.error('শব্দটি সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'শব্দ সংরক্ষণে ত্রুটি হয়েছে');
    } finally {
      setEnglishLoading(false);
    }
  };

  // Submit Bengali Word Source
  const onBanglaFinish = async (values: {
    banglaWord: string;
    sourceLanguage: string;
    meaning?: string;
    exam?: string[];
    examTag?: string;
  }) => {
    const userEmail = session?.user?.email || 'community@lexilearn.com';
    setBanglaLoading(true);
    try {
      const res = await axios.post('/api/wordsource', {
        banglaWord: values.banglaWord.trim(),
        sourceLanguage: values.sourceLanguage,
        meaning: values.meaning?.trim() || undefined,
        exam: values.exam && values.exam.length > 0 ? values.exam : ['others'],
        examTag: values.examTag?.trim() || undefined,
        userEmail,
      });

      if (res.data?.success) {
        toast.success(res.data.message || `"${values.banglaWord}" সফলভাবে বাংলা শব্দকোষে সংরক্ষিত হয়েছে!`);
        router.push('/bangla/shobdo');
      } else {
        toast.error(res.data?.error || 'শব্দটি সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'শব্দ সংরক্ষণে ত্রুটি হয়েছে');
    } finally {
      setBanglaLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-10 px-4 font-sans bg-slate-50 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-xl p-6 rounded-3xl shadow-xl border border-gray-100 bg-white">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl transition-colors ${
              activeTab === 'english'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-cyan-50 text-cyan-700'
            }`}
          >
            {activeTab === 'english' ? <BookOutlined /> : <GlobalOutlined />}
          </div>
          <Title level={3} className="!font-black !text-gray-900 !mb-1">
            {activeTab === 'english' ? 'নতুন ইংরেজি শব্দ যোগ করুন' : 'নতুন বাংলা শব্দ উৎস যোগ করুন'}
          </Title>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            {activeTab === 'english'
              ? 'শব্দটি লিখলে স্বয়ংক্রিয়ভাবে অভিধানের অর্থ, বাংলা অনুবাদ, উচ্চারণ ও AI নেমোনিক যুক্ত হবে।'
              : 'শব্দ ও কোন দেশি উৎস (যেমন: পর্তুগিজ, আরবি, ফারসি) উল্লেখ করে শব্দকোষ সমৃদ্ধ করুন।'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <Segmented
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'english' | 'bangla')}
            options={[
              {
                label: (
                  <span className="font-bold px-3 py-1 flex items-center gap-1.5">
                    <BookOutlined /> ইংরেজি ভোকাবুলারি
                  </span>
                ),
                value: 'english',
              },
              {
                label: (
                  <span className="font-bold px-3 py-1 flex items-center gap-1.5">
                    <GlobalOutlined /> বাংলা শব্দ উৎস (কোন দেশি)
                  </span>
                ),
                value: 'bangla',
              },
            ]}
            className="p-1 bg-gray-100 rounded-2xl"
          />
        </div>

        {/* Guest Reminder Note */}
        {!session?.user?.email && (
          <div className="mb-5 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-2xl flex items-center gap-2">
            <InfoCircleOutlined className="text-amber-600 shrink-0" />
            <span>
              আপনি অতিথি হিসেবে শব্দ যুক্ত করছেন। পয়েন্ট ও স্ট্রিক ট্র্যাক করতে চাইলে লগইন করুন, তবে এটি বাধ্যতামূলক নয়।
            </span>
          </div>
        )}

        {/* 1. ENGLISH FORM */}
        {activeTab === 'english' && (
          <Form
            form={englishForm}
            layout="vertical"
            onFinish={onEnglishFinish}
            initialValues={{ intensity: 'medium', exam: 'bcs' }}
          >
            <Form.Item
              label={<span className="font-bold text-gray-700">ইংরেজি শব্দ (English Word)</span>}
              name="word"
              rules={[{ required: true, message: 'অনুগ্রহ করে একটি ইংরেজি শব্দ লিখুন' }]}
            >
              <AutoComplete
                size="large"
                options={suggestions.map((word) => ({ value: word }))}
                onSearch={fetchSuggestions}
                placeholder="যেমন: ephemeral, tenacious, candid, ubiquitous..."
                notFoundContent={fetching ? <Spin size="small" /> : null}
                filterOption={false}
                className="rounded-xl"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="font-bold text-gray-700">গুরুত্ব / তীব্রতা (Intensity)</span>}
                name="intensity"
              >
                <Select size="large" className="rounded-xl">
                  <Option value="low">সহজ (Low)</Option>
                  <Option value="medium">মাঝারি (Medium)</Option>
                  <Option value="high">কঠিন / উচ্চ (High)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-gray-700">পরীক্ষা ক্যাটাগরি (Target Exam)</span>}
                name="exam"
              >
                <Select size="large" className="rounded-xl">
                  <Option value="bcs">বিসিএস (BCS)</Option>
                  <Option value="bank">ব্যাংক (BANK)</Option>
                  <Option value="primary">প্রাথমিক শিক্ষক (Primary)</Option>
                  <Option value="ntrca">নিবন্ধন (NTRCA)</Option>
                  <Option value="others">অন্যান্য (Others)</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="font-bold text-gray-700">নির্দিষ্ট পরীক্ষার নাম ও সাল (ঐচ্ছিক)</span>}
              name="examTag"
              tooltip="যেমন: ৪৩তম বিসিএস, BB AD 2022"
            >
              <Input size="large" placeholder="যেমন: ৪৩তম বিসিএস, কম্বাইন্ড ৮ ব্যাংক ২০২৩" className="rounded-xl" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-gray-700">মনে রাখার দেশি ট্রিক (ঐচ্ছিক)</span>}
              name="mnemonic"
              tooltip="খালি রাখলে Groq / Gemini AI স্বয়ংক্রিয়ভাবে তৈরি করবে"
            >
              <Input size="large" placeholder="যেমন: Bene = ভালো, সুতরাং Benevolent = দয়ালু" className="rounded-xl" />
            </Form.Item>

            <Form.Item className="mt-5 mb-0">
              <div className="flex justify-end gap-3">
                <Button
                  size="large"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    englishForm.resetFields();
                    setSuggestions([]);
                  }}
                  className="rounded-xl font-bold"
                >
                  মুছুন
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={englishLoading}
                  icon={<PlusOutlined />}
                  className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold px-6 shadow-md border-none"
                >
                  শব্দ সংরক্ষণ ও AI যাচাই
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}

        {/* 2. BENGALI FORM */}
        {activeTab === 'bangla' && (
          <Form
            form={banglaForm}
            layout="vertical"
            onFinish={onBanglaFinish}
            initialValues={{ sourceLanguage: 'পর্তুগিজ', exam: ['bcs'] }}
          >
            <Form.Item
              label={<span className="font-bold text-gray-700">বাংলা শব্দ (Bangla Word)</span>}
              name="banglaWord"
              rules={[{ required: true, message: 'অনুগ্রহ করে বাংলা শব্দটি লিখুন' }]}
            >
              <Input size="large" placeholder="যেমন: আনারস, আলমারি, আদালত, চশমা, দারোগা..." className="rounded-xl" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-gray-700">উৎস ভাষা (Source Language)</span>}
              name="sourceLanguage"
              rules={[{ required: true, message: 'উৎস ভাষা নির্বাচন করুন' }]}
            >
              <Select
                size="large"
                showSearch
                options={BENGALI_LANGUAGES.map((lang) => ({ value: lang, label: lang }))}
                placeholder="উৎস ভাষা নির্বাচন করুন বা টাইপ করুন"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-gray-700">অর্থ বা ব্যুৎপত্তি রূপ (ঐচ্ছিক)</span>}
              name="meaning"
              tooltip="যেমন: হস্ত > হত্থ > হাত, অথবা শব্দের অর্থ"
            >
              <Input size="large" placeholder="যেমন: হস্ত > হত্থ > হাত" className="rounded-xl" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="font-bold text-gray-700">টার্গেট পরীক্ষা ক্যাটাগরি</span>}
                name="exam"
              >
                <Select
                  size="large"
                  mode="multiple"
                  options={EXAM_OPTIONS}
                  placeholder="পরীক্ষা নির্বাচন করুন"
                  className="rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-gray-700">নির্দিষ্ট পরীক্ষার নাম ও সাল (ঐচ্ছিক)</span>}
                name="examTag"
              >
                <Input size="large" placeholder="যেমন: ৩৮তম বিসিএস, BB AD 2022" className="rounded-xl" />
              </Form.Item>
            </div>

            <Form.Item className="mt-5 mb-0">
              <div className="flex justify-end gap-3">
                <Button
                  size="large"
                  icon={<ClearOutlined />}
                  onClick={() => banglaForm.resetFields()}
                  className="rounded-xl font-bold"
                >
                  মুছুন
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={banglaLoading}
                  icon={<PlusOutlined />}
                  className="bg-cyan-700 hover:!bg-cyan-600 rounded-xl font-bold px-6 shadow-md border-none text-white"
                >
                  বাংলা শব্দ সংরক্ষণ করুন
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400 font-bold">লোড হচ্ছে...</div>}>
      <AddWordContent />
    </Suspense>
  );
}
