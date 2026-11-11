'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  ActionCodeSettings,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { setStoredUserEmail, setStoredUserName } from './config/site';

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Session {
  user?: SessionUser;
  expires?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  data: Session | null;
  status: AuthStatus;
  signIn: (provider?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailLink: (email: string) => Promise<void>;
  isEmailLink: boolean;
  completeEmailLinkSignIn: (email?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue>({
  data: null,
  status: 'loading',
  signIn: async () => {},
  signOut: async () => {},
  sendEmailLink: async () => {},
  isEmailLink: false,
  completeEmailLinkSignIn: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isEmailLink, setIsEmailLink] = useState(false);

  useEffect(() => {
    if (!auth) {
      setStatus('unauthenticated');
      return;
    }

    // Check if the current URL is an email sign-in link
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      setIsEmailLink(true);
      const savedEmail = window.localStorage.getItem('emailForSignIn');
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            // Remove search params from URL for clean appearance
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch((err) => {
            console.error('[auth] Automatic email link sign-in failed:', err);
          });
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        setStatus('authenticated');
        setStoredUserEmail(user.email);
        if (user.displayName) {
          setStoredUserName(user.displayName);
        }
        // Sync profile to database in background
        try {
          await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              image: user.photoURL,
            }),
          });
        } catch (e) {
          console.warn('[auth] Failed to sync user to database:', e);
        }
      } else {
        setStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (_provider?: string) => {
    if (!auth) {
      console.error('[auth] Firebase Auth is not initialized');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('[auth] Google sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error('[auth] Sign-out failed:', error);
    }
  };

  const sendEmailLink = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    const cleanEmail = email.trim().toLowerCase();
    const actionCodeSettings: ActionCodeSettings = {
      url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://growwithowl.com/login',
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', cleanEmail);
    }
  };

  const completeEmailLinkSignIn = async (email?: string): Promise<boolean> => {
    if (!auth || typeof window === 'undefined') return false;
    if (!isSignInWithEmailLink(auth, window.location.href)) return false;

    const emailToUse = email || window.localStorage.getItem('emailForSignIn');
    if (!emailToUse) return false;

    await signInWithEmailLink(auth, emailToUse.trim().toLowerCase(), window.location.href);
    window.localStorage.removeItem('emailForSignIn');
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  };

  const session = useMemo<Session | null>(() => {
    if (!currentUser) return null;
    return {
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        image: currentUser.photoURL,
      },
    };
  }, [currentUser]);

  const value = useMemo(
    () => ({
      data: session,
      status,
      signIn,
      signOut,
      sendEmailLink,
      isEmailLink,
      completeEmailLinkSignIn,
    }),
    [session, status, isEmailLink]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const context = useContext(AuthContext);
  return {
    data: context.data,
    status: context.status,
    sendEmailLink: context.sendEmailLink,
    isEmailLink: context.isEmailLink,
    completeEmailLinkSignIn: context.completeEmailLinkSignIn,
  };
}

export async function signIn(provider?: string) {
  if (!auth) {
    console.error('[auth] Firebase Auth is not initialized');
    return;
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  if (!auth) return;
  return fbSignOut(auth);
}

export async function sendEmailSignInLink(email: string) {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const cleanEmail = email.trim().toLowerCase();
  const actionCodeSettings: ActionCodeSettings = {
    url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://growwithowl.com/login',
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('emailForSignIn', cleanEmail);
  }
}
