// components/Providers.tsx
'use client'; // ⚠️ important

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import QueryProvider from '../providers/QueryProvider';
import LegacySyncClient from './Auth/LegacySyncClient';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <LegacySyncClient />
        {children}
      </QueryProvider>
    </SessionProvider>
  );
}
