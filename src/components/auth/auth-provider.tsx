'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { seedSampleData } from '@/lib/seed';
import { getClients } from '@/lib/api/clients';
import { useToast } from '@/hooks/use-toast';
import { checkAndRefillTokens } from '@/lib/api/tokens';

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

async function checkAndSeedData(userId: string, email: string) {
    if (email !== 'sample@freelancer.com') return;

    try {
        // We get the raw clients here because the API one might not be ready yet
        const clients = await getClients();
        if (clients.length === 0) {
            console.log('No data found for sample user, seeding now...');
            await seedSampleData(userId);
            console.log('Sample data seeded successfully.');
        } else {
            console.log('Data already exists for sample user.');
        }
    } catch (error) {
        console.error('Error during data check/seed:', error);
    }
}


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  useEffect(() => {
    // Function to attach the token to API requests
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const [url, config] = args;

        // We only want to add the token to our own API routes
        const isApiRequest = typeof url === 'string' && url.startsWith('/api/');

        if (isApiRequest) {
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (user) {
                const token = await getIdToken(user);
                const headers = new Headers(config?.headers);
                headers.set('Authorization', `Bearer ${token}`);
                args[1] = { ...config, headers };
            }
        }

        return originalFetch.apply(this, args);
    };

    // Cleanup function to restore original fetch
    return () => {
        window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isPublicPage = pathname === '/' || pathname.startsWith('/share') || pathname === '/proposal-generator';

      if (user) {
        setUser(user);
        const { isNewUser, wasRefilled } = await checkAndRefillTokens(user);
        if (isNewUser) {
           toast({ title: '🎉 Welcome to GigBillow!', description: 'You have been credited with 10 free tokens to get you started.' });
        } else if (wasRefilled) {
            toast({ title: '🎉 Your monthly credits are here!', description: 'Your 10 free tokens have been refilled.' });
        }
        await checkAndSeedData(user.uid, user.email || '');
        setLoading(false);
        if (isAuthPage) {
          const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        }
      } else {
        setUser(null);
        setLoading(false);
        if (!isPublicPage) {
          sessionStorage.setItem('redirectAfterLogin', pathname);
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
