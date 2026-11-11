'use client';

import { useEffect } from 'react';
import { initFirebase } from '@/lib/firebase';

export default function FirebaseInit() {
  // Initialise Firebase once, on the client only.
  useEffect(() => {
    initFirebase();
  }, []);

  return null;
}
