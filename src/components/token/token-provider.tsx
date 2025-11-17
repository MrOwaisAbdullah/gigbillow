
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserToken } from '@/lib/types';
import { InsufficientTokensDialog } from './insufficient-tokens-dialog';
import { useAuth } from '../auth/auth-provider';

type TokenContextType = {
  tokens: number;
  tokenData: UserToken | null;
  loading: boolean;
  openDialog: () => void;
};

const TokenContext = createContext<TokenContextType>({
  tokens: 0,
  tokenData: null,
  loading: true,
  openDialog: () => {},
});

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState<UserToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let subscription;

    if (user) {
      // Fetch initial token data
      const fetchTokenData = async () => {
        const { data, error } = await supabase
          .from('user_tokens')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          const formattedTokenData: UserToken = {
            userId: data.user_id,
            balance: data.balance,
            lastRefillAt: data.last_refill_at,
            rolloverLimit: data.rollover_limit,
            isSubscribed: data.is_subscribed,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          setTokenData(formattedTokenData);
        }
        setLoading(false);
      };

      fetchTokenData();

      // Set up real-time subscription
      subscription = supabase
        .channel('user-tokens-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_tokens',
            filter: `user_id=eq.${user.id}`
          },
          (payload: { new: any }) => {
            const updatedTokenData: UserToken = {
              userId: payload.new.user_id,
              balance: payload.new.balance,
              lastRefillAt: payload.new.last_refill_at,
              rolloverLimit: payload.new.rollover_limit,
              isSubscribed: payload.new.is_subscribed,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at
            };
            setTokenData(updatedTokenData);
          }
        )
        .subscribe();
    } else {
      setTokenData(null);
      setLoading(true);
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  return (
    <TokenContext.Provider value={{ tokens: tokenData?.balance ?? 0, tokenData, loading, openDialog }}>
      {children}
      <InsufficientTokensDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);
