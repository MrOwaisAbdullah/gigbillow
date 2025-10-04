'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { seedSampleData } from '@/lib/seed';
import { getClients } from '@/lib/api/clients';

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
      
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      if (user) {
        setUser(user);
        await checkAndSeedData(user.uid, user.email || '');
        setLoading(false);
        if (isAuthPage) {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        setLoading(false);
        if (!isAuthPage) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
