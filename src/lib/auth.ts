'use client';

import { supabase } from './supabase';
import { type User } from '@supabase/supabase-js';
import { standardConfig, betaConfig } from './config';

function generateReferralCode(length: number) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function initializeUser(user: User) {
  // Check if user profile exists
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows returned
    console.error('Error fetching user profile:', profileError);
    throw profileError;
  }

  if (!userProfile) {
    // --- This is a new user ---
    const referralCode = generateReferralCode(6);

    const initialTokens = betaConfig.isActive ? betaConfig.newUserTokens : standardConfig.freeUser.newUserTokens;
    const initialSubStatus = betaConfig.isActive ? betaConfig.newUserIsSubscribed : standardConfig.freeUser.newUserIsSubscribed;
    const initialRollover = betaConfig.isActive ? betaConfig.newUserRolloverLimit : standardConfig.freeUser.newUserRolloverLimit;

    // Create the user profile
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name,
        photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        referral_code: referralCode,
        is_subscribed: initialSubStatus,
      });

    if (userError) {
      console.error('Error creating user profile:', userError);
      throw userError;
    }

    // Create the user tokens record
    const { error: tokenError } = await supabase
      .from('user_tokens')
      .insert({
        user_id: user.id,
        balance: initialTokens,
        last_refill_at: new Date().toISOString(),
        rollover_limit: initialRollover,
        is_subscribed: initialSubStatus,
      });

    if (tokenError) {
      console.error('Error creating user tokens:', tokenError);
      throw tokenError;
    }

    // Handle referral if exists in local storage
    const refCode = localStorage.getItem('referralCode');
    if (refCode) {
      // In a real app, this would trigger a backend function.
      console.log(`New user ${user.id} was referred by code: ${refCode}`);
      localStorage.removeItem('referralCode');
    }
  } else {
    // --- This is an existing user ---
    const updates: any = {};

    // Backfill referral code if missing
    if (!userProfile.referral_code) {
      updates.referral_code = generateReferralCode(6);
    }

    // Backfill subscription status if missing
    if (userProfile.is_subscribed === undefined || userProfile.is_subscribed === null) {
      updates.is_subscribed = false;
    }

    // Sync latest profile info from auth provider
    if (user.user_metadata?.full_name && userProfile.display_name !== user.user_metadata.full_name) {
      updates.display_name = user.user_metadata.full_name;
    }
    if ((user.user_metadata?.avatar_url || user.user_metadata?.picture) && userProfile.photo_url !== (user.user_metadata.avatar_url || user.user_metadata.picture)) {
      updates.photo_url = user.user_metadata.avatar_url || user.user_metadata.picture;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }
    }

    // Also ensure token document exists for older users
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError) {
      // Token record doesn't exist, create it
      const { error: insertError } = await supabase
        .from('user_tokens')
        .insert({
          user_id: user.id,
          balance: 10,
          last_refill_at: new Date().toISOString(),
          rollover_limit: 10,
          is_subscribed: false,
        });

      if (insertError) {
        console.error('Error creating token record for existing user:', insertError);
        throw insertError;
      }
    }
  }
}

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }

    // The OAuth flow redirects, so we return early here
    return null;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const registerWithEmailAndPassword = async (name: string, email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      console.error('Error registering with email and password:', error);
      throw error;
    }

    const user = data.user;
    if (user) {
      await initializeUser(user);
    }

    return data;
  } catch (error) {
    console.error('Error registering with email and password:', error);
    throw error;
  }
};

export const signInWithEmailAndPasswordHandler = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in with email and password:', error);
      throw error;
    }

    const user = data.user;
    if (user) {
      await initializeUser(user);
    }

    return data;
  } catch (error) {
    console.error('Error signing in with email and password:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const updateUserPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const deleteUserAccount = async (): Promise<void> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error('Error getting current user:', authError);
    throw authError;
  }

  if (!user) {
    throw new Error('You must be logged in to delete your account.');
  }

  try {
    const userId = user.id;

    // Fetch profile to get image paths before deletion
    const { data: profile } = await supabase
      .from('users')
      .select('photo_url, logo_url')
      .eq('id', userId)
      .single();

    // Delete images from storage if they exist
    if (profile) {
      const filesToDelete: string[] = [];
      if (profile.photo_url && profile.photo_url.includes('avatars/')) {
        const path = profile.photo_url.split('avatars/')[1];
        if (path) filesToDelete.push(`avatars/${path}`);
      }
      if (profile.logo_url && profile.logo_url.includes('logos/')) {
        const path = profile.logo_url.split('logos/')[1];
        if (path) filesToDelete.push(`logos/${path}`);
      }

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('images')
          .remove(filesToDelete);
      }
    }

    // Delete all user data from all tables
    // Delete from related tables first due to foreign key constraints
    const tablesToDelete = [
      'referrals', 'feedback', 'expenses', 'invoices', 
      'time_entries', 'projects', 'clients'
    ];

    for (const table of tablesToDelete) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(table === 'referrals' ? 'referrer_user_id' : 'user_id', userId);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        throw error;
      }
    }

    // Delete user tokens
    await supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', userId);

    // Delete the user profile
    await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    // Finally, sign out the user since we can't delete the auth account from client-side
    await supabase.auth.signOut();

  } catch (error: any) {
    console.error('Error deleting user account:', error);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('This operation is sensitive and requires recent authentication. Please log out and log back in before deleting your account.');
    }
    throw new Error('Failed to delete account. Please try again.');
  }
};