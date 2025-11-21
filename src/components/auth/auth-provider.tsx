
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import { seedSampleData } from '@/lib/seed';
import { getClients } from '@/lib/api/clients';
import { ensureUserExists } from '@/lib/api/users';
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
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      setUser(currentUser || null);

      if (currentUser) {
        // Ensure user exists in our database
        await ensureUserExists(currentUser);
        
        // Check and refill tokens
        const { isNewUser: newUser, wasRefilled } = await checkAndRefillTokens();
        setIsNewUser(newUser);

        // Show welcome toast for new users
        if (newUser) {
          toast({ 
            title: '🎉 Welcome to our Beta!', 
            description: "You've received 50 bonus tokens for free. Enjoy, and please share your feedback!" 
          });
        }
        
        // Seed sample data for the sample account
        await checkAndSeedData(currentUser.id, currentUser.email || '');
      } else {
        setIsNewUser(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, loading, isNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
