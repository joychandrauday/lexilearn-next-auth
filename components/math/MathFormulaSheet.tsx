'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  ThunderboltOutlined,
  BulbOutlined,
  CopyOutlined,
  CheckOutlined,
  BookOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FireOutlined,
  ArrowRightOutlined,
  BookFilled,
} from '@ant-design/icons';
import { Button, Input, Tag, Spin, Tooltip } from 'antd';
import { toast } from 'sonner';
import MathKatexRenderer from './MathKatexRenderer';

interface MathFormulaSheetProps {
  stream: 'bank' | 'bcs' | 'primary_ntrca';
  selectedTopic?: string;
  onSelectTopicForDrill?: (topic: string) => void;
}

export default function MathFormulaSheet({
  stream,
  selectedTopic,
  onSelectTopicForDrill,
}: MathFormulaSheetProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';

  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<any[]>([]);
  const [activeTopicFilter, setActiveTopicFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Sync prop selectedTopic if provided
  useEffect(() => {
    if (selectedTopic && selectedTopic !== 'all') {
      setActiveTopicFilter(selectedTopic);
    }
  }, [selectedTopic]);

  useEffect(() => {
    async function loadFormulas() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({ stream });
        const res = await fetch(`/api/math/formulas?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setVaults(data.vaults || []);
        }
      } catch {
        toast.error('গণিত সূত্র লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    }

    loadFormulas();
  }, [stream]);

  // Extract unique topic list for fast pills
  const availableTopics = useMemo(() => {
    const map = new Map<string, string>();
    vaults.forEach((v) => {
      if (v.topic) {
        map.set(v.topic, v.titleBn || v.title || v.topic.replace(/_/g, ' '));
      }
    });
    return Array.from(map.entries()).map(([topic, label]) => ({ topic, label }));
  }, [vaults]);

  // Filter vaults and formulas
  const filteredVaults = useMemo(() => {
    let result = vaults;

    // Filter by topic pill
    if (activeTopicFilter !== 'all') {
      result = result.filter((v) => v.topic === activeTopicFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result
        .map((v) => {
          const matchedFormulas = v.formulas?.filter((f: any) => {
            return (
              f.name?.toLowerCase().includes(q) ||
              f.latex?.toLowerCase().includes(q) ||
              f.explanation?.toLowerCase().includes(q) ||
              f.shortcutHack?.toLowerCase().includes(q)
            );
          });

          const titleMatched =
            v.title?.toLowerCase().includes(q) ||
            v.titleBn?.toLowerCase().includes(q) ||
            v.category?.toLowerCase().includes(q) ||
            v.topic?.toLowerCase().includes(q);

          if (titleMatched) {
            return v;
          }

          if (matchedFormulas && matchedFormulas.length > 0) {
            return {
              ...v,
              formulas: matchedFormulas,
            };
          }

          return null;
        })
        .filter(Boolean);
    }

    return result;
  }, [vaults, activeTopicFilter, searchQuery]);

  // Total formulas count
  const totalFormulaCount = useMemo(() => {
    return filteredVaults.reduce((acc, v) => acc + (v.formulas?.length || 0), 0);
  }, [filteredVaults]);

  const handleCopyFormula = (formula: any, key: string) => {
    const text = `${formula.name}\nLaTeX: ${formula.latex}\nব্যাখ্যা: ${formula.explanation}\nশর্টকাট হ্যাক: ${formula.shortcutHack || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('সূত্রটি ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToNotebook = async (vault: any, formula: any, key: string) => {
    if (!userEmail) {
      toast.info('নোটবুকে সংরক্ষণ করতে অনুগ্রহ করে লগইন করুন');
      return;
    }

    setSavingKey(key);
    try {
      const res = await fetch('/api/user/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          title: `[Formula - ${vault.stream.toUpperCase()}] ${formula.name}`,
          itemType: 'rule',
          subject: 'math',
          category: vault.category,
          content: `সূত্র:\n$$${formula.latex}$$\n\nব্যবহার ও প্রয়োগ:\n${formula.explanation}\n\nবাস্তব উদাহরণ:\n${formula.sampleApplication || 'উপরে বর্ণিত নিয়মে সরাসরি প্রয়োগযোগ্য।'}`,
          mnemonic: formula.shortcutHack ? `শর্টকাট হ্যাক: ${formula.shortcutHack}` : '',
          tags: [vault.stream, vault.topic, 'formula-vault'],
          targetExam: vault.stream.toUpperCase(),
          priority: 'high',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`"${formula.name}" প্রস্তুতি নোটবুকে সেভ হয়েছে!`);
      } else {
        toast.error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক সংযোগে সমস্যা হয়েছে');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-3">
        <Spin size="large" />
        <span className="text-xs text-amber-400/80 font-medium tracking-wide">
          গণিত ফর্মুলা ভল্ট ও শর্টকাট লোড হচ্ছে...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP CONTROLS: FAST SEARCH & TOPIC PILLS & VIEW MODE */}
      {/* ========================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
        {/* Search & Mode Switcher Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Input
              prefix={<SearchOutlined className="text-amber-400 text-sm mr-1.5" />}
              placeholder="সূত্র, শর্টকাট বা অধ্যায় সার্চ করুন (যেমন: CI, discount, ট্রেনের বেগ, লসাগু)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="bg-slate-950/90 border-slate-700/80 text-white rounded-2xl h-11 text-xs sm:text-sm hover:border-amber-500 focus:border-amber-500"
            />
          </div>

          {/* View Mode Toggle & Count Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <span className="text-xs text-slate-400 font-medium">
              মোট সূত্র: <strong className="text-amber-400 font-mono">{totalFormulaCount}</strong>
            </span>

            <div className="inline-flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'cards'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="বিস্তারিত কার্ড ভিউ"
              >
                <AppstoreOutlined />
                <span className="hidden sm:inline">স্টুডিও কার্ড</span>
              </button>

              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'compact'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="কমপ্যাক্ট পকেট ভিউ (২ মিনিটে রিভিশন)"
              >
                <BarsOutlined />
                <span className="hidden sm:inline">পকেট শিট</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Topic Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTopicFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTopicFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            সব অধ্যায় ({vaults.length})
          </button>

          {availableTopics.map(({ topic, label }) => (
            <button
              key={topic}
              onClick={() => setActiveTopicFilter(topic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTopicFilter === topic
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* EMPTY STATE */}
      {/* ========================================================= */}
      {filteredVaults.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <ThunderboltOutlined className="text-4xl text-amber-400/50 mb-3" />
          <h3 className="text-slate-200 font-bold text-base mb-1">
            কোনো সূত্র বা শর্টকাট খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto mb-4 leading-relaxed">
            অন্য কোনো কিওয়ার্ড বা অধ্যায় নির্বাচন করুন অথবা ফিল্টার রিসেট দিন।
          </p>
          <Button
            size="small"
            onClick={() => {
              setActiveTopicFilter('all');
              setSearchQuery('');
            }}
            className="bg-amber-500/20 text-amber-300 border-amber-500/40 rounded-xl font-bold"
          >
            সব সূত্র দেখুন
          </Button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DETAILED STUDIO CARD VIEW */}
      {/* ========================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {filteredVaults.map((vault: any, vIdx: number) => (
            <motion.div
              key={vault._id || vIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-xl transition-all"
            >
              {/* Vault Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      {vault.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{vault.topic?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {vault.titleBn || vault.title}
                  </h3>
                </div>

                {/* Drill Practice Jump Button */}
                {onSelectTopicForDrill && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    onClick={() => onSelectTopicForDrill(vault.topic)}
                    className="bg-emerald-600 hover:!bg-emerald-500 text-white font-bold rounded-xl h-8 px-3.5 text-xs border-0 shadow-sm flex items-center"
                  >
                    এই নিয়মের প্রশ্ন ড্রিল করুন
                  </Button>
                )}
              </div>

              {/* Formulas Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                {vault.formulas?.map((formula: any, fIdx: number) => {
                  const uniqueKey = `${vIdx}-${fIdx}`;
                  return (
                    <div
                      key={fIdx}
                      className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-950/20 transition-all group"
                    >
                      <div>
                        {/* Title & Actions */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                            {formula.name}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            <Tooltip title="প্রস্তুতি নোটবুকে সেভ করুন">
                              <Button
                                size="small"
                                type="text"
                                icon={<BookFilled className="text-slate-400 hover:text-emerald-400 text-sm" />}
                                loading={savingKey === uniqueKey}
                                onClick={() => handleSaveToNotebook(vault, formula, uniqueKey)}
                                className="text-slate-400 hover:text-emerald-400"
                              />
                            </Tooltip>

                            <Tooltip title="ক্লিপবোর্ডে কপি করুন">
                              <Button
                                size="small"
                                type="text"
                                icon={
                                  copiedKey === uniqueKey ? (
                                    <CheckOutlined className="text-emerald-400 text-sm" />
                                  ) : (
                                    <CopyOutlined className="text-slate-400 hover:text-amber-400 text-sm" />
                                  )
                                }
                                onClick={() => handleCopyFormula(formula, uniqueKey)}
                                className="text-slate-400 hover:text-amber-400"
                              />
                            </Tooltip>
                          </div>
                        </div>

                        {/* Formula KaTeX Box */}
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-900 border border-amber-500/30 rounded-xl text-center mb-3 shadow-inner overflow-x-auto">
                          <span className="text-amber-300 font-mono font-extrabold text-sm sm:text-base">
                            <MathKatexRenderer content={`$$${formula.latex}$$`} />
                          </span>
                        </div>

                        {/* Explanation / Context */}
                        <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed mb-3">
                          {formula.explanation}
                        </p>
                      </div>

                      {/* Shortcut Hack & Sample Application */}
                      <div className="space-y-2 mt-2 pt-2.5 border-t border-slate-800/80">
                        {formula.shortcutHack && (
                          <div className="flex items-start gap-2 text-xs text-amber-300/95 bg-amber-500/10 border border-amber-500/25 p-2.5 rounded-xl">
                            <BulbOutlined className="shrink-0 mt-0.5 text-amber-400 text-sm" />
                            <div>
                              <strong className="text-amber-200">শর্টকাট হ্যাক:</strong>{' '}
                              <span>{formula.shortcutHack}</span>
                            </div>
                          </div>
                        )}

                        {formula.sampleApplication && (
                          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono">
                            <span className="text-slate-500 font-sans font-semibold">পরীক্ষার প্রয়োগ:</span>{' '}
                            {formula.sampleApplication}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Revision Notes (Cheat Sheet Summary) */}
              {vault.cheatSheetSummary && vault.cheatSheetSummary.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                  <span className="text-xs font-bold text-amber-400/90 block mb-2 flex items-center gap-1.5">
                    <FireOutlined className="text-amber-400" />
                    পরীক্ষার আগের রাতের জরুরি রিভিশন নোটস (Key Reminders):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
                    {vault.cheatSheetSummary.map((point: string, pIdx: number) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. COMPACT POCKET CHEAT SHEET VIEW (Rapid 2-Minute Brush-up) */}
      {/* ========================================================= */}
      {viewMode === 'compact' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ThunderboltOutlined className="text-amber-400" />
                পকেট ফর্মুলা চিট শিট (Pocket Quick Sheet)
              </h3>
              <p className="text-xs text-slate-400">
                পরীক্ষার হলে ঢোকার আগের শেষ মুহূর্তের একনজরে রিভিশন চার্ট
              </p>
            </div>
            <Tag color="gold" className="font-bold">
              Rapid Review
            </Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVaults.flatMap((v: any, vIdx: number) =>
              (v.formulas || []).map((f: any, fIdx: number) => {
                const uniqueKey = `compact-${vIdx}-${fIdx}`;
                return (
                  <div
                    key={uniqueKey}
                    className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-slate-200">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full font-mono">
                          {v.topic?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center my-2">
                        <span className="text-amber-300 font-mono font-bold text-xs sm:text-sm">
                          <MathKatexRenderer content={`$$${f.latex}$$`} />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                      <span className="truncate pr-2">
                        {f.shortcutHack || f.explanation}
                      </span>
                      <Button
                        size="small"
                        type="text"
                        icon={copiedKey === uniqueKey ? <CheckOutlined className="text-emerald-400" /> : <CopyOutlined />}
                        onClick={() => handleCopyFormula(f, uniqueKey)}
                        className="text-slate-400 hover:text-white shrink-0"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
