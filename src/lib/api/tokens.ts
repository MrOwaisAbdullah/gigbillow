'use client';

import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { isAfter } from 'date-fns';
import { updateUserSubscriptionStatus } from './users';
import { betaConfig, standardConfig } from '../config';

// Prevent multiple simultaneous requests from creating duplicate records
let tokenCheckInProgress = false;

export async function checkAndRefillTokens(): Promise<{ isNewUser: boolean, wasRefilled: boolean }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error getting current user:', authError);
    return { isNewUser: false, wasRefilled: false };
  }

  const userId = user.id;

  // Prevent multiple simultaneous requests
  if (tokenCheckInProgress) {
    // Wait a moment and return false if another check is already in progress
    await new Promise(resolve => setTimeout(resolve, 100));
    return { isNewUser: false, wasRefilled: false };
  }

  tokenCheckInProgress = true;

  try {
    // Get user tokens
    const { data: tokenData, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        // This is a new user - this case should be handled by initializeUser, but as a fallback:
        const initialTokens = betaConfig.isActive ? betaConfig.newUserTokens : standardConfig.freeUser.newUserTokens;
        const initialSubStatus = betaConfig.isActive ? betaConfig.newUserIsSubscribed : standardConfig.freeUser.newUserIsSubscribed;
        const initialRollover = betaConfig.isActive ? betaConfig.newUserRolloverLimit : standardConfig.freeUser.newUserRolloverLimit;

        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert({
            user_id: userId,
            balance: initialTokens,
            last_refill_at: new Date().toISOString(),
            rollover_limit: initialRollover,
            is_subscribed: initialSubStatus,
          });

        if (insertError) {
          // Check if it's a duplicate key error (someone else created the record while we waited)
          if (insertError.code === '23505') { // Unique violation
            // Record already exists, try to fetch it again
            const { data: retryData, error: retryError } = await supabase
              .from('user_tokens')
              .select('*')
              .eq('user_id', userId)
              .single();

            if (retryError) {
              console.error('Error retrying to fetch token record:', retryError);
              return { isNewUser: false, wasRefilled: false };
            }

            // Successfully retrieved the existing record
            return { isNewUser: true, wasRefilled: false };
          } else {
            console.error('Error creating token record:', insertError);
            console.error('Error details:', JSON.stringify(insertError, null, 2));
            console.error('Error message:', insertError.message);
            console.error('Error code:', insertError.code);
            console.error('Error details prop:', insertError.details);
            console.error('Error hint:', insertError.hint);
            return { isNewUser: false, wasRefilled: false };
          }
        }

        return { isNewUser: true, wasRefilled: false };
      } else {
        console.error('Error fetching user tokens:', error);
        return { isNewUser: false, wasRefilled: false };
      }
    }

    if (!tokenData) {
      return { isNewUser: false, wasRefilled: false };
    }

    const lastRefill = tokenData.last_refill_at ? new Date(tokenData.last_refill_at) : new Date();

    if (!lastRefill) {
      const { error: updateError } = await supabase
        .from('user_tokens')
        .update({ last_refill_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating last refill:', updateError);
      }
      return { isNewUser: false, wasRefilled: false };
    }

    const nextRefillDate = new Date(lastRefill.getTime());
    nextRefillDate.setDate(nextRefillDate.getDate() + 30);

    if (isAfter(new Date(), nextRefillDate)) {
      const isSubscribed = tokenData.is_subscribed || betaConfig.isActive;
      const refillAmount = isSubscribed ? (betaConfig.isActive ? betaConfig.refillAmount : standardConfig.subscribedUser.refillAmount) : standardConfig.freeUser.refillAmount;
      const rolloverLimit = isSubscribed ? (betaConfig.isActive ? betaConfig.newUserRolloverLimit : standardConfig.subscribedUser.rollover_limit) : 0;

      const currentBalance = tokenData.balance;
      const rolloverAmount = Math.min(currentBalance, rolloverLimit);
      const newBalance = rolloverAmount + refillAmount;

      const { error: updateError } = await supabase
        .from('user_tokens')
        .update({
          balance: newBalance,
          last_refill_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating tokens:', updateError);
        return { isNewUser: false, wasRefilled: false };
      }

      const toastTitle = betaConfig.isActive ? '🎉 Monthly Beta Tokens Added!' : 'Monthly Tokens Refilled!';
      toast({ title: toastTitle, description: `Your ${refillAmount} tokens have been added. ${rolloverAmount} unused tokens were rolled over.` });

      return { isNewUser: false, wasRefilled: true };
    }

    return { isNewUser: false, wasRefilled: false };
  } finally {
    // Reset the flag when done
    tokenCheckInProgress = false;
  }
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
  // Get current token balance
  const { data: tokenData, error } = await supabase
    .from('user_tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData || tokenData.balance < cost) {
    return { success: false };
  }

  // Update the balance
  const newBalance = tokenData.balance - cost;
  const { error: updateError } = await supabase
    .from('user_tokens')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  if (updateError) {
    return { success: false };
  }

  return { success: true, newBalance };
}

export async function canAfford(action: SpendAction, quantity: number = 1): Promise<boolean> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const userId = user.id;
  const cost = TOKEN_COSTS[action] * quantity;
  
  const { data: tokenData, error } = await supabase
    .from('user_tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();

  return !error && tokenData && tokenData.balance >= cost;
}

export async function chargeFor(action: SpendAction, quantity: number = 1): Promise<{ success: boolean, newBalance?: number }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
    return { success: false };
  }

  const userId = user.id;
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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
    return { success: false };
  }

  const userId = user.id;

  // Check if user_tokens record exists
  const { data: tokenData, error } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
    console.error('Error fetching user tokens:', error);
    return { success: false };
  }

  let newBalance;
  if (tokenData) {
    // Update existing token record
    const updatedBalance = tokenData.balance + amount;
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({
        balance: updatedBalance,
        is_subscribed: true,
        rollover_limit: 150,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating tokens:', updateError);
      return { success: false };
    }

    newBalance = updatedBalance;
  } else {
    // Create new token record
    const { error: insertError } = await supabase
      .from('user_tokens')
      .insert({
        user_id: userId,
        balance: amount,
        last_refill_at: new Date().toISOString(),
        rollover_limit: 150,
        is_subscribed: true,
      });

    if (insertError) {
      console.error('Error creating tokens:', insertError);
      return { success: false };
    }

    newBalance = amount;
  }

  // Also update the main user profile to reflect subscription status
  await updateUserSubscriptionStatus(true);

  toast({
    title: `⚡ ${amount} tokens added!`,
    description: `${newBalance} tokens now available.`
  });

  return { success: true, newBalance };
}