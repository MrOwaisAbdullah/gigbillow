'use client';

import { useEffect, useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import type { UserProfile, Referral } from '@/lib/types';
import { getReferrals } from '@/lib/api/referrals';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { SupabasePermissionError } from '@/lib/errors';

const milestones = [
  { count: 1, discount: 10 },
  { count: 3, discount: 50 },
  { count: 5, discount: 100 },
];

function generateReferralCode(length: number) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export function ReferralDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isGranting, setIsGranting] = useState(false);

  const ADMIN_USER_ID = "R7Hkky6alfgBwiofMmCVHo8HtLI3";

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user profile from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        let userProfileData: UserProfile;

        if (userError && userError.code !== 'PGRST116') { // PGRST116 means no rows returned
          const permissionError = new SupabasePermissionError({
            path: 'users',
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
          throw permissionError;
        }

        if (userData && userData.referral_code) {
          userProfileData = {
            id: userData.id,
            email: userData.email,
            displayName: userData.display_name,
            photoUrl: userData.photo_url,
            referralCode: userData.referral_code,
            logoUrl: userData.logo_url,
            logoDataUrl: userData.logo_data_url,
            isSubscribed: userData.is_subscribed,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          };
        } else {
            // Generate and update referral code if it doesn't exist
            const newReferralCode = generateReferralCode(6);

            const updates: Partial<UserProfile> = {
                referralCode: newReferralCode,
            };

            if (!userData || !userData.display_name) {
                updates.displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'New User';
                updates.email = user.email;
                updates.photoUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
            }

            // Update the user profile in Supabase
            const { error: updateError } = await supabase
              .from('users')
              .update({
                referral_code: newReferralCode,
                display_name: updates.displayName,
                email: updates.email,
                photo_url: updates.photoUrl
              })
              .eq('id', user.id);

            if (updateError) {
              console.error('Error updating user profile:', updateError);
              throw updateError;
            }

            userProfileData = {
              id: user.id,
              email: updates.email,
              displayName: updates.displayName as string,
              photoUrl: updates.photoUrl as string,
              referralCode: newReferralCode,
              logoUrl: null,
              logoDataUrl: null,
              isSubscribed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
        }

        setProfile(userProfileData);

        const referralData = await getReferrals();
        setReferrals(referralData);

      } catch (error) {
        console.error("An unexpected error occurred on the referral dashboard:", error);
        toast({
          variant: 'destructive',
          title: 'Error loading data',
          description: 'Could not load your referral information. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, toast]);

  const copyToClipboard = () => {
    if (!profile?.referralCode) {
        toast({ variant: 'destructive', title: 'Could not copy link', description: 'Referral code not found.' });
        return;
    };
    const referralLink = `${window.location.origin}/register?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Referral link copied!' });
  };

  const handleGrantPackage = async () => {
    setIsGranting(true);
    const USER_ID_TO_GRANT = 'R7Hkky6alfgBwiofMmCVHo8HtLI3';
    const TOKENS_TO_ADD = 200;
    const NEW_ROLLOVER_LIMIT = 150;

    try {
      // Update user subscription status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ is_subscribed: true })
        .eq('id', USER_ID_TO_GRANT);

      if (userUpdateError) {
        console.error("Failed to update user subscription", userUpdateError);
        throw userUpdateError;
      }

      // Check if token record exists
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', USER_ID_TO_GRANT)
        .single();

      if (tokenData) {
        // Update existing token record
        const { error: tokenUpdateError } = await supabase
          .from('user_tokens')
          .update({
            balance: tokenData.balance + TOKENS_TO_ADD,
            is_subscribed: true,
            rollover_limit: NEW_ROLLOVER_LIMIT,
          })
          .eq('user_id', USER_ID_TO_GRANT);

        if (tokenUpdateError) {
          console.error("Failed to update token record", tokenUpdateError);
          throw tokenUpdateError;
        }
      } else {
        // Create new token record
        const { error: tokenInsertError } = await supabase
          .from('user_tokens')
          .insert({
            user_id: USER_ID_TO_GRANT,
            balance: TOKENS_TO_ADD,
            last_refill_at: new Date().toISOString(),
            rollover_limit: NEW_ROLLOVER_LIMIT,
            is_subscribed: true,
          });

        if (tokenInsertError) {
          console.error("Failed to create token record", tokenInsertError);
          throw tokenInsertError;
        }
      }

      toast({ title: 'Success!', description: `Granted ${TOKENS_TO_ADD} tokens to the test user.` });
    } catch (error) {
        console.error("Failed to grant package", error);
        toast({ variant: 'destructive', title: 'Grant Failed', description: 'Could not grant the package.' });
    } finally {
        setIsGranting(false);
    }
  }

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Refer Friends - Get Discounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Your Referral Link</p>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="space-y-3">
                    {milestones.map((milestone) => (
                        <Skeleton key={milestone.count} className="h-6 w-1/2" />
                    ))}
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
          </Card>
      )
  }

  const paidReferrals = referrals.filter(r => r.reachedPaid).length;
  const nextMilestone = milestones.find(m => m.count > paidReferrals) || milestones[milestones.length - 1];
  const progressPercent = nextMilestone && nextMilestone.count > 0 ? (paidReferrals / nextMilestone.count) * 100 : 0;

  // Determine current discount
  let currentDiscount = 0;
  for (let i = milestones.length - 1; i >= 0; i--) {
      if (paidReferrals >= milestones[i].count) {
          currentDiscount = milestones[i].discount;
          break;
      }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Refer Friends – Get Discounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Unique Referral Link</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`${window.location.origin}/register?ref=${profile?.referralCode || ''}`}
              className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
            <Button onClick={copyToClipboard} variant="outline" size="icon" disabled={!profile?.referralCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
            {milestones.map(milestone => (
                <div key={milestone.count} className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-primary">{milestone.count} paid {milestone.count === 1 ? 'referral' : 'referrals'}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{milestone.discount}% off next invoice {milestone.discount === 100 && '(1 month of Starter plan)'}</span>
                </div>
            ))}
        </div>

        <div>
            <p className="text-sm font-medium mb-2">Your Progress</p>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="relative h-2 w-full rounded-full bg-muted">
                        <div className="absolute h-2 rounded-full bg-primary" style={{width: `${progressPercent}%`}}></div>
                    </div>
                </div>
                {nextMilestone && <span className="text-sm font-bold">{paidReferrals}/{nextMilestone.count}</span>}
            </div>
        </div>

        {currentDiscount > 0 && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="font-semibold text-primary">🎉 You've earned a {currentDiscount}% discount!</p>
                <p className="text-sm text-muted-foreground">It will be automatically applied to your next invoice.</p>
            </div>
        )}

        {user?.id === ADMIN_USER_ID && (
          <div className="border-t pt-4">
              <Button onClick={handleGrantPackage} disabled={isGranting}>
                  {isGranting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Grant Package to Test User
              </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
