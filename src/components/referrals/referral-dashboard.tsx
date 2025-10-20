'use client';

import { useEffect, useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, Referral } from '@/lib/types';
import { getReferrals } from '@/lib/api/referrals';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

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
  
  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef).catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
          throw permissionError;
        });

        let userProfileData: UserProfile;

        if (userSnap.exists() && userSnap.data().referral_code) {
          userProfileData = userSnap.data() as UserProfile;
        } else {
            const newReferralCode = generateReferralCode(6);
            const updates: Partial<UserProfile> = {
                referral_code: newReferralCode,
            };
            if (!userSnap.exists() || !userSnap.data().displayName) {
                updates.displayName = user.displayName || 'New User';
                updates.email = user.email || '';
                updates.photoURL = user.photoURL || '';
            }
            
            // Use setDoc with merge to create or update the document safely
            await setDoc(userDocRef, updates, { merge: true });

            userProfileData = {
                ...(userSnap.exists() ? userSnap.data() : {}),
                ...updates,
            } as UserProfile;
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
    if (!profile?.referral_code) {
        toast({ variant: 'destructive', title: 'Could not copy link', description: 'Referral code not found.' });
        return;
    };
    const referralLink = `${window.location.origin}/register?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Referral link copied!' });
  };
  
  const handleGrantPackage = async () => {
    setIsGranting(true);
    const USER_ID_TO_GRANT = 'R7Hkky6alfgBwiofMmCVHo8HtLI3';
    const TOKENS_TO_ADD = 200;
    const NEW_ROLLOVER_LIMIT = 150;

    const userRef = doc(db, 'users', USER_ID_TO_GRANT);
    const tokenRef = doc(db, 'user_tokens', USER_ID_TO_GRANT);
    try {
        await updateDoc(userRef, { is_subscribed: true });
        
        const tokenSnap = await getDoc(tokenRef);
        if (tokenSnap.exists()) {
            await updateDoc(tokenRef, {
                balance: increment(TOKENS_TO_ADD),
                is_subscribed: true,
                rollover_limit: NEW_ROLLOVER_LIMIT,
            });
        } else {
            await setDoc(tokenRef, {
                balance: TOKENS_TO_ADD,
                last_refill_at: serverTimestamp(),
                rollover_limit: NEW_ROLLOVER_LIMIT,
                is_subscribed: true,
            });
        }
        toast({ title: 'Success!', description: `Granted ${TOKENS_TO_ADD} tokens to the user.` });
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
  
  const paidReferrals = referrals.filter(r => r.reached_paid).length;
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
              value={`${window.location.origin}/register?ref=${profile?.referral_code || ''}`}
              className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
            <Button onClick={copyToClipboard} variant="outline" size="icon" disabled={!profile?.referral_code}>
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
        <div className="border-t pt-4">
            <Button onClick={handleGrantPackage} disabled={isGranting}>
                {isGranting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grant Package to Test User
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
