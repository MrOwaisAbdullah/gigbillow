'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { seedSampleData } from '@/lib/seed';
import { getClients } from '@/lib/api/clients';

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

async function checkAndSeedData(userId: string, email: string) {
  if (email === 'sample@freelancer.com') {
    const clients = await getClients();
    if (clients.length === 0) {
      console.log('No data found for sample user, seeding now...');
      await seedSampleData(userId);
      console.log('Sample data seeded successfully.');
    }
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      if (user) {
        checkAndSeedData(user.uid, user.email || '').catch(console.error);
        if (isAuthPage) {
          router.push('/dashboard');
        }
      } else if (!isAuthPage) {
        router.push('/login');
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
