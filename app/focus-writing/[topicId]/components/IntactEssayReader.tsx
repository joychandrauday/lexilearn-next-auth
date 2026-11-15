'use client';

import React, { useState } from 'react';
import { Card, Button, Tag, Table, Tooltip, message } from 'antd';
import {
  CopyOutlined,
  CheckOutlined,
  EditOutlined,
  ClockCircleOutlined,
  BankOutlined,
  GlobalOutlined,
  FontSizeOutlined,
  BgColorsOutlined,
  PrinterOutlined,
} from '@ant-design/icons';

interface IntactEssayReaderProps {
  topic: any;
  onStartExam: () => void;
}

export default function IntactEssayReader({ topic, onStartExam }: IntactEssayReaderProps) {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [theme, setTheme] = useState<'white' | 'sepia' | 'dark'>('white');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans');
  const [copied, setCopied] = useState(false);

  // Calculate approximate reading time (average 160 words per minute for dense economic material)
  const approxWords = (topic.fullText || '').split(/\s+/).filter(Boolean).length || 600;
  const readTimeMinutes = Math.max(3, Math.ceil(approxWords / 160));

  const handleCopy = () => {
    if (!topic.fullText) return;
    navigator.clipboard.writeText(topic.fullText);
    setCopied(true);
    message.success('সম্পূর্ণ রচনার টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Font size classes
  const fontClass =
    fontSize === 'sm'
      ? 'text-sm leading-relaxed'
      : fontSize === 'base'
      ? 'text-base leading-relaxed'
      : fontSize === 'lg'
      ? 'text-lg leading-loose'
      : 'text-xl leading-loose';

  // Theme container classes
  const themeContainer =
    theme === 'sepia'
      ? 'bg-[#fbf7ee] text-[#2c2214] border-[#e2d6bc] shadow-sm'
      : theme === 'dark'
      ? 'bg-[#111317] text-[#e0e3eb] border-[#242831] shadow-md'
      : 'bg-white text-slate-900 border-slate-300 shadow-sm';

  const themeHeading =
    theme === 'sepia'
      ? 'text-[#2e1d08]'
      : theme === 'dark'
      ? 'text-white'
      : 'text-slate-950';

  const themeParagraph =
    theme === 'sepia'
      ? 'text-[#362615]'
      : theme === 'dark'
      ? 'text-[#d3d8e2]'
      : 'text-slate-800';

  // Sub-cards per section
  const prospectCard =
    theme === 'sepia'
      ? 'bg-[#f4ebd6] border-[#dfd4bd] text-[#2c2214]'
      : theme === 'dark'
      ? 'bg-[#181b22] border-[#292f3c] text-[#e0e3eb]'
      : 'bg-slate-50 border-slate-200 text-slate-900';

  const challengeCard =
    theme === 'sepia'
      ? 'bg-[#f6ebd5] border-[#e4ceaa] text-[#422907]'
      : theme === 'dark'
      ? 'bg-[#221c14] border-[#44331a] text-[#f5d9ad]'
      : 'bg-amber-50/70 border-amber-200 text-amber-950';

  const challengeHeading =
    theme === 'sepia'
      ? 'text-[#422907]'
      : theme === 'dark'
      ? 'text-[#fcd99d]'
      : 'text-amber-950';

  const recommendationCard =
    theme === 'sepia'
      ? 'bg-[#edf5e7] border-[#ccdfc0] text-[#1e3b12]'
      : theme === 'dark'
      ? 'bg-[#14231b] border-[#1d422d] text-[#a9e8c4]'
      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950';

  const recommendationHeading =
    theme === 'sepia'
      ? 'text-[#1e3b12]'
      : theme === 'dark'
      ? 'text-[#a9e8c4]'
      : 'text-emerald-950';

  const themeQuote =
    theme === 'sepia'
      ? 'bg-[#f2e6cb] border-amber-700 text-[#422e15]'
      : theme === 'dark'
      ? 'bg-[#162033] border-blue-500 text-blue-100'
      : 'bg-blue-50 border-blue-600 text-blue-950';

  const isEn = topic.language === 'EN';

  const indicatorColumns = [
    {
      title: isEn ? 'Economic Indicator' : 'অর্থনৈতিক সূচক',
      dataIndex: 'indicator',
      key: 'indicator',
      render: (t: string) => <span className="font-bold">{t}</span>,
    },
    {
      title: isEn ? 'Official Data / Figure' : 'সাম্প্রতিক উপাত্ত',
      dataIndex: 'data',
      key: 'data',
      render: (t: string) => (
        <span className={`font-black px-2 py-0.5 rounded text-xs sm:text-sm inline-block ${
          theme === 'dark'
            ? 'text-blue-300 bg-blue-950/80 border border-blue-800'
            : theme === 'sepia'
            ? 'text-amber-900 bg-amber-200/60 border border-amber-300'
            : 'text-blue-800 bg-blue-100 border border-blue-200'
        }`}>
          {t}
        </span>
      ),
    },
    {
      title: isEn ? 'Source' : 'অফিসিয়াল উৎস',
      dataIndex: 'source',
      key: 'source',
      render: (t: string) => <span className="text-xs opacity-75 font-medium">{t}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scoped CSS for Theme-Aware Tables */}
      <style jsx global>{`
        .reader-table-sepia .ant-table {
          background-color: #fbf7ee !important;
          color: #2c2214 !important;
        }
        .reader-table-sepia .ant-table-thead > tr > th {
          background-color: #ede2c9 !important;
          color: #2e1d08 !important;
          border-bottom: 1px solid #d9cbab !important;
        }
        .reader-table-sepia .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e8dcbf !important;
          color: #362615 !important;
        }
        .reader-table-dark .ant-table {
          background-color: #111317 !important;
          color: #e0e3eb !important;
        }
        .reader-table-dark .ant-table-thead > tr > th {
          background-color: #1e222b !important;
          color: #f0f3fa !important;
          border-bottom: 1px solid #2e3442 !important;
        }
        .reader-table-dark .ant-table-tbody > tr > td {
          border-bottom: 1px solid #262a36 !important;
          color: #d3d8e2 !important;
        }

        @media print {
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print, nav, header:not(.print-header), footer, button, .ant-btn {
            display: none !important;
          }
          article {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .ant-table, blockquote, .rounded-2xl {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-only {
            display: block !important;
          }
        }

        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* READER CONTROLS TOOLBAR */}
      <div className="no-print bg-white border border-slate-300 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Read Time & Attribution Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <ClockCircleOutlined className="text-blue-600" /> প্রায় {readTimeMinutes} মিনিট পাঠ
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
            <BankOutlined className="text-amber-700" /> উৎস: P2A Academy
          </span>
        </div>

        {/* Customization Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Font Family Toggle */}
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-100">
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-3 py-1 text-xs font-bold transition-colors ${
                fontFamily === 'sans' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Sans
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-3 py-1 text-xs font-serif font-bold transition-colors ${
                fontFamily === 'serif' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Serif
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-100">
            {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`px-2.5 py-1 text-xs font-extrabold transition-colors ${
                  fontSize === sz ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {sz === 'sm' ? 'A-' : sz === 'base' ? 'A' : sz === 'lg' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          {/* Theme Palette */}
          <div className="flex items-center gap-1.5 border border-slate-300 rounded-xl p-1 bg-slate-100">
            <button
              onClick={() => setTheme('white')}
              title="Light White"
              className={`w-6 h-6 rounded-lg bg-white border-2 border-slate-300 transition-all ${
                theme === 'white' ? 'ring-2 ring-blue-600 border-white' : ''
              }`}
            />
            <button
              onClick={() => setTheme('sepia')}
              title="Warm Sepia"
              className={`w-6 h-6 rounded-lg bg-[#fbf7ee] border-2 border-[#d6caa9] transition-all ${
                theme === 'sepia' ? 'ring-2 ring-amber-600 border-[#fbf7ee]' : ''
              }`}
            />
            <button
              onClick={() => setTheme('dark')}
              title="Dark OLED"
              className={`w-6 h-6 rounded-lg bg-[#111317] border-2 border-slate-700 transition-all ${
                theme === 'dark' ? 'ring-2 ring-blue-500 border-[#111317]' : ''
              }`}
            />
          </div>

          {/* Copy Button */}
          <Tooltip title="সম্পূর্ণ রচনা কপি করুন">
            <Button
              size="small"
              icon={copied ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
              onClick={handleCopy}
              className="rounded-xl text-xs font-bold border-slate-300 text-slate-800"
            >
              {copied ? 'কপি হয়েছে' : 'কপি'}
            </Button>
          </Tooltip>

          {/* Print / Save PDF Button */}
          <Tooltip title="মুদ্রণ বা পিডিএফ হিসেবে সেভ করুন">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="rounded-xl text-xs font-bold border-slate-300 text-slate-800 hover:border-blue-500 hover:text-blue-600"
            >
              প্রিন্ট / PDF
            </Button>
          </Tooltip>

          {/* Exam Trigger */}
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={onStartExam}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black shadow-xs"
          >
            সিমুলেটরে লিখুন
          </Button>
        </div>
      </div>

      {/* FULL ESSAY READING CANVAS */}
      <article
        className={`rounded-3xl border p-6 sm:p-10 transition-colors duration-200 ${themeContainer} ${
          fontFamily === 'serif' ? 'font-serif' : 'font-sans'
        }`}
      >
        {/* PRINT ONLY OFFICIAL HEADER */}
        <div className="print-only mb-6 pb-4 border-b-2 border-slate-900">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-700">
            <span>PrepOwl Bank Focus Writing Studio • Topic #{topic.topicNumber}</span>
            <span>{isEn ? 'English Focus Writing' : 'বাংলা ফোকাস রাইটিং'}</span>
          </div>
          <h1 className="text-2xl font-black text-black mt-2 mb-1">
            {topic.title}
          </h1>
          {topic.titleBn && (
            <h2 className="text-base font-bold text-slate-800 m-0">
              {topic.titleBn}
            </h2>
          )}
          <div className="text-[11px] text-slate-600 mt-2">
            উৎস: P2A Academy (p2a.academy) • সংকলক: প্রবাল চক্রবর্তী, উপ-পরিচালক, বাংলাদেশ ব্যাংক & P2A Mentor Team
          </div>
        </div>

        {/* Topic Title */}
        <header className="mb-8 pb-6 border-b border-current/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white">
              টপিক #{topic.topicNumber}
            </span>
            <Tag color={isEn ? 'cyan' : 'geekblue'} className="font-extrabold border-none m-0">
              {isEn ? 'English Focus Writing' : 'বাংলা ফোকাস রাইটিং'}
            </Tag>
            <Tag color="default" className="text-xs font-bold m-0 border border-current/20">
              {topic.category}
            </Tag>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-black tracking-tight leading-snug ${themeHeading}`}>
            {topic.title}
          </h1>
          {topic.titleBn && (
            <h2 className="text-base sm:text-xl font-bold opacity-80 mt-2">
              {topic.titleBn}
            </h2>
          )}
        </header>

        {/* Authoritative Quotation */}
        {topic.quotation?.quote && (
          <section className="mb-8">
            <div className={`p-4 sm:p-5 rounded-2xl border-l-4 italic shadow-xs ${themeQuote}`}>
              <p className="text-sm sm:text-base leading-relaxed m-0 font-medium">
                “{topic.quotation.quote}”
              </p>
              {topic.quotation.author && (
                <div className="not-italic font-bold text-xs sm:text-sm mt-2 opacity-90">
                  — {topic.quotation.author}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 1. Introduction */}
        <section className="mb-8">
          <h3 className={`text-lg sm:text-xl font-black mb-3 ${themeHeading}`}>
            {isEn ? '1. Introduction & Context' : '১. ভূমিকা ও সামষ্টিক অর্থনৈতিক প্রেক্ষাপট'}
          </h3>
          <p className={`${fontClass} ${themeParagraph} leading-relaxed text-justify font-normal`}>
            {topic.introduction}
          </p>
        </section>

        {/* 2. Official Indicators Table */}
        {topic.indicators && topic.indicators.length > 0 && (
          <section className="mb-8">
            <h3 className={`text-lg sm:text-xl font-black mb-3 ${themeHeading}`}>
              {isEn ? '2. Relevant Economic Indicators' : '২. অর্থনৈতিক সূচক ও সাম্প্রতিক প্রমিত উপাত্ত'}
            </h3>
            <div className={`rounded-2xl overflow-hidden border border-current/20 shadow-xs ${
              theme === 'sepia' ? 'reader-table-sepia' : theme === 'dark' ? 'reader-table-dark' : ''
            }`}>
              <Table
                dataSource={topic.indicators}
                columns={indicatorColumns}
                pagination={false}
                rowKey="indicator"
                size="middle"
              />
            </div>
          </section>
        )}

        {/* 3. Prospects & Key Pillars */}
        {topic.prospects && topic.prospects.length > 0 && (
          <section className="mb-8">
            <h3 className={`text-lg sm:text-xl font-black mb-4 ${themeHeading}`}>
              {isEn ? '3. Prospects & Core Drivers' : '৩. মূল সম্ভাবনা ও চালিকাশক্তি'}
            </h3>
            <div className="space-y-4">
              {topic.prospects.map((p: any, idx: number) => (
                <div key={idx} className={`p-4 sm:p-5 rounded-2xl border shadow-xs ${prospectCard}`}>
                  <h4 className={`text-base font-black mb-1.5 ${themeHeading}`}>
                    {idx + 1}. {p.title}
                  </h4>
                  <p className={`${fontClass} opacity-95 m-0 text-justify leading-relaxed`}>
                    {p.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Challenges & Systemic Bottlenecks */}
        {topic.challenges && topic.challenges.length > 0 && (
          <section className="mb-8">
            <h3 className={`text-lg sm:text-xl font-black mb-4 ${themeHeading}`}>
              {isEn ? '4. Key Challenges & Systemic Bottlenecks' : '৪. ঝুঁকি ও কাঠামোগত চ্যালেঞ্জসমূহ'}
            </h3>
            <div className="space-y-4">
              {topic.challenges.map((c: any, idx: number) => (
                <div key={idx} className={`p-4 sm:p-5 rounded-2xl border shadow-xs ${challengeCard}`}>
                  <h4 className={`text-base font-black mb-1.5 ${challengeHeading}`}>
                    {idx + 1}. {c.title}
                  </h4>
                  <p className={`${fontClass} opacity-95 m-0 text-justify leading-relaxed`}>
                    {c.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Policy Recommendations & Way Forward */}
        {topic.recommendations && topic.recommendations.length > 0 && (
          <section className="mb-8">
            <h3 className={`text-lg sm:text-xl font-black mb-4 ${themeHeading}`}>
              {isEn ? '5. Policy Recommendations & Way Forward' : '৫. নীতি প্রস্তাবনা ও সংস্কার পরিকল্পনা'}
            </h3>
            <div className="space-y-4">
              {topic.recommendations.map((r: any, idx: number) => (
                <div key={idx} className={`p-4 sm:p-5 rounded-2xl border shadow-xs ${recommendationCard}`}>
                  <h4 className={`text-base font-black mb-1.5 ${recommendationHeading}`}>
                    {idx + 1}. {r.title}
                  </h4>
                  <p className={`${fontClass} opacity-95 m-0 text-justify leading-relaxed`}>
                    {r.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Conclusion */}
        {topic.conclusion && (
          <section className="mb-8">
            <h3 className={`text-lg sm:text-xl font-black mb-3 ${themeHeading}`}>
              {isEn ? '6. Conclusion' : '৬. উপসংহার'}
            </h3>
            <p className={`${fontClass} italic opacity-95 leading-relaxed text-justify`}>
              {topic.conclusion}
            </p>
          </section>
        )}

        {/* P2A ACADEMY OFFICIAL CREDIT & ATTRIBUTION CARD */}
        <footer className="mt-12 pt-6 border-t-2 border-current/20">
          <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
            theme === 'dark'
              ? 'bg-[#1b1914] border-amber-900/60 text-amber-200'
              : theme === 'sepia'
              ? 'bg-[#f4e9ce] border-[#dfcd9f] text-[#422807]'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-1 opacity-90">
                🏛️ উৎস ও কৃতজ্ঞতা স্বীকার (Source & Credit Attribution)
              </div>
              <p className="text-xs sm:text-sm m-0 font-bold leading-relaxed">
                এই ফোকাস রাইটিং ও অর্থনৈতিক পরিসংখ্যানসমূহ <strong>P2A Academy</strong> ও বাংলাদেশ ব্যাংকের উপ-পরিচালক <strong>প্রবাল চক্রবর্তী</strong> নির্দেশিত সংকলন থেকে সংগৃহীত।
              </p>
              <div className="text-[11px] opacity-80 mt-1 font-medium">
                সংকলক ও পরামর্শক: প্রবাল চক্রবর্তী (উপ-পরিচালক, বাংলাদেশ ব্যাংক & Instructor, P2A) • P2A Mentor Team
              </div>
            </div>

            <a
              href="https://www.p2a.academy"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button
                type="primary"
                icon={<GlobalOutlined />}
                className="bg-amber-600 hover:bg-amber-700 font-bold rounded-xl text-xs h-9 border-none shadow-sm"
              >
                P2A Academy ভিজিট করুন
              </Button>
            </a>
          </div>
        </footer>
      </article>

      {/* BOTTOM FLOATING CALL TO ACTION */}
      <div className="no-print p-6 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-white m-0">
            সম্পূর্ণ রচনা পড়া শেষ?
          </h3>
          <p className="text-xs text-blue-200 mt-1 m-0">
            এখনই ১৫ মিনিটের কাউন্টডাউন টাইমার অন করে নিজে লিখে ফেলুন এবং বাংলাদেশ ব্যাংক প্রমিত এআই স্কোর যাচাই করুন।
          </p>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<EditOutlined />}
          onClick={onStartExam}
          className="bg-white text-blue-800 hover:!bg-blue-50 font-black rounded-xl h-11 px-8 shadow-sm border-none shrink-0"
        >
          ১৫-মিনিট সিমুলেটর শুরু করুন
        </Button>
      </div>
    </div>
  );
}
