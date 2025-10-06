

'use client'

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Check, Zap, FileText, Timer, PenSquare, Cog, FileClock, LineChart, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Logo } from '@/components/logo';
import { useTheme } from '@/hooks/use-theme';


export default function LandingPage() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const carouselImages = [
    { src: 'https://picsum.photos/seed/dashboard/1200/800', hint: 'app dashboard' },
    { src: 'https://picsum.photos/seed/invoices/1200/800', hint: 'invoicing app' },
    { src: 'https://picsum.photos/seed/tracker/1200/800', hint: 'time tracker' },
    { src: 'https://picsum.photos/seed/proposals/1200/800', hint: 'proposal generator' },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  const features = [
    { 
        icon: Timer,
        title: 'Background-safe timer', 
        description: 'Our timer is idle-aware and runs reliably in the background, so you never miss a billable second.' 
    },
    { 
        icon: FileClock,
        title: '1-click PDF invoices', 
        description: 'Generate professional invoices with your branding, line items, and a direct payment link automatically included.' 
    },
    { 
        icon: PenSquare,
        title: 'AI proposal writer', 
        description: 'Turn a job post into a client-winning proposal in seconds. With templates for marketplaces or private clients.'
    },
    { 
        icon: Zap,
        title: 'Pay-as-you-grow tokens', 
        description: 'Start free, then top-up tokens as you need them. Paid plans include token rollover.' 
    },
    { 
        icon: Cog,
        title: 'Simple project management', 
        description: 'Keep track of clients, projects, rates, and statuses all in one place.' 
    },
    { 
        icon: LineChart,
        title: 'Insightful reports',
        description: 'Visualize your revenue, track hours per project, and understand your business performance at a glance.'
    },
  ];
  
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
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-7 w-7 text-primary" />
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
               <Link
                href="#faq"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-secondary/30 py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
              Stop Losing Billable Hours
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Track time, create invoices, and write client-winning proposals
              in one free toolkit. 10 AI credits every month — no credit card
              required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                    <Button asChild size="lg">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                ) : (
                    <Button asChild size="lg">
                        <Link href="/register">Register</Link>
                    </Button>
                )}
              <Button asChild size="lg" variant="outline">
                  <Link href="/proposal-generator">Try Proposal Writer</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free forever with monthly credits. Upgrade only when you scale.
            </p>
          </div>
        </section>

        {/* App Screenshot Carousel */}
        <section className="container mx-auto px-4 relative z-10 -mt-20">
           <Carousel
              className="bg-white dark:bg-card p-2 rounded-xl shadow-2xl ring-1 ring-black/10"
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
                            height={675}
                            className="rounded-lg w-full aspect-video object-cover"
                            data-ai-hint={img.hint}
                            priority={index === 0}
                        />
                    </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
        </section>


        {/* Pain-Points Grid */}
        <section className="py-16 md:py-28 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">Sound Familiar?</h2>
              <p className="text-muted-foreground mt-4 text-lg">Freelancing has its headaches. We're here to help.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-12">
              <div className="p-6 rounded-lg">
                <Timer className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold">Forgot To Log Hours?</h3>
                <p className="text-muted-foreground mt-2">
                  An idle-aware timer that runs safely in the background. Never miss a billable second.
                </p>
              </div>
              <div className="p-6 rounded-lg">
                <FileText className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold">Invoices Look Amateur?</h3>
                <p className="text-muted-foreground mt-2">
                  Generate a 1-click PDF with your branding and a payment link. Professionalism, sorted.
                </p>
              </div>
              <div className="p-6 rounded-lg">
                <PenSquare className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold">Proposals Take Forever?</h3>
                <p className="text-muted-foreground mt-2">
                  Let AI write a client-winning draft in seconds from any job post. More winning, less writing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Token Credit Block */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
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
          <div className="container mx-auto px-4 text-center">
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
        <section id="features" className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold">Your complete toolkit for freelance success</h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        GigBillow isn't just another tool—it's a smart assistant designed to handle the tedious parts of freelancing, so you can focus on what you do best.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {features.map((feature, i) => (
                        <Card key={i} className="bg-card flex flex-col">
                            <CardHeader className="flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Pricing Table */}
        <section id="pricing" className="py-16 md:py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
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
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Unlimited Time Tracking</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Unlimited Projects & Clients</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Unlimited Expense Entries</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> 10 Free Tokens / month</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Online Invoice & Proposal Sharing</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Community support</li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild><Link href="/register">Get Started</Link></Button>
                </CardContent>
              </Card>
              <Card className="border-primary border-2 relative">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Most Popular</div>
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Standard Pack</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$15</p>
                  <p className="text-muted-foreground">One-time purchase</p>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-0">
                   <ul className="space-y-3 text-muted-foreground">
                    <li className="font-semibold text-foreground">Everything in Free, plus...</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> 200 tokens</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> ~$0.075 per premium action</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Valid for 3 months</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Priority email support</li>
                  </ul>
                  <Button className="w-full" asChild><Link href="/register">Buy Standard Pack</Link></Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Mini Pack</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$5</p>
                  <p className="text-muted-foreground">One-time purchase</p>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-0">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="font-semibold text-foreground">Everything in Free, plus...</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> 50 tokens</li>
                     <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> ~$0.10 per premium action</li>
                     <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Valid for 1 month</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Priority email support</li>
                  </ul>
                  <Button variant="secondary" className="w-full" asChild><Link href="/register">Buy Mini Pack</Link></Button>
                </CardContent>
              </Card>
            </div>
            
            <Card className="max-w-5xl mx-auto mt-8 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                <div className="md:col-span-2">
                    <h3 className="text-xl font-bold">Max Pack</h3>
                    <p className="text-muted-foreground mt-1">For power users and agencies. Get a large bundle of tokens that last a full year.</p>
                     <ul className="space-y-3 text-muted-foreground mt-4">
                        <li className="font-semibold text-foreground">Everything in Free, plus...</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> 500 tokens</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> ~$0.06 per premium action</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Valid for 12 months</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Priority email support</li>
                    </ul>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-4xl font-extrabold mt-2">$30</p>
                    <p className="text-muted-foreground">One-time purchase</p>
                    <Button size="lg" className="mt-4 w-full md:w-auto" asChild><Link href="/register">Buy Max Pack</Link></Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold">Common Questions</h2>
                    <p className="text-muted-foreground mt-2">
                        Here are some of the most common questions we get about GigBillow.
                    </p>
                </div>
                <Accordion type="single" collapsible className="w-full mt-12">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

        {/* CTA Strip */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">
              Your first paid invoice costs less than a coffee.
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Sign up and get 10 free tokens. No credit card required.
            </p>
            <div className="mt-8">
              {user ? (
                    <Button asChild size="lg">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                ) : (
                    <Button asChild size="lg">
                        <Link href="/register">Register</Link>
                    </Button>
                )}
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
            <Link href="#faq" className="text-sm hover:underline">FAQ</Link>
            <Link href="/proposal-generator" className="text-sm hover:underline">Proposal Writer</Link>
          </div>
          <p className="text-sm">
            © 2024 GigBillow. All rights reserved.
          </p>
           <p className="text-sm mt-2">
            Made with ❤️ by{' '}
            <a
              href="https://owaisabdullah.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Owais Abdullah
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
