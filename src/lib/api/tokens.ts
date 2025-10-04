'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import type { UserToken } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export type SpendAction = 'proposal' | 'invoice_pdf' | 'project';

const TOKEN_COSTS: Record<SpendAction, number> = {
    proposal: 1,
    invoice_pdf: 1,
    project: 1,
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

export async function canAfford(action: SpendAction): Promise<boolean> {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return false;

    const cost = TOKEN_COSTS[action];
    const tokenRef = doc(db, 'user_tokens', userId);
    const tokenSnap = await getDoc(tokenRef);
    
    return tokenSnap.exists() && (tokenSnap.data() as UserToken).balance >= cost;
}

export async function chargeFor(action: SpendAction): Promise<{ success: boolean, newBalance?: number }> {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
        return { success: false };
    }

    const cost = TOKEN_COSTS[action];
    const result = await spendToken(userId, cost);
    
    if (result.success) {
        toast({
            title: `⚡ ${cost} token used`,
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
    await updateDoc(tokenRef, {
        balance: increment(amount)
    });

    const tokenSnap = await getDoc(tokenRef);
    const newBalance = (tokenSnap.data() as UserToken).balance;

     toast({
        title: `⚡ ${amount} tokens added!`,
        description: `${newBalance} tokens now available.`
    });

    return { success: true, newBalance };
}
