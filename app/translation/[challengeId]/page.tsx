'use client';

import React, { useEffect, useState, use } from 'react';
import { Spin, Button, Result } from 'antd';
import Link from 'next/link';
import TranslationWorkspace from '../../../components/translation/TranslationWorkspace';
import { getTranslationChallengeById } from '../../../actions/translation.actions';

export default function TranslationChallengePage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.challengeId;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTranslationChallengeById(challengeId)
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setData(res);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [challengeId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-xs text-gray-500 font-bold">ট্রান্সলেশন স্টুডিও প্রস্তুত হচ্ছে...</p>
      </div>
    );
  }

  if (error || !data?.challenge) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <Result
          status="404"
          title="চ্যালেঞ্জ পাওয়া যায়নি"
          subTitle={error || 'অনুরোধকৃত ট্রান্সলেশন চ্যালেঞ্জটি বিদ্যমান নেই।'}
          extra={
            <Link href="/translation">
              <Button type="primary" className="bg-emerald-600 rounded-xl font-bold">
                ক্যাটালগে ফিরুন
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <TranslationWorkspace
        challenge={data.challenge}
        initialAttempt={data.attempt}
      />
    </div>
  );
}
