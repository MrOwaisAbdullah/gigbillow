
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Mail, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useTour } from '@/components/tour-provider';

export default function SupportPage() {
    const { setOpen: setTourOpen } = useTour();

    return (
        <div className="flex flex-col gap-8 pb-8">
            <h1 className="text-3xl font-bold tracking-tight">Support</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>
                        Have a question or need help? We're here for you.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        For any support inquiries, billing questions, or feedback, please don't hesitate to reach out to our team. We aim to respond to all queries within 24 hours during business days.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                         <Button asChild className="w-full sm:w-auto">
                            <a href="mailto:support@gigbillow.com">
                                <Mail className="mr-2 h-4 w-4" /> Email Support
                            </a>
                        </Button>
                         <Button asChild variant="outline" className="w-full sm:w-auto">
                            <Link href="#">
                                <LifeBuoy className="mr-2 h-4 w-4" /> Help Center
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Need a Refresher?</CardTitle>
                    <CardDescription>
                        Revisit our quick welcome tour to get re-acquainted with the app's features.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setTourOpen(true)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Start Welcome Tour
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <div className="border-b pb-4">
                        <h4 className="font-semibold">How does token rollover work?</h4>
                        <p className="text-muted-foreground">If you are on a paid subscription plan, any unused tokens from the current month (up to your plan's limit) will automatically roll over to the next month.</p>
                   </div>
                    <div className="border-b pb-4">
                        <h4 className="font-semibold">Can I cancel my subscription anytime?</h4>
                        <p className="text-muted-foreground">Yes, you can cancel your subscription at any time from your settings page. You will retain access to your plan's features until the end of the current billing period.</p>
                   </div>
                   <div>
                        <h4 className="font-semibold">What happens if I use all my tokens?</h4>
                        <p className="text-muted-foreground">You can easily purchase a one-time token pack to top-up your account at any time, or upgrade to a subscription for a higher monthly allowance.</p>
                   </div>
                </CardContent>
            </Card>

        </div>
    );
}
