'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Star, ArrowLeft, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buyBundle } from '@/lib/api/stripe-client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { LandingHeader } from "@/components/landing/header";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleBuy = async (bundleType: 'mini' | 'standard' | 'agency') => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }
    await buyBundle(bundleType);
  };

  const commonFeatures = [
    "Unlimited Time Tracking",
    "Unlimited Projects & Clients",
    "Unlimited Expense Entries",
    "Online Invoice & Proposal Sharing",
    "Community support"
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <LandingHeader />
      
      <main className="flex-1 container mx-auto py-20 px-4">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-center mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Pay only when you need to. Tokens never expire. No monthly subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-24">
          {/* Mini Pack */}
          <Card className="flex flex-col bg-background border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center p-6">
              <div className="mb-2">
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">🎉 Limited Time Offer!</span>
              </div>
              <CardTitle className="text-xl">Mini Pack</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-2xl text-muted-foreground line-through">$8</p>
                <p className="text-4xl font-extrabold text-green-600 dark:text-green-500">$5</p>
              </div>
              <p className="text-muted-foreground">One-time purchase</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow space-y-4 p-6 pt-0">
              <ul className="space-y-3 text-muted-foreground flex-grow">
                {commonFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                    {feature}
                  </li>
                ))}
                <li className="flex items-start gap-2 font-semibold text-foreground pt-2 border-t">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  50 tokens
                </li>
                <li className="flex items-start gap-2 font-semibold text-foreground">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Valid for 1 month
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Priority email support
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => handleBuy('mini')}>
                Buy Mini Pack
              </Button>
            </CardContent>
          </Card>

          {/* Standard Pack */}
          <Card className="border-primary border-2 relative flex flex-col bg-background shadow-lg scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
              Most Popular
            </div>
            <CardHeader className="text-center p-6">
              <div className="mb-2">
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">🎉 Limited Time Offer!</span>
              </div>
              <CardTitle className="text-xl">Standard Pack</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-2xl text-muted-foreground line-through">$18</p>
                <p className="text-4xl font-extrabold text-green-600 dark:text-green-500">$14</p>
              </div>
              <p className="text-muted-foreground">One-time purchase</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow space-y-4 p-6 pt-0">
              <ul className="space-y-3 text-muted-foreground flex-grow">
                {commonFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                    {feature}
                  </li>
                ))}
                <li className="flex items-start gap-2 font-semibold text-foreground pt-2 border-t">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  200 tokens
                </li>
                <li className="flex items-start gap-2 font-semibold text-foreground">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Branded PDFs (with your logo) at no extra token cost
                </li>
                <li className="flex items-start gap-2 font-semibold text-foreground">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Valid for 3 months
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Priority email support
                </li>
              </ul>
              <Button className="w-full" onClick={() => handleBuy('standard')}>
                Buy Standard Pack
              </Button>
            </CardContent>
          </Card>

          {/* Agency Pack */}
          <Card className="flex flex-col bg-background border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center p-6">
              <div className="mb-2">
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">🎉 Limited Time Offer!</span>
              </div>
              <CardTitle className="text-xl">Agency Pack</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-2xl text-muted-foreground line-through">$38</p>
                <p className="text-4xl font-extrabold text-green-600 dark:text-green-500">$29</p>
              </div>
              <p className="text-muted-foreground">One-time purchase</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow space-y-4 p-6 pt-0">
              <ul className="space-y-3 text-muted-foreground flex-grow">
                {commonFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                    {feature}
                  </li>
                ))}
                <li className="flex items-start gap-2 font-semibold text-foreground pt-2 border-t">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  500 tokens total
                </li>
                <li className="flex items-start gap-2 font-semibold text-foreground">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Branded PDFs (with your logo) at no extra token cost
                </li>
                <li className="flex items-start gap-2 font-semibold text-foreground">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Valid for 12 months
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />{" "}
                  Priority email support
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 mt-1 text-yellow-500 flex-shrink-0" />{" "}
                  Early access to new beta features
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => handleBuy('agency')}>
                Buy Agency Pack
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center">Mini</TableHead>
                  <TableHead className="text-center">Standard</TableHead>
                  <TableHead className="text-center">Agency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Price</TableCell>
                  <TableCell className="text-center">$0 / mo</TableCell>
                  <TableCell className="text-center">$5</TableCell>
                  <TableCell className="text-center">$14</TableCell>
                  <TableCell className="text-center">$29</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tokens</TableCell>
                  <TableCell className="text-center">10 / month</TableCell>
                  <TableCell className="text-center">50 (One-time)</TableCell>
                  <TableCell className="text-center">200 (One-time)</TableCell>
                  <TableCell className="text-center">500 (One-time)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Validity</TableCell>
                  <TableCell className="text-center">1 Month (Resets)</TableCell>
                  <TableCell className="text-center">1 Month</TableCell>
                  <TableCell className="text-center">3 Months</TableCell>
                  <TableCell className="text-center">12 Months</TableCell>
                </TableRow>
                {commonFeatures.map((feature) => (
                  <TableRow key={feature}>
                    <TableCell className="font-medium">{feature}</TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                    <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">Branded PDFs</TableCell>
                  <TableCell className="text-center"><Minus className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><Minus className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Priority Support</TableCell>
                  <TableCell className="text-center"><Minus className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">Early Access Features</TableCell>
                  <TableCell className="text-center"><Minus className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><Minus className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><Minus className="h-4 w-4 mx-auto text-muted-foreground" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I buy multiple packs?</AccordionTrigger>
              <AccordionContent>
                Yes – purchased tokens stack and never expire. You can buy as many packs as you need.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Do my free monthly tokens expire?</AccordionTrigger>
              <AccordionContent>
                Yes, your free 10 monthly tokens reset every 30 days and do not roll over. However, any tokens you purchase will never expire.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Do you store my logo file?</AccordionTrigger>
              <AccordionContent>
                Not yet – paste a public URL (Google Drive, Dropbox, etc.) and we embed it instantly on your invoices and proposals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is there a monthly subscription?</AccordionTrigger>
              <AccordionContent>
                No. You buy tokens only when you have work to bill. There are no recurring monthly charges for the token packs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>What is the refund policy?</AccordionTrigger>
              <AccordionContent>
                If you don’t use a single token from a purchased pack within 7 days of purchase, email us for a full refund – no questions asked.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
