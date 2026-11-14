import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExamHistoryItem {
  exam: string;
  year?: string;
}

export interface IVocabWord extends Document {
  deckSlug: string;
  word: string;
  partOfSpeech: string;
  meaningBn: string;
  meaningEn: string;
  mnemonic?: string;
  exampleSentence?: string;
  synonyms: string[];
  antonyms: string[];
  repetitionCount: number;
  examHistory: IExamHistoryItem[];
  createdAt: Date;
}

const VocabWordSchema = new Schema<IVocabWord>(
  {
    deckSlug: { type: String, default: 'barron-333', index: true },
    word: { type: String, required: true, trim: true, lowercase: true },
    partOfSpeech: { type: String, default: '' },
    meaningBn: { type: String, required: true },
    meaningEn: { type: String, default: '' },
    mnemonic: { type: String, default: '' },
    exampleSentence: { type: String, default: '' },
    synonyms: { type: [String], default: [] },
    antonyms: { type: [String], default: [] },
    repetitionCount: { type: Number, default: 1 },
    examHistory: { type: [{ exam: String, year: String }], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VocabWordSchema.index({ deckSlug: 1, word: 1 }, { unique: true });

const VocabWord: Model<IVocabWord> =
  mongoose.models.VocabWord || mongoose.model<IVocabWord>('VocabWord', VocabWordSchema);

export default VocabWord;
