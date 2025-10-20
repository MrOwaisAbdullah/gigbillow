
'use client';

import { db } from '@/lib/firebase';
import { getAuth, type User } from 'firebase/auth';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { UserToken } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { isAfter } from 'date-fns';
import { updateUserSubscriptionStatus } from './users';


export async function checkAndRefillTokens(user: User): Promise<{ isNewUser: boolean, wasRefilled: boolean }> {
  const tokenRef = doc(db, 'user_tokens', user.uid);
  const tokenSnap = await getDoc(tokenRef);
  
  if (!tokenSnap.exists()) {
    await setDoc(tokenRef, {
      balance: 50, // Beta: 50 tokens
      last_refill_at: serverTimestamp(),
      rollover_limit: 50,
      is_subscribed: true, // Beta: everyone is subscribed
    });
    return { isNewUser: true, wasRefilled: false };
  } 
  
  const tokenData = tokenSnap.data() as UserToken;
  const lastRefill = (tokenData.last_refill_at as Timestamp)?.toDate();

  if (!lastRefill) {
     await updateDoc(tokenRef, { last_refill_at: serverTimestamp() });
     return { isNewUser: false, wasRefilled: false };
  }

  const nextRefillDate = new Date(lastRefill.getTime());
  nextRefillDate.setDate(nextRefillDate.getDate() + 30);

  if (isAfter(new Date(), nextRefillDate)) {
    // During beta, everyone is treated as subscribed
    const currentBalance = tokenData.balance;
    const rolloverAmount = Math.min(currentBalance, tokenData.rollover_limit);
    const newBalance = rolloverAmount + 50; // Beta refill amount
    await updateDoc(tokenRef, {
      balance: newBalance,
      last_refill_at: serverTimestamp()
    });
    toast({ title: '🎉 Monthly Beta Tokens Added!', description: `Your 50 tokens have been added. ${rolloverAmount} unused tokens were rolled over.` });
    
    return { isNewUser: false, wasRefilled: true };
  }

  return { isNewUser: false, wasRefilled: false };
}


export type SpendAction = 'proposal' | 'invoice_pdf' | 'project' | 'import_work_log' | 'invoice_expense' | 'remove_watermark' | 'report_export';

const TOKEN_COSTS: Record<SpendAction, number> = {
    proposal: 1,
    invoice_pdf: 1,
    project: 1,
    import_work_log: 1,
    invoice_expense: 1,
    remove_watermark: 3,
    report_export: 1,
};

async function spendToken(userId: string, cost: number): Promise<{ success: boolean, newBalance?: number }> {
    const tokenRef = doc(db, 'user_tokens', userId);
    const tokenSnap = await getDoc(tokenRef);

    if (!tokenSnap.exists() || (tokenSnap.data() as UserToken).balance < cost) {
        return { success: false };
    }

    await updateDoc(tokenRef, {
        balance: increment(-cost)
    });
    
    const newBalance = (tokenSnap.data() as UserToken).balance - cost;
    return { success: true, newBalance };
}

export async function canAfford(action: SpendAction, quantity: number = 1): Promise<boolean> {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return false;

    const cost = TOKEN_COSTS[action] * quantity;
    const tokenRef = doc(db, 'user_tokens', userId);
    const tokenSnap = await getDoc(tokenRef);
    
    return tokenSnap.exists() && (tokenSnap.data() as UserToken).balance >= cost;
}

export async function chargeFor(action: SpendAction, quantity: number = 1): Promise<{ success: boolean, newBalance?: number }> {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
        return { success: false };
    }

    const cost = TOKEN_COSTS[action] * quantity;
    if (cost === 0) {
        return { success: true };
    }
    
    const result = await spendToken(userId, cost);
    
    if (result.success) {
        toast({
            title: `⚡ ${cost} token${cost > 1 ? 's' : ''} used`,
            description: `${result.newBalance} tokens remaining.`
        });
    }
    
    return result;
}

export async function addTokens(amount: number): Promise<{ success: boolean, newBalance?: number }> {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
        return { success: false };
    }
    
    const tokenRef = doc(db, 'user_tokens', userId);
    const tokenSnap = await getDoc(tokenRef);

    if (tokenSnap.exists()) {
        await updateDoc(tokenRef, {
            balance: increment(amount),
            is_subscribed: true,
            rollover_limit: 150,
        });
    } else {
        await setDoc(tokenRef, {
            balance: amount,
            last_refill_at: serverTimestamp(),
            rollover_limit: 150,
            is_subscribed: true,
        });
    }

    // Also update the main user profile to reflect subscription status
    await updateUserSubscriptionStatus(true);


    const updatedSnap = await getDoc(tokenRef);
    const newBalance = (updatedSnap.data() as UserToken).balance;

     toast({
        title: `⚡ ${amount} tokens added!`,
        description: `${newBalance} tokens now available.`
    });

    return { success: true, newBalance };
}
