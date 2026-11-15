'use client';

import React from 'react';

interface MathKatexRendererProps {
  content: string;
  className?: string;
}

/**
 * MathKatexRenderer parses standard math notations:
 * - $...$ for inline math
 * - $$...$$ for block math
 * Renders LaTeX/formula symbols cleanly with mathematical typography.
 */
export default function MathKatexRenderer({ content, className = '' }: MathKatexRendererProps) {
  if (!content) return null;

  // Split by $$...$$ or $...$
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className={`inline-block leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          return (
            <span
              key={index}
              className="block my-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center font-mono text-sm sm:text-base text-amber-300 font-semibold overflow-x-auto"
            >
              {cleanMathSyntax(formula)}
            </span>
          );
        }

        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1).trim();
          return (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 mx-0.5 bg-amber-500/15 border border-amber-500/30 rounded text-amber-300 font-mono text-xs sm:text-sm font-semibold"
            >
              {cleanMathSyntax(formula)}
            </span>
          );
        }

        // Render plain text with line breaks preserved
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Transforms common LaTeX math syntax into readable unicode/formatted strings
 * for ultra-fast rendering without heavy external runtime dependencies.
 */
function cleanMathSyntax(formula: string): string {
  return formula
    .replace(/\\times/g, ' × ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\ne(q)?/g, ' ≠ ')
    .replace(/\\le(q)?/g, ' ≤ ')
    .replace(/\\ge(q)?/g, ' ≥ ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\implies/g, ' ⟹ ')
    .replace(/\\iff/g, ' ⟺ ')
    .replace(/\\cap/g, ' ∩ ')
    .replace(/\\cup/g, ' ∪ ')
    .replace(/\\in/g, ' ∈ ')
    .replace(/\\notin/g, ' ∉ ')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt\s*([0-9a-zA-Z]+)/g, '√$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\circ/g, '°')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\dots/g, '...')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}');
}
