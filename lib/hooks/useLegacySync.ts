'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { syncLegacyLocalStorage } from '../../actions/auth.actions';
import { toast } from 'sonner';

export function useLegacySync() {
  const { data: session } = useSession();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!session?.user?.email || hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    try {
      const isSyncedLocal = localStorage.getItem('lexilearn_legacy_synced_v1');
      if (isSyncedLocal) return;

      const wordsRaw = localStorage.getItem('mastered_words') || localStorage.getItem('lexilearn_words') || '[]';
      const streakRaw = localStorage.getItem('lexilearn_streak') || localStorage.getItem('user_streak') || '0';
      const parsedWords = JSON.parse(wordsRaw);
      const parsedStreak = parseInt(streakRaw, 10) || 0;

      if ((Array.isArray(parsedWords) && parsedWords.length > 0) || parsedStreak > 0) {
        syncLegacyLocalStorage({
          words: Array.isArray(parsedWords) ? parsedWords : [],
          streak: parsedStreak,
        }).then((res) => {
          if (res?.success) {
            localStorage.setItem('lexilearn_legacy_synced_v1', 'true');
            if (res.syncedWordsCount && res.syncedWordsCount > 0) {
              toast.success(`পূর্বের ${res.syncedWordsCount}টি ভোকাবুলারি আপনার অ্যাকাউন্টে সিঙ্ক করা হয়েছে!`);
            }
          }
        });
      } else {
        localStorage.setItem('lexilearn_legacy_synced_v1', 'true');
      }
    } catch (err) {
      console.warn('Legacy sync hook error:', err);
    }
  }, [session]);
}
