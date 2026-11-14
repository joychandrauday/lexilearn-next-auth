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
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://growwithowl.com'),
  title: {
    default: 'OwlPrep — বিসিএস, ব্যাংক ও সরকারি চাকরি প্রস্তুতি | Grow With Owl',
    template: '%s | OwlPrep (Grow With Owl)',
  },
  description:
    'Gamified Spaced Repetition, 1-Minute Micro-Capsules, Smart Question Bank & AI Mentor for BCS, Bank & Career Exams. Created by Joy Chandra Uday.',
  keywords: [
    'OwlPrep',
    'Grow With Owl',
    'Joy Chandra Uday',
    'BCS Preparation',
    'Bank Job Preparation',
    'বিসিএস প্রস্তুতি',
    'ব্যাংক জব প্রস্তুতি',
    'Spaced Repetition',
    'SM-2 Algorithm',
    'Question Bank',
    'AI Mentor',
    'G2G Digital',
  ],
  authors: [{ name: 'Joy Chandra Uday', url: 'https://joychandrauday-nexus.vercel.app/' }],
  creator: 'Joy Chandra Uday',
  publisher: 'Grow With Owl',
  alternates: {
    canonical: 'https://growwithowl.com',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'OwlPrep — রাতজাগা প্রার্থীদের স্মার্ট চাকরি প্রস্তুতি | Grow With Owl',
    description:
      '১ মিনিটের মাইক্রো-ক্যাপসুল, বৈজ্ঞানিক স্পেসড রিপিটেশন এবং সার্বিক এআই মেন্টর নিয়ে এগিয়ে থাকুন সবার চেয়ে। আর্কিটেক্ট: Joy Chandra Uday (Co-Founder, G2G Digital).',
    url: 'https://growwithowl.com',
    siteName: 'OwlPrep by Grow With Owl',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: 'https://growwithowl.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OwlPrep — বিসিএস ও ব্যাংক প্রস্তুতি (Grow With Owl)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OwlPrep — বিসিএস ও ব্যাংক প্রস্তুতি (Grow With Owl)',
    description: '1-Minute Micro-Capsules, Spaced Repetition & AI Mentor for Competitive Exams.',
    creator: '@joychandrauday',
    site: '@growwithowl',
    images: ['https://growwithowl.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://growwithowl.com/#website',
      url: 'https://growwithowl.com',
      name: 'OwlPrep',
      description: 'Competitive Exam Preparation & Spaced Repetition Platform',
      publisher: {
        '@id': 'https://growwithowl.com/#organization',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://growwithowl.com/#organization',
      name: 'Grow With Owl',
      url: 'https://growwithowl.com',
      founder: {
        '@type': 'Person',
        name: 'Joy Chandra Uday',
        url: 'https://joychandrauday-nexus.vercel.app/',
        sameAs: [
          'https://github.com/joychandrauday',
          'https://www.linkedin.com/in/joychandraudayy/',
          'https://twitter.com/joychandrauday',
          'https://g2gdigital.com',
        ],
      },
    },
    {
      '@type': 'Person',
      '@id': 'https://growwithowl.com/#founder',
      name: 'Joy Chandra Uday',
      jobTitle: 'Software Engineer & Co-Founder, G2G Digital',
      worksFor: {
        '@type': 'Organization',
        name: 'G2G Digital',
        url: 'https://g2gdigital.com',
      },
      url: 'https://joychandrauday-nexus.vercel.app/',
      sameAs: [
        'https://github.com/joychandrauday',
        'https://www.linkedin.com/in/joychandraudayy/',
      ],
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
