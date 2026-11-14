import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    if (typeof window !== 'undefined') {
      console.warn('[firebase] NEXT_PUBLIC_FIREBASE_API_KEY is not set');
    }
    return null;
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export const firebaseApp: FirebaseApp | null = getFirebaseApp();

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let analyticsInstance: Analytics | undefined;

export function initFirebase(): { app: FirebaseApp | null; analytics?: Analytics } | null {
  if (!firebaseApp) return null;

  if (typeof window !== 'undefined' && !analyticsInstance) {
    try {
      analyticsInstance = getAnalytics(firebaseApp);
    } catch {
      // Analytics not supported in all environments
    }
  }

  return { app: firebaseApp, analytics: analyticsInstance };
}
