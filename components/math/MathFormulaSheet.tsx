'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ThunderboltOutlined,
  BulbOutlined,
  CopyOutlined,
  CheckOutlined,
  BookOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Button, Tag, Spin } from 'antd';
import { toast } from 'sonner';
import MathKatexRenderer from './MathKatexRenderer';

interface MathFormulaSheetProps {
  stream: 'bank' | 'bcs' | 'primary_ntrca';
  selectedTopic?: string;
}

export default function MathFormulaSheet({ stream, selectedTopic }: MathFormulaSheetProps) {
  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormulas() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({ stream });
        if (selectedTopic && selectedTopic !== 'all') {
          queryParams.append('topic', selectedTopic);
        }
        const res = await fetch(`/api/math/formulas?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setVaults(data.vaults || []);
        }
      } catch {
        toast.error('সূত্র লোড করতে ব্যর্থ হয়েছে');
      } finally {
        setLoading(false);
      }
    }

    loadFormulas();
  }, [stream, selectedTopic]);

  const handleCopyFormula = (formula: any, key: string) => {
    const text = `${formula.name}:\n${formula.latex}\n${formula.explanation}\nShortcut: ${formula.shortcutHack || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('সূত্রটি কপি করা হয়েছে');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <ThunderboltOutlined className="text-4xl text-amber-500/50 mb-3" />
        <h3 className="text-gray-300 font-semibold text-base mb-1">
          কোন সূত্র ভল্ট পাওয়া যায়নি
        </h3>
        <p className="text-gray-500 text-xs">
          অন্য টপিক নির্বাচন করুন অথবা রিফ্রেশ দিন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {vaults.map((vault, vIdx) => (
        <motion.div
          key={vault._id || vIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-gray-800">
            <div>
              <h3 className="text-lg font-bold text-white mb-0.5">
                {vault.titleBn || vault.title}
              </h3>
              <p className="text-xs text-gray-400 capitalize">
                {vault.category} • {vault.topic?.replace(/_/g, ' ')}
              </p>
            </div>
            <Tag color="gold" className="font-semibold flex items-center gap-1">
              <ThunderboltOutlined /> সূত্র ও শর্টকাট ভল্ট
            </Tag>
          </div>

          {/* Formulas Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {vault.formulas?.map((formula: any, fIdx: number) => {
              const uniqueKey = `${vIdx}-${fIdx}`;
              return (
                <div
                  key={fIdx}
                  className="bg-gray-950/90 border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all"
                >
                  <div>
                    {/* Formula Title & Copy */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-gray-200">
                        {formula.name}
                      </span>
                      <Button
                        size="small"
                        type="text"
                        icon={
                          copiedKey === uniqueKey ? (
                            <CheckOutlined className="text-emerald-400" />
                          ) : (
                            <CopyOutlined />
                          )
                        }
                        onClick={() => handleCopyFormula(formula, uniqueKey)}
                        className="text-gray-400 hover:text-white"
                      />
                    </div>

                    {/* Formula LaTeX Display */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-center mb-3">
                      <span className="text-amber-300 font-mono font-bold text-sm sm:text-base">
                        <MathKatexRenderer content={`$$${formula.latex}$$`} />
                      </span>
                    </div>

                    {/* Explanation */}
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">
                      {formula.explanation}
                    </p>
                  </div>

                  {/* Shortcut Hack Banner */}
                  {formula.shortcutHack && (
                    <div className="mt-2 pt-2 border-t border-gray-800/60 flex items-start gap-1.5 text-[11px] text-amber-400/90">
                      <BulbOutlined className="shrink-0 mt-0.5 text-amber-400" />
                      <span>
                        <strong>শর্টকাট হ্যাক:</strong> {formula.shortcutHack}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Cheat Sheet Bullet Points */}
          {vault.cheatSheetSummary && vault.cheatSheetSummary.length > 0 && (
            <div className="bg-gray-950/50 border border-gray-800/60 rounded-xl p-4">
              <span className="text-xs font-bold text-gray-400 block mb-2 flex items-center gap-1.5">
                <FileTextOutlined className="text-amber-400" />
                স্মার্ট রিভিশন নোটস (Quick Notes):
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                {vault.cheatSheetSummary.map((point: string, pIdx: number) => (
                  <li key={pIdx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
