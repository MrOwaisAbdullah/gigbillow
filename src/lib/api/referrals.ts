import { supabase } from '@/lib/supabase';
import type { Referral } from '@/lib/types';

export async function createReferral(referral: Omit<Referral, 'id'>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('referrals')
    .insert([{
      referrer_user_id: user.id,
      referred_stripe_cust_id: referral.referredStripeCustId,
      reached_paid: referral.reachedPaid
    }]);

  if (error) {
    console.error("Error creating referral:", error);
    throw error;
  }
}

export async function getReferrals(): Promise<Referral[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("User not authenticated");
    return [];
  }

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_user_id', user.id);

  if (error) {
    console.error("Error fetching referrals:", error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    referrerUserId: row.referrer_user_id,
    referredStripeCustId: row.referred_stripe_cust_id,
    reachedPaid: row.reached_paid,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getReferralsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_user_id', userId);

  if (error) {
    console.error("Error fetching referrals:", error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    referrerUserId: row.referrer_user_id,
    referredStripeCustId: row.referred_stripe_cust_id,
    reachedPaid: row.reached_paid,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}