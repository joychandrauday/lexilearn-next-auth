'use client';

import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { CheckCircleFilled, LockOutlined } from '@ant-design/icons';
import { finishCurrentSession } from '../../actions/hf333.actions';
import { toast } from 'sonner';

interface FinishBatchButtonProps {
  sessionId: string;
  flippedCount: number;
  totalCount: number;
  onFinishSuccess: (data: { streakCount: number; masteredCount: number }) => void;
}

export default function FinishBatchButton({
  sessionId,
  flippedCount,
  totalCount,
  onFinishSuccess,
}: FinishBatchButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const isReady = flippedCount >= totalCount && totalCount > 0;
  const remainingCards = Math.max(0, totalCount - flippedCount);

  const handleFinish = async () => {
    if (!isReady) return;
    setSubmitting(true);
    try {
      const res = await finishCurrentSession(sessionId);
      if (!res.success) {
        toast.error(res.error || 'ব্যাচ সম্পন্ন করতে সমস্যা হয়েছে');
      } else {
        toast.success(res.message || 'ব্যাচ সফলভাবে সম্পন্ন হয়েছে!');
        onFinishSuccess({
          streakCount: res.streakCount || 1,
          masteredCount: res.masteredCount || 0,
        });
      }
    } catch (err: any) {
      toast.error('অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <Tooltip title={`ব্যাচ সম্পন্ন করতে আরও ${remainingCards}টি কার্ড ফ্লিপ করে বিস্তারিত দেখুন`}>
        <span>
          <Button
            disabled
            size="large"
            icon={<LockOutlined />}
            className="h-12 px-6 rounded-2xl font-bold bg-gray-100 text-gray-400 border-gray-200"
          >
            ব্যাচ সম্পন্ন করুন ({flippedCount}/{totalCount})
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      type="primary"
      size="large"
      loading={submitting}
      onClick={handleFinish}
      icon={<CheckCircleFilled />}
      className="h-12 px-8 rounded-2xl font-bold bg-emerald-600 hover:!bg-emerald-700 text-white shadow-lg shadow-emerald-200 animate-pulse"
    >
      ব্যাচ সমাপ্ত করুন ও মাস্টার্ড মার্ক করুন
    </Button>
  );
}
