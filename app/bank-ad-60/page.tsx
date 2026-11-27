'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BankAd60Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const enroll = async () => {
    setLoading(true);
    await fetch('/api/bank-ad/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate: new Date().toISOString().slice(0, 10) }) });
    setLoading(false);
    router.push('/bank-ad-60/dashboard');
  };
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-center">Bangladesh Bank AD — 60-Day Plan</h1>
      <p className="text-center text-gray-600 max-w-md">Enroll to track your own progress, notes, and mocks. Mobile-friendly.</p>
      <button onClick={enroll} disabled={loading} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50">
        {loading ? 'Enrolling…' : 'Enroll Now'}
      </button>
    </div>
  );
}
