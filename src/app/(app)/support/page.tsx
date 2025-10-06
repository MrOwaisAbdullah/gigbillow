
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
            question: "Can I buy multiple token packs?",
            answer: "Yes – tokens stack and each pack keeps its own expiry date. The system will always use the tokens that are closest to expiring first."
        },
        {
            question: "What happens when a pack expires?",
            answer: "Only unused tokens from that specific pack disappear. Your account, data, and all free features remain active forever."
        },
        {
            question: "Is there a subscription?",
            answer: "No. We believe you should only pay when you have work to bill for. Buy token packs when you need them, and they'll be ready when you do."
        },
        {
            question: "Do you store my logo file?",
            answer: "Not yet. To add your branding to PDFs, you can paste a public URL to your logo (e.g., from your website, Google Drive, or Dropbox), and we embed it instantly. We plan to add direct uploads in the future."
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
