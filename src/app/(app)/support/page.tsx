

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Mail, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useTour } from '@/components/tour-provider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function SupportPage() {
    const { setOpen: setTourOpen } = useTour();
    
    const faqs = [
        {
            question: "How do I add my logo to invoices?",
            answer: "To add your logo, you must purchase a token pack. Once you have, you can go to Settings > Profile and add a public URL to your logo file. This URL can be from your own website, a cloud storage service like Google Drive or Dropbox (ensure the link is public), or an image hosting service."
        },
        {
            question: "My timer didn't record my time correctly. What should I do?",
            answer: "The timer is designed to be resilient, but issues can still occur. If you notice a discrepancy, you can manually add a time entry. Go to the Time Tracker page, click 'History', and you will find an option to add a manual entry. We are working on improving timer reliability in future updates."
        },
        {
            question: "What does '1 Token' get me?",
            answer: "One token can be used for one premium action. This includes: generating one AI proposal, downloading one PDF invoice, creating a new project, or exporting one report. Removing the GigBillow watermark from a PDF costs 3 tokens."
        },
        {
            question: "I was referred by a friend. How do I make sure they get credit?",
            answer: "If you signed up using a referral link or entered a code during registration, the system has automatically logged the referral. Your friend will receive their reward once you become a paying customer (i.e., after your first token pack purchase). There is no further action needed from you."
        }
    ];

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
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

        </div>
    );
}
