// components/Provider.tsx
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../lib/auth-context';
import QueryProvider from '../providers/QueryProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
}
