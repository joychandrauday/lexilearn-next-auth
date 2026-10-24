import '../styles/globals.css';
import type { ReactNode } from 'react';
import Providers from '../components/Provider';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import PwaRegister from '../components/PwaRegister';
import AIChatBot from '../components/AIChatBot';
import SmartAuthPrompt from '../components/Auth/SmartAuthPrompt';
import { Hind_Siliguri } from 'next/font/google';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'LexiLearn - বিসিএস ও ব্যাংক ভোকাবুলারি ও প্রস্তুতি',
  description: 'Gamified Spaced Repetition Vocabulary & Job Prep Platform for Bangladeshi Aspirants',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className={hindSiliguri.variable}>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
        <Providers>
          <PwaRegister />
          <Navbar />
          <main className="flex-1 pb-20 md:pb-6">{children}</main>
          <AIChatBot />
          <SmartAuthPrompt />
          <BottomNav />
          <Toaster richColors expand={true} position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
