import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMathFormulaItem {
  name: string;
  latex: string;
  explanation: string;
  shortcutHack?: string;
  sampleApplication?: string;
}

export interface IMathFormulaVault extends Document {
  stream: 'bank' | 'bcs' | 'primary_ntrca';
  category: string;
  topic: string;
  title: string;
  titleBn?: string;
  formulas: IMathFormulaItem[];
  cheatSheetSummary: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MathFormulaItemSchema = new Schema<IMathFormulaItem>(
  {
    name: { type: String, required: true },
    latex: { type: String, required: true },
    explanation: { type: String, required: true },
    shortcutHack: { type: String, default: '' },
    sampleApplication: { type: String, default: '' },
  },
  { _id: false }
);

const MathFormulaVaultSchema = new Schema<IMathFormulaVault>(
  {
    stream: {
      type: String,
      enum: ['bank', 'bcs', 'primary_ntrca'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleBn: {
      type: String,
      default: '',
    },
    formulas: [MathFormulaItemSchema],
    cheatSheetSummary: [{ type: String }],
  },
  { timestamps: true }
);

MathFormulaVaultSchema.index({ stream: 1, topic: 1 }, { unique: true });

const MathFormulaVault: Model<IMathFormulaVault> =
  mongoose.models.MathFormulaVault ||
  mongoose.model<IMathFormulaVault>('MathFormulaVault', MathFormulaVaultSchema);

export default MathFormulaVault;
