
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { seedSampleData } from '@/lib/seed';
import { getClients } from '@/lib/api/clients';
import { useToast } from '@/hooks/use-toast';
import { checkAndRefillTokens } from '@/lib/api/tokens';

const AuthContext = createContext<{ user: User | null; loading: boolean, isNewUser: boolean }>({
  user: null,
  loading: true,
  isNewUser: false,
});

async function checkAndSeedData(userId: string, email: string) {
    if (email !== 'sample@freelancer.com') return;

    try {
        // We get the raw clients here because the API one might not be ready yet
        const clientsResult = await getClients();
        const clients = clientsResult.clients;
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
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isPublicPage = pathname === '/' || pathname.startsWith('/share') || pathname === '/proposal-generator';

      if (user) {
        setUser(user);
        const { isNewUser, wasRefilled } = await checkAndRefillTokens(user);
        
        setIsNewUser(isNewUser);

        if (isNewUser) {
           toast({ title: '🎉 Welcome to GigBillow!', description: 'You have been credited with 10 free tokens to get you started.' });
        } else if (wasRefilled) {
            // Toast is handled in checkAndRefillTokens for refills
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
        setIsNewUser(false);
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
    <AuthContext.Provider value={{ user, loading, isNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
