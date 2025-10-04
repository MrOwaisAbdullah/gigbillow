'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserToken } from '@/lib/types';
import { InsufficientTokensDialog } from './insufficient-tokens-dialog';
import { useAuth } from '../auth/auth-provider';

type TokenContextType = {
  tokens: number;
  loading: boolean;
  openDialog: () => void;
};

const TokenContext = createContext<TokenContextType>({
  tokens: 0,
  loading: true,
  openDialog: () => {},
});

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState<UserToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const tokenRef = doc(db, 'user_tokens', user.uid);
      const unsubscribe = onSnapshot(tokenRef, (doc) => {
        if (doc.exists()) {
          setTokenData(doc.data() as UserToken);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setTokenData(null);
      setLoading(true);
    }
  }, [user]);
  
  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);


  return (
    <TokenContext.Provider value={{ tokens: tokenData?.balance ?? 0, loading, openDialog }}>
      {children}
      <InsufficientTokensDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);
