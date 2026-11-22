'use client';

import React from 'react';
import { Button, Tooltip } from 'antd';
import { TrophyFilled, CheckCircleFilled } from '@ant-design/icons';

interface IdiomsFinishBatchButtonProps {
  isReady: boolean;
  onFinish: () => void;
  loading: boolean;
  flippedCount: number;
  totalCount: number;
}

export default function IdiomsFinishBatchButton({
  isReady,
  onFinish,
  loading,
  flippedCount,
  totalCount,
}: IdiomsFinishBatchButtonProps) {
  const tooltipText = isReady
    ? 'সবকটি ইডিয়াম ফ্লিপ করা সম্পন্ন হয়েছে! ব্যাচ শেষ করতে ক্লিক করুন।'
    : `ব্যাচ সম্পন্ন করতে বাকি রয়েছে ${totalCount - flippedCount}টি ইডিয়াম। সবকটি কার্ড অন্তত একবার উল্টে দেখুন।`;

  return (
    <Tooltip title={tooltipText} placement="top">
      <div>
        <Button
          type="primary"
          size="large"
          disabled={!isReady || loading}
          loading={loading}
          onClick={onFinish}
          icon={isReady ? <TrophyFilled className="text-amber-300" /> : <CheckCircleFilled />}
          className={`h-12 px-6 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md ${
            isReady
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 scale-105 animate-pulse text-white'
              : 'bg-gray-200 text-gray-400 border-0 cursor-not-allowed'
          }`}
        >
          {isReady ? 'ব্যাচ সম্পন্ন করুন (Finish Batch) 🏆' : `বাকি ${totalCount - flippedCount}টি উল্টান`}
        </Button>
      </div>
    </Tooltip>
  );
}
