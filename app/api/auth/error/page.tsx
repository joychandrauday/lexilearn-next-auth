// app/auth/error/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Result } from 'antd';
import Link from 'next/link';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMessages: Record<string, string> = {
        Configuration: 'There is a problem with the server configuration.',
        AccessDenied: 'You do not have permission to sign in.',
        Verification: 'The sign-in link has expired or has already been used.',
        OAuthSignin: 'Error in constructing sign-in request.',
        OAuthCallback: 'Error in handling OAuth callback.',
        OAuthCreateAccount: 'Could not create OAuth account.',
        EmailCreateAccount: 'Could not create email account.',
        Callback: 'Error in OAuth callback handler.',
        OAuthAccountNotLinked: 'Account not linked. Sign in with the original provider.',
        EmailSignin: 'Error sending sign-in email.',
        CredentialsSignin: 'Invalid credentials.',
        SessionRequired: 'You must be signed in to access this page.',
    };

    const message = errorMessages[error || ''] || 'An unknown error occurred.';

    return (
        <div className="auth-error" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f2f5'
        }}>
            <Result
                status="error"
                title="Authentication Error"
                subTitle={message}
                extra={[
                    <Link href="/" key="home">
                        <Button type="primary">Back to Home</Button>
                    </Link>,
                    <Link href="/login" key="retry">
                        <Button>Try Signing In Again</Button>
                    </Link>,
                ]}
            />
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Button loading>Loading...</Button>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}