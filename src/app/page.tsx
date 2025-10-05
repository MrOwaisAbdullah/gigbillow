
'use client'

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Check, Zap, FileText, Timer, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';

function HeaderButtons() {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }

    if (user) {
        return (
            <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        )
    }

    return (
        <>
            <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
                <Link href="/register">Start Free Trial</Link>
            </Button>
        </>
    )
}


export default function LandingPage() {
  const carouselImages = [
    { src: 'https://picsum.photos/seed/dashboard/1200/800', hint: 'app dashboard' },
    { src: 'https://picsum.photos/seed/invoices/1200/800', hint: 'invoicing app' },
    { src: 'https://picsum.photos/seed/tracker/1200/800', hint: 'time tracker' },
    { src: 'https://picsum.photos/seed/proposals/1200/800', hint: 'proposal generator' },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );


  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-2">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold">GigBillow</span>
            </Link>
            <nav className="ml-6 hidden items-center space-x-6 text-sm font-medium md:flex">
              <Link
                href="#features"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
             <HeaderButtons />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-secondary/30">
          <div className="container mx-auto px-6 pt-20 pb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
              Stop Losing Billable Hours
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Track time, create invoices, and write client-winning proposals
              in one free toolkit. 10 AI credits every month — no credit card
              required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/proposal-generator">Try Proposal Generator</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free forever with monthly credits. Upgrade only when you scale.
            </p>
          </div>
        </section>

        {/* App Screenshot Carousel */}
        <section className="container mx-auto px-6 -mt-12 sm:-mt-16 md:-mt-24 relative z-10">
           <Carousel 
              className="bg-white dark:bg-black p-2 rounded-xl shadow-2xl ring-1 ring-black/10 mt-4"
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {carouselImages.map((img, index) => (
                    <CarouselItem key={index}>
                        <Image
                            src={img.src}
                            alt={`GigBillow application screenshot ${index + 1}`}
                            width={1200}
                            height={800}
                            className="rounded-lg w-full"
                            data-ai-hint={img.hint}
                            priority={index === 0}
                        />
                    </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
        </section>


        {/* Pain-Points Grid */}
        <section className="py-16 md:py-28">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-lg">
                <Timer className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold">Forgot to log hours?</h3>
                <p className="text-muted-foreground mt-2">
                  An auto-timer that remembers for you.
                </p>
              </div>
              <div className="p-6 rounded-lg">
                <FileText className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold">Invoices look amateur?</h3>
                <p className="text-muted-foreground mt-2">
                  Generate a 1-click PDF with payment link.
                </p>
              </div>
              <div className="p-6 rounded-lg">
                <PenSquare className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold">Proposals take forever?</h3>
                <p className="text-muted-foreground mt-2">
                  Let AI write a client-winning draft in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Token Credit Block */}
        <section className="bg-secondary/30 py-16 md:py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold">Simple, Pay-As-You-Grow Credits</h2>
            <p className="text-muted-foreground mt-2">No subscriptions. No hidden fees. Just tokens.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">10 Tokens / month</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg">Free, Forever</p>
                  <p className="text-muted-foreground text-sm mt-1">Enough for a few projects a month.</p>
                </CardContent>
              </Card>
               <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">What's a Token?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">1 Token = 1 Action</p>
                  <p className="text-muted-foreground text-sm mt-1">Generate 1 invoice, or 1 proposal, or create 1 new project.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Top-up Anytime</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="font-bold text-lg">50 Tokens for $5</p>
                   <p className="text-muted-foreground text-sm mt-1">Running low? Grab more on the fly.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof Strip */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <p className="text-lg font-semibold">
              &quot;GigBillow recovered $340 in billable hours my first
              week!&quot;
            </p>
            <p className="text-sm opacity-80 mt-2">
              — Alex, UX Freelancer
            </p>
             <p className="text-sm opacity-80 mt-4">
              Trusted by over 200+ freelancers | 4.8/5 Beta Rating
            </p>
          </div>
        </section>

        {/* Feature List */}
        <section id="features" className="py-16 md:py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              All The Tools You Need. None of The Fluff.
            </h2>
            <ul className="space-y-6 max-w-2xl mx-auto">
              {[
                { title: 'Background-Safe Timer', description: 'Our timer is idle-aware and runs reliably in the background, so you never miss a billable second.' },
                { title: '1-Click PDF Invoices', description: 'Generate professional invoices with your branding, line items, and a direct payment link automatically included.' },
                { title: 'AI Proposal Writer', description: 'Turn a job post into a client-winning proposal in seconds. With templates for marketplaces or private clients.' },
                { title: 'Pay-As-You-Grow Tokens', description: 'Start free, then top-up tokens as you need them. Paid plans include token rollover.' },
                { title: '7-Day Pro Trial', description: 'Start with a 7-day trial to unlock 150 tokens. After, stay on the free plan or upgrade for just $15/month.' },
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-4">
                  <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing Table */}
        <section id="pricing" className="py-16 md:py-20 bg-secondary/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              Simple Pricing for Every Freelancer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Free</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$0</p>
                  <p className="text-muted-foreground">No card required</p>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-0">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> 10 tokens / month</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> No token rollover</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Community support</li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild><Link href="/register">Get Started</Link></Button>
                </CardContent>
              </Card>
              <Card className="border-primary border-2 relative">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Most Popular</div>
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$15<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-muted-foreground">For growing businesses</p>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-0">
                   <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> 150 tokens / month</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Rollover up to 150 tokens</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Priority email support</li>
                  </ul>
                  <Button className="w-full" asChild><Link href="/register">Start 7-Day Trial</Link></Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Booster</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$30</p>                  <p className="text-muted-foreground">One-time purchase</p>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-0">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> 500 tokens</li>
                     <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Never expire</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Priority email support</li>
                  </ul>
                  <Button variant="secondary" className="w-full">Buy Now</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Strip */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold">
              Ready to ditch the spreadsheet?
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Start your free trial. No credit card required. 10 tokens are
              waiting for you.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4 mb-4">
            <Link href="#features" className="text-sm hover:underline">Features</Link>
            <Link href="#pricing" className="text-sm hover:underline">Pricing</Link>
            <Link href="/proposal-generator" className="text-sm hover:underline">Proposal Writer</Link>
            <Link href="/track" className="text-sm hover:underline">Time Tracker</Link>
          </div>
          <p className="text-sm">
            © 2024 GigBillow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

    