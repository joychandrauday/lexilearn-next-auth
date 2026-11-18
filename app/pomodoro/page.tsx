import { Metadata } from 'next';
import PomodoroTimer from '../../components/Pomodoro/PomodoroTimer';

export const metadata: Metadata = {
  title: 'পোমোডোরো ফোকাস টাইমার (Zen Focus Mode) — বিসিএস ও ব্যাংক প্রস্তুতি',
  description:
    'মিনিমালিস্ট পোমোডোরো টাইমার, ব্যাকগ্রাউন্ড থিম সিলেকশন, ফুলস্ক্রিন জেন মোড এবং দিনভিত্তিক পড়ার ঘণ্টা ও মিনিটের সুনির্দিষ্ট অ্যানালিটিক্স।',
  keywords: [
    'Pomodoro Timer',
    'Focus Timer',
    'পোমোডোরো টাইমার',
    'স্টাডি ট্র্যাকার',
    'OwlPrep',
    'BCS Preparation',
    'Bank Preparation',
  ],
};

export default function PomodoroPage() {
  return <PomodoroTimer />;
}
