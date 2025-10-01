
'use client';

import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/auth';
import { Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (loading || user) {
        return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
    }

    const handleGoogleSignIn = async () => {
        const user = await signInWithGoogle();
        if (user) {
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-primary">ProManFlow</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Your professional workspace, simplified.
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-8 shadow-sm">
                     <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Sign In</h2>
                        <p className="text-muted-foreground">
                            Use your Google account to get started.
                        </p>
                        <Button
                            onClick={handleGoogleSignIn}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            size="lg"
                        >
                            <Chrome className="mr-2 h-5 w-5" />
                            Sign in with Google
                        </Button>
                    </div>
                </div>
                 <p className="px-8 text-center text-sm text-muted-foreground">
                    By clicking continue, you agree to our{' '}
                    <a
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                        href="#"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
