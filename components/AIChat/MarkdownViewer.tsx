'use client';

import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { text: string; indent: number }[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length === 0) return;
    const listItems = currentList.map((item, idx) => {
      const isSub = item.indent > 0;
      return (
        <li
          key={`${keyPrefix}-li-${idx}`}
          className={`flex items-start gap-2 text-xs sm:text-sm leading-relaxed ${
            isSub ? 'ml-4 text-gray-700 my-0.5' : 'text-gray-800 my-1'
          }`}
        >
          <span
            className={`mt-1.5 shrink-0 rounded-full ${
              isSub
                ? 'w-1.5 h-1.5 bg-emerald-400'
                : 'w-2 h-2 bg-emerald-600'
            }`}
          />
          <div className="flex-1">{renderInline(item.text)}</div>
        </li>
      );
    });

    elements.push(
      <ul key={`${keyPrefix}-ul`} className="my-2 space-y-1 pl-1">
        {listItems}
      </ul>
    );
    currentList = [];
  };

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();

    // Check list item (*, -, •)
    const listMatch = rawLine.match(/^(\s*)(?:[\*\-\•]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const indent = listMatch[1].length;
      const text = listMatch[2];
      currentList.push({ text, indent });
      return;
    }

    // Flush any pending list if we hit a non-list line
    if (currentList.length > 0) {
      flushList(`flush-${index}`);
    }

    // Empty line -> spacing
    if (!trimmed) {
      elements.push(<div key={`spacer-${index}`} className="h-1.5" />);
      return;
    }

    // Header 3 or 4: ### Header or #### Header
    if (trimmed.startsWith('####')) {
      const title = trimmed.replace(/^####\s*/, '');
      elements.push(
        <h5
          key={`h4-${index}`}
          className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-2.5 mb-1 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-3 bg-emerald-500 rounded-xs" />
          {renderInline(title)}
        </h5>
      );
      return;
    }

    if (trimmed.startsWith('###')) {
      const title = trimmed.replace(/^###\s*/, '');
      elements.push(
        <div
          key={`h3-${index}`}
          className="bg-slate-100/80 border-l-3 border-emerald-600 px-2.5 py-1.5 rounded-r-lg my-2 text-xs sm:text-sm font-black text-slate-900"
        >
          {renderInline(title)}
        </div>
      );
      return;
    }

    if (trimmed.startsWith('##')) {
      const title = trimmed.replace(/^##\s*/, '');
      elements.push(
        <h4
          key={`h2-${index}`}
          className="text-sm font-black text-slate-900 mt-3 mb-1.5 border-b border-gray-200 pb-1"
        >
          {renderInline(title)}
        </h4>
      );
      return;
    }

    // Callout / Trap badge: [বিসিএস ট্র্যাপ] or [টিপস] or [পরামর্শ]
    if (trimmed.startsWith('[') && trimmed.includes(']')) {
      elements.push(
        <div
          key={`callout-${index}`}
          className="bg-amber-50/80 border border-amber-200/80 text-amber-900 p-2.5 rounded-xl my-2 text-xs leading-relaxed font-medium"
        >
          {renderInline(trimmed)}
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p
        key={`p-${index}`}
        className="text-xs sm:text-sm text-gray-800 leading-relaxed my-1 font-normal"
      >
        {renderInline(trimmed)}
      </p>
    );
  });

  // Flush remaining
  if (currentList.length > 0) {
    flushList('final');
  }

  return <div className="markdown-chat-body space-y-0.5">{elements}</div>;
}

// Inline formatting: **bold**, `code`, and clean links
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**text**)
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processCode(text.substring(lastIndex, match.index), `txt-${lastIndex}`));
    }
    parts.push(
      <strong
        key={`bold-${match.index}`}
        className="font-bold text-slate-900 bg-emerald-50/70 px-1 py-0.5 rounded"
      >
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(processCode(text.substring(lastIndex), `txt-${lastIndex}`));
  }

  return <>{parts}</>;
}

function processCode(segment: string, keyPrefix: string): React.ReactNode {
  const codeRegex = /`([^`]+)`/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(segment)) !== null) {
    if (match.index > lastIndex) {
      parts.push(segment.substring(lastIndex, match.index));
    }
    parts.push(
      <code
        key={`${keyPrefix}-code-${match.index}`}
        className="font-mono text-[11px] sm:text-xs bg-slate-100 text-emerald-800 px-1.5 py-0.5 rounded border border-slate-200/60 font-semibold"
      >
        {match[1]}
      </code>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < segment.length) {
    parts.push(segment.substring(lastIndex));
  }

  return parts;
}
