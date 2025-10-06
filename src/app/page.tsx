

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
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Check, Zap, FileText, Timer, PenSquare, Cog, FileClock, LineChart, Moon, Sun, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Logo } from '@/components/logo';
import { useTheme } from '@/hooks/use-theme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function LandingPage() {
  const { user } = useAuth();
  const { toggleTheme } = useTheme();

  const carouselImages = [
    { src: 'https://picsum.photos/seed/dashboard/1200/800', hint: 'app dashboard' },
    { src: 'https://picsum.photos/seed/invoices/1200/800', hint: 'invoicing app' },
    { src: 'https://picsum.photos/seed/tracker/1200/800', hint: 'time tracker' },
    { src: 'https://picsum.photos/seed/proposals/1200/800', hint: 'proposal generator' },
  ];
  
  const testimonials = [
    {
      quote: "GigBillow recovered $340 in unbilled hours my first week! The background timer is a lifesaver.",
      name: "Alex Rivera",
      role: "UX Freelancer",
      avatar: "https://picsum.photos/seed/alex/100"
    },
    {
      quote: "The AI proposal writer is a game-changer. I went from spending an hour on proposals to just five minutes. More time for actual work.",
      name: "Samantha Chen",
      role: "Copywriter",
      avatar: "https://picsum.photos/seed/samantha/100"
    },
    {
      quote: "Finally, an all-in-one tool that doesn't feel bloated. The invoicing is clean, simple, and my clients pay faster.",
      name: "David Lee",
      role: "Web Developer",
      avatar: "https://picsum.photos/seed/david/100"
    },
    {
      quote: "As a visual artist, managing invoices was my biggest nightmare. GigBillow made it simple and beautiful. The reports help me see where my time really goes.",
      name: "Maria Rodriguez",
      role: "Illustrator & Designer",
      avatar: "https://picsum.photos/seed/maria/100"
    }
  ];

  const heroCarouselPlugin = React.useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true })
  );
  
  const testimonialCarouselPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
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
        title: 'AI Proposal Writer',
        description: 'Turn job descriptions into winning proposals in seconds. Land more clients with less effort.'
    },
    { 
        icon: LineChart,
        title: 'Insightful Reports', 
        description: 'Understand your business performance with visual dashboards for revenue, hours, and project profitability.' 
    },
    { 
        icon: Cog,
        title: 'Simple Project Management', 
        description: 'Manage all your clients and projects in one place, with custom rates and statuses for ultimate organization.' 
    },
    { 
        icon: Zap,
        title: 'Pay-as-you-grow Credits', 
        description: 'No monthly subscriptions. Buy tokens only when you need premium actions like PDF downloads or AI generation.' 
    },
  ];

  const faqs = [
    {
      question: "What are tokens and why do I need them?",
      answer: "Tokens are credits you use for premium actions. Core features like time tracking, project management, and expense logging are free forever. You only use tokens for actions like downloading a branded PDF invoice, generating an AI proposal, or exporting a report. This pay-as-you-grow model means you only pay for what you actually use."
    },
    {
      question: "Do my unused tokens roll over?",
      answer: "Unused tokens from one-time packs expire based on their validity period (e.g., 3 months for the Standard Pack). The free 10 monthly credits do not roll over. This system encourages you to buy only what you need, when you need it."
    },
    {
      question: "Is there a subscription plan?",
      answer: "No, GigBillow is proudly subscription-free. We believe freelancers need flexibility, not another recurring bill. You can buy token packs as one-time purchases whenever you need to perform premium actions."
    },
    {
      question: "How do I add my logo to invoices?",
      answer: "To add your logo, you must purchase a token pack. Once you have, you can go to Settings > Profile and add a public URL to your logo file. This URL can be from your own website, a cloud storage service like Google Drive or Dropbox (ensure the link is public), or an image hosting service."
    },
    {
      question: "What happens if I run out of tokens?",
      answer: "If you try to perform a premium action without enough tokens, we'll simply prompt you to purchase a new token pack. Your account, data, and all free features will remain fully accessible. You'll never be locked out of your work."
    },
    {
      question: "Can I try the AI features before buying tokens?",
      answer: "Absolutely! Every new user gets 10 free tokens, and your free tokens are refilled to 10 every 30 days. You can use these to try out the AI Proposal Generator, download a few invoices, and see if the premium features are right for you."
    },
    {
      question: "Is my client and financial data secure?",
      answer: "Yes. All your data is stored securely. We use industry-standard security practices to ensure your data is safe, and we never share your client or financial information with third parties."
    },
    {
      question: "Can I manage multiple businesses or brands?",
      answer: "Currently, each GigBillow account is designed to manage a single freelance business. For managing multiple distinct brands, we recommend creating separate accounts. This ensures clean data separation for clients, projects, and reporting."
    }
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center">
          <Link href="#" className="mr-6 flex items-center gap-2" prefetch={false}>
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg text-primary">GigBillow</span>
          </Link>
          <nav className="flex-1">
            {/* Can add nav links here later */}
          </nav>
          <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle Theme"
                onClick={toggleTheme}
              >
              <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {user === undefined ? (
               <>
                 <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            ) : user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                 <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto flex max-w-5xl flex-col items-center justify-center space-y-8 px-4 text-center md:px-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Track time, write proposals, and get paid.
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl">
                GigBillow is the all-in-one toolkit for modern freelancers. Stop juggling apps and start streamlining your business with AI-powered proposals, 1-click invoicing, and dead-simple time tracking.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
             <Button asChild size="lg" className="flex-1">
                <Link href="/proposal-generator">Generate a Proposal</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
            <div className="w-full max-w-5xl mx-auto pt-8">
              <div className="rounded-lg border p-2">
                <Carousel
                    plugins={[heroCarouselPlugin.current]}
                    className="w-full"
                    onMouseEnter={heroCarouselPlugin.current.stop}
                    onMouseLeave={heroCarouselPlugin.current.reset}
                  >
                  <CarouselContent>
                    {carouselImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <Card className='border-none shadow-none'>
                          <CardContent className="flex aspect-[16/9] items-center justify-center p-0">
                            <Image
                                src={image.src}
                                alt={`App Screenshot ${index + 1}`}
                                width={1200}
                                height={800}
                                className="rounded-lg object-cover w-full h-full"
                                data-ai-hint={image.hint}
                              />
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Everything you need. Nothing you don’t.</h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  GigBillow was built from the ground up to replace your messy stack of admin tools. It’s powerful, fast, and refreshingly simple.
                </p>
              </div>
              <div className="grid gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

       <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Pricing</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Pay-As-You-Grow Credits</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  No subscriptions. No hidden fees. Get 10 free tokens every month. Buy more only when you need them.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
              <Card className="flex flex-col">
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Free</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$0</p>
                  <p className="text-muted-foreground">No card required</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow space-y-4 p-6 pt-0">
                  <ul className="space-y-3 text-muted-foreground flex-grow">
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
              <Card className="border-primary border-2 relative flex flex-col">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Most Popular</div>
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Standard Pack</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$15</p>
                  <p className="text-muted-foreground">One-time purchase</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow space-y-4 p-6 pt-0">
                   <ul className="space-y-3 text-muted-foreground flex-grow">
                    <li className="font-semibold text-foreground">Everything in Free, plus...</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> 200 tokens</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Branded PDFs (with your logo) at no extra token cost</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Valid for 3 months</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Priority email support</li>
                  </ul>
                  <Button className="w-full" asChild><Link href="/proposal-generator">Generate a Proposal</Link></Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="text-center p-6">
                  <CardTitle className="text-xl">Mini Pack</CardTitle>
                  <p className="text-4xl font-extrabold mt-2">$5</p>
                  <p className="text-muted-foreground">One-time purchase</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow space-y-4 p-6 pt-0">
                  <ul className="space-y-3 text-muted-foreground flex-grow">
                    <li className="font-semibold text-foreground">Everything in Free, plus...</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> 50 tokens</li>
                     <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Valid for 1 month</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Priority email support</li>
                  </ul>
                  <Button variant="secondary" className="w-full" asChild><Link href="/proposal-generator">Generate a Proposal</Link></Button>
                </CardContent>
              </Card>
            </div>
            
            <Card className="max-w-5xl mx-auto mt-8 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                <div className="md:col-span-2">
                    <h3 className="text-xl font-bold">Agency Pack</h3>
                    <p className="text-muted-foreground mt-1">For power users and agencies. Get a large bundle of tokens that last a full year.</p>
                     <ul className="space-y-3 text-muted-foreground mt-4">
                        <li className="font-semibold text-foreground">Includes all Standard Plan benefits, plus:</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> 500 tokens total</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/> Valid for 12 months</li>
                        <li className="flex items-start gap-2"><Star className="h-4 w-4 mt-1 text-yellow-500 flex-shrink-0"/> Early access to new beta features</li>
                    </ul>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-4xl font-extrabold mt-2">$30</p>
                    <p className="text-muted-foreground">One-time purchase</p>
                    <Button size="lg" className="mt-4 w-full md:w-auto" asChild><Link href="/proposal-generator">Generate a Proposal</Link></Button>
                </div>
              </div>
            </Card>
             <div className="mt-12 text-center text-muted-foreground text-sm">
                <p>All one-time packs are purchased via Stripe. You can manage your payment methods securely.</p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-4 text-center">
                  <div className="space-y-2">
                       <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Average 4.8 rating in beta testing</h2>
                       <div className="flex justify-center text-yellow-400">
                          <Star className="w-8 h-8 fill-current" />
                          <Star className="w-8 h-8 fill-current" />
                          <Star className="w-8 h-8 fill-current" />
                          <Star className="w-8 h-8 fill-current" />
                          <Star className="w-8 h-8 fill-current" />
                       </div>
                  </div>
              </div>
              <Carousel 
                opts={{ loop: true }}
                plugins={[testimonialCarouselPlugin.current]}
                className="w-full max-w-4xl mx-auto mt-12"
                onMouseEnter={testimonialCarouselPlugin.current.stop}
                onMouseLeave={testimonialCarouselPlugin.current.reset}
                >
                <CarouselContent>
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="h-full bg-background">
                        <CardContent className="p-6 flex flex-col justify-between h-full">
                          <div className="space-y-4">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-current" />
                              ))}
                            </div>
                            <p className="text-muted-foreground">"{testimonial.quote}"</p>
                          </div>
                          <div className="flex items-center gap-4 pt-6">
                            <Avatar>
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{testimonial.name}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 fill-black" />
                <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 fill-black" />
              </Carousel>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
           <div className="container mx-auto max-w-5xl px-4 md:px-6">
             <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
             </div>
             <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto mt-12">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-lg text-left hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
           </div>
        </section>


        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to streamline your freelance life?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up today and get 10 free tokens. No credit card required.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
                 {user ? (
                    <Button asChild size="lg">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                 ) : (
                    <Button asChild size="lg">
                        <Link href="/register">Get Started Now</Link>
                    </Button>
                )}
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full shrink-0 border-t">
         <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} GigBillow. All rights reserved.</p>
            <nav className="flex gap-4 sm:gap-6">
              <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
                Terms of Service
              </Link>
              <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
                Privacy
              </Link>
            </nav>
          </div>
      </footer>
    </div>
  );
}

    