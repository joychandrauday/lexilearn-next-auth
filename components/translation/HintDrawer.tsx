'use client';

import React from 'react';
import { Collapse, Tag } from 'antd';
import { BulbOutlined, BookOutlined } from '@ant-design/icons';
import { IKeyVocabulary } from '../../lib/models/TranslationChallenge';

interface HintDrawerProps {
  keyVocabulary: IKeyVocabulary[];
  grammarStructure?: string;
}

export default function HintDrawer({ keyVocabulary, grammarStructure }: HintDrawerProps) {
  if (!keyVocabulary?.length && !grammarStructure) return null;

  const items = [
    ...(keyVocabulary?.length
      ? [
          {
            key: 'vocab',
            label: (
              <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                <BulbOutlined className="text-amber-500" /> গুরুত্বপূর্ণ পারিভাষিক শব্দভাণ্ডার (Vocabulary Hints)
              </span>
            ),
            children: (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {keyVocabulary.map((kv, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-gray-800">{kv.source}</span>
                      {kv.pos && (
                        <span className="ml-1 text-[10px] text-gray-400 font-normal">
                          ({kv.pos})
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{kv.target}</span>
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
    ...(grammarStructure
      ? [
          {
            key: 'grammar',
            label: (
              <span className="font-bold text-xs text-indigo-800 flex items-center gap-1.5">
                <BookOutlined className="text-indigo-500" /> ব্যাকরণ ও বাক্য কাঠামো গাইড (Structure Hint)
              </span>
            ),
            children: (
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-950 leading-relaxed font-sans">
                {grammarStructure}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="mb-4">
      <Collapse
        items={items}
        defaultActiveKey={[]}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      />
    </div>
  );
}
