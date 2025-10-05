'use client';

import { ReferralDashboard } from "@/components/referrals/referral-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReferralsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
      </div>
      
      <ReferralDashboard />

       <Card>
        <CardHeader>
            <CardTitle>How it Works</CardTitle>
            <CardDescription>A simple referral system designed for growth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
           <p><strong className="text-foreground">1. Share Your Code:</strong> Give your unique referral code to friends or colleagues.</p>
           <p><strong className="text-foreground">2. They Sign Up & Pay:</strong> When someone you referred becomes a paying customer, you get credit.</p>
           <p><strong className="text-foreground">3. Earn Discounts:</strong> Based on the number of paying referrals, you'll earn coupons for discounts on your next subscription invoice. Your referee gets nothing, which helps us keep our margins healthy.</p>
           <p><strong className="text-foreground">4. Automatic Application:</strong> Coupons are automatically applied to your next invoice. Only one coupon can be active at a time, and the highest value one will always be used.</p>
           <p className="pt-4 text-xs"><strong>Terms:</strong> Referral coupons are single-use, non-transferable, and expire 90 days after issuance. Coupons may only be applied to your own active subscription.</p>
        </CardContent>
       </Card>
    </div>
  )
}
