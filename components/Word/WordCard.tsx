// components/WordCard.tsx
'use client';

import React from 'react';
import { IWord } from '../../lib/models/Word';

interface Props {
    word: IWord;
}

export default function WordCard({ word }: Props) {
    return (
        <div className="p-4 bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all">
            <h2 className="text-xl font-semibold text-white">{word.word}</h2>
            <p className="text-gray-400">{word.meaning}</p>
            {word.example && (
                <p className="text-sm text-gray-500 mt-2 italic">"{word.example}"</p>
            )}
        </div>
    );
}
