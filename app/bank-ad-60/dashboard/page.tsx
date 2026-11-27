'use client';
import { useEffect, useState } from 'react';

export default function BankAd60Dashboard() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/bank-ad/blocks').then(r => r.json()).then(d => { setBlocks(d.blocks || []); setLoading(false); });
  }, []);
  if (loading) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">My 60-Day Plan</h1>
      <div className="grid gap-3">
        {blocks.slice(0, 20).map((b) => (
          <div key={b._id} className="rounded-xl border p-3">
            <div className="text-sm font-semibold">Day {b.dayNumber} — {b.timeBlock}</div>
            <div className="text-sm text-gray-600">{b.subject}</div>
            <div className="text-xs mt-1">{b.topics}</div>
            <div className="text-xs text-gray-500 mt-1">Status: {b.progress?.status || 'Not Started'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
