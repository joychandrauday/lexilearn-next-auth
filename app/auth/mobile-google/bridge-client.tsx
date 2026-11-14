'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function MobileGoogleBridgeClient({
  redirectUri,
  targetUrl,
}: {
  redirectUri?: string;
  targetUrl?: string;
}) {
  useEffect(() => {
    if (targetUrl) {
      // User is authenticated, redirect back to mobile app scheme
      window.location.replace(targetUrl);
    } else {
      // Trigger Google Sign-In with callbackUrl pointing back to this page
      const callback = `/auth/mobile-google?redirect_uri=${encodeURIComponent(
        redirectUri || 'lexilearn://auth'
      )}`;
      signIn('google', { callbackUrl: callback });
    }
  }, [redirectUri, targetUrl]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: '#ecfdf5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        marginBottom: '16px',
      }}>
        🦉
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
        {targetUrl ? 'PrepOwl অ্যাপে ফিরে যাওয়া হচ্ছে...' : 'Google দিয়ে কানেক্ট করা হচ্ছে...'}
      </h2>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px', lineHeight: '20px' }}>
        {targetUrl
          ? 'অনুগ্রহ করে অপেক্ষা করুন, অ্যাপে লগইন সম্পন্ন হচ্ছে।'
          : 'Google একাউন্ট ভেরিফাই করা হচ্ছে, কিছুক্ষণ অপেক্ষা করুন।'}
      </p>

      {targetUrl && (
        <a
          href={targetUrl}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          সরাসরি অ্যাপে ফিরে যান
        </a>
      )}
    </div>
  );
}
