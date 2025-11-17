'use client';

import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

export async function updateUserSubscriptionStatus(isSubscribed: boolean) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error getting current user:', authError);
    return;
  }

  const userId = user.id;

  // Update both the user profile and token records
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ is_subscribed: isSubscribed })
    .eq('id', userId);

  if (userUpdateError) {
    console.error('Error updating user subscription status:', userUpdateError);
    toast({ variant: 'destructive', title: 'Error', description: 'Failed to update subscription status.' });
    return;
  }

  // Update tokens table as well
  const { error: tokensUpdateError } = await supabase
    .from('user_tokens')
    .update({ is_subscribed: isSubscribed })
    .eq('user_id', userId);

  if (tokensUpdateError) {
    console.error('Error updating token subscription status:', tokensUpdateError);
    toast({ variant: 'destructive', title: 'Error', description: 'Failed to update token subscription status.' });
    return;
  }

  toast({ title: 'Success', description: 'Subscription status updated.' });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    photoUrl: data.photo_url,
    referralCode: data.referral_code,
    logoUrl: data.logo_url,
    logoDataUrl: data.logo_data_url,
    isSubscribed: data.is_subscribed,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { error } = await supabase
    .from('users')
    .update({
      display_name: updates.displayName,
      photo_url: updates.photoUrl,
      referral_code: updates.referralCode,
      logo_url: updates.logoUrl,
      logo_data_url: updates.logoDataUrl,
      is_subscribed: updates.isSubscribed
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}