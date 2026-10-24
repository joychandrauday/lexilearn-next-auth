'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Select, Spin, Tag, Card } from 'antd';
import {
  CloudUploadOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';

interface IParsedItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  exam: string;
  topic: string;
}

export default function AdminImporterPage() {
  const [rawText, setRawText] = useState('');
  const [exam, setExam] = useState('bcs');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<IParsedItem[]>([]);
  const [saving, setSaving] = useState(false);

  const sampleQuestion = `1. What is the synonym of 'Competent'?
(A) Capable
(B) Inept
(C) Careless
(D) Sluggish
Ans: (A) Capable. ব্যাখ্যা: Competent অর্থ যোগ্য বা দক্ষ।

2. The idiom 'A cock and bull story' means:
(A) A true story
(B) An absurd tale
(C) A children story
(D) A wildlife documentary
Ans: (B) An absurd tale. ব্যাখ্যা: আজগুবি গল্প।`;

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error('অনুগ্রহ করে পরীক্ষার প্রশ্ন পেস্ট করুন');
      return;
    }

    setLoading(true);
    setParsed([]);

    try {
      const res = await axios.post('/api/admin/import', {
        rawText,
        exam,
        saveDirectly: false,
      });

      if (res.data.success && res.data.questions?.length > 0) {
        setParsed(res.data.questions);
        toast.success(`সফলভাবে ${res.data.questions.length}টি প্রশ্ন পার্স করা হয়েছে!`);
      } else {
        toast.error(res.data.message || 'প্রশ্ন পার্স করা সম্ভব হয়নি');
      }
    } catch {
      toast.error('AI পার্সারে ত্রুটি হয়েছে। অনুগ্রহ করে API কী নিশ্চিত করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post('/api/admin/import', {
        rawText,
        exam,
        saveDirectly: true,
      });

      if (res.data.success) {
        toast.success(`ডাটাবেজে ${res.data.savedCount || parsed.length}টি নতুন শব্দ/প্রশ্ন সেভ হয়েছে!`);
      }
    } catch {
      toast.error('ডাটাবেজে সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl mb-6">
        <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-indigo-400/30">
          মাল্টি-এলএলএম কনটেন্ট ইঞ্জিন • Admin Importer
        </span>
        <h1 className="text-3xl md:text-4xl font-black mb-1">বিগত প্রশ্ন ইম্পোর্টার 🚀</h1>
        <p className="text-indigo-200/80 text-sm max-w-xl font-normal leading-relaxed">
          যেকোনো বিসিএস বা ব্যাংক পরীক্ষার কাঁচা প্রশ্ন পেস্ট করুন। <strong>Groq & Gemini AI</strong>{' '}
          মুহূর্তের মধ্যে অপশন, সঠিক উত্তর, ব্যাখ্যা ও টপিক আলাদা করে ডাটাবেজ তৈরি করে দেবে।
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <label className="font-bold text-gray-700 text-sm">কাঁচা প্রশ্ন পেস্ট করুন (Raw Exam Text):</label>
          <div className="flex items-center gap-2">
            <Select
              value={exam}
              onChange={(val) => setExam(val)}
              className="w-36 rounded-xl"
              options={[
                { label: 'বিসিএস (BCS)', value: 'bcs' },
                { label: 'ব্যাংক (Bank)', value: 'bank' },
                { label: 'প্রাইমারি শিক্ষক', value: 'primary' },
                { label: 'নিবন্ধন (NTRCA)', value: 'ntrca' },
              ]}
            />
            <Button
              size="small"
              onClick={() => setRawText(sampleQuestion)}
              className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200 font-bold"
            >
              নমুনা প্রশ্ন বসান
            </Button>
          </div>
        </div>

        <Input.TextArea
          rows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="এখানে পরীক্ষার প্রশ্নাবলি পেস্ট করুন..."
          className="rounded-2xl p-4 text-sm font-mono border-gray-200 mb-4"
        />

        <div className="flex justify-end gap-3">
          <Button
            type="primary"
            size="large"
            loading={loading}
            icon={<ThunderboltOutlined />}
            onClick={handleParse}
            className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-11 px-6 shadow-md"
          >
            AI দিয়ে পার্স করুন (Groq / Gemini)
          </Button>
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500 font-bold text-sm">AI প্রশ্নগুলো বিশ্লেষণ ও পার্স করছে...</p>
        </div>
      )}

      {parsed.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <span className="text-sm font-bold text-emerald-900">
              পার্স সম্পন্ন: {parsed.length} টি প্রশ্ন পাওয়া গেছে
            </span>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleBulkSave}
              className="bg-emerald-700 font-bold rounded-xl"
            >
              ডাটাবেজে যুক্ত করুন
            </Button>
          </div>

          <div className="space-y-3">
            {parsed.map((q, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-base m-0">
                    {idx + 1}. {q.question}
                  </h3>
                  <Tag color="cyan" className="uppercase font-bold text-[10px]">
                    {q.topic || 'General'}
                  </Tag>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  {q.options?.map((opt, i) => (
                    <span
                      key={i}
                      className={`p-2 rounded-lg border font-medium ${
                        opt === q.correctAnswer
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {opt} {opt === q.correctAnswer && '✓ (সঠিক)'}
                    </span>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 m-0 leading-relaxed">
                    <strong className="text-gray-700">ব্যাখ্যা:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
