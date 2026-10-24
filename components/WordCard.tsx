import React from 'react';
type Props = { word: any };
export default function WordCard({ word }: Props) {
  return (
    <div className="">
      <h3 className="text-lg font-semibold">{word.word}</h3>
      <p className="text-sm text-gray-600">{word.partOfSpeech} • {word.bangla}</p>
      <p className="mt-2">{word.meaning}</p>
      <p className="mt-2 italic text-gray-700">"{word.example}"</p>
    </div>
  );
}
