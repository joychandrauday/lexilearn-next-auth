'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Form, AutoComplete, Select, Button, Card, Typography, Spin } from 'antd';
import { PlusOutlined, ClearOutlined, BookOutlined } from '@ant-design/icons';
import { toast } from 'sonner';

const { Option } = Select;
const { Title } = Typography;

export default function AddPage() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

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

  const onFinish = async (values: { word: string; intensity: string; exam: string }) => {
    if (!session?.user?.email) {
      toast.warning('শব্দ যোগ করতে প্রথমে সাইন ইন করুন');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/words', {
        word: values.word.trim(),
        intensity: values.intensity,
        exam: values.exam,
        userEmail: session.user.email,
      });

      if (res.data?.success) {
        toast.success(`"${values.word}" সফলভাবে সংরক্ষিত হয়েছে!`);
        router.push('/words');
      } else {
        toast.error('শব্দটি সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'শব্দ সংরক্ষণে ত্রুটি হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-10 px-4 font-sans">
      <Card className="w-full max-w-lg p-6 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            <BookOutlined />
          </div>
          <Title level={3} className="!font-black !text-gray-800 !mb-1">
            নতুন শব্দ যোগ করুন
          </Title>
          <p className="text-gray-500 text-xs">
            শব্দটি লিখলে স্বয়ংক্রিয়ভাবে অভিধানের অর্থ, বাংলা অনুবাদ ও উচ্চারণ যুক্ত হবে।
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ intensity: 'medium', exam: 'others' }}>
          <Form.Item
            label={<span className="font-bold text-gray-700">ইংরেজি শব্দ (English Word)</span>}
            name="word"
            rules={[{ required: true, message: 'অনুগ্রহ করে একটি ইংরেজি শব্দ লিখুন' }]}
          >
            <AutoComplete
              size="large"
              options={suggestions.map((word) => ({ value: word }))}
              onSearch={fetchSuggestions}
              placeholder="যেমন: ephemeral, tenacious, candid..."
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

          <Form.Item className="mt-4 mb-0">
            <div className="flex justify-end gap-3">
              <Button
                size="large"
                icon={<ClearOutlined />}
                onClick={() => {
                  (document.querySelector('form') as HTMLFormElement)?.reset();
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
                loading={loading}
                icon={<PlusOutlined />}
                className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold px-6 shadow-md"
              >
                শব্দ সংরক্ষণ করুন
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
