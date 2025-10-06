

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Check } from 'lucide-react';

type WelcomeTourProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const tourSteps = [
  {
    title: '1. Win Your Next Job',
    description: "Paste a job description into the Proposal Generator and let AI write a compelling, client-winning proposal in seconds.",
    imageSrc: 'https://picsum.photos/seed/proposals/1200/800',
    imageHint: 'proposal generator'
  },
  {
    title: '2. Manage Clients & Projects',
    description: 'Once you win the job, add the client and create a new project. Set an hourly rate to make time tracking seamless.',
    imageSrc: 'https://picsum.photos/seed/projects_page/1200/800',
    imageHint: 'project management app'
  },
  {
    title: '3. Track Every Billable Second',
    description: 'Use the simple, background-safe time tracker to log your hours accurately. Never lose a minute of your hard work.',
    imageSrc: 'https://picsum.photos/seed/tracker/1200/800',
    imageHint: 'time tracker'
  },
  {
    title: '4. Get Paid Faster',
    description: 'When it’s time to bill, generate a professional, 1-click PDF invoice. Add a payment link to get paid instantly.',
    imageSrc: 'https://picsum.photos/seed/invoices/1200/800',
    imageHint: 'invoicing app'
  },
  {
    title: '5. Understand Your Business',
    description: 'Keep an eye on your performance with reports. Visualize your revenue, see where your hours are going, and make smarter decisions.',
    imageSrc: 'https://picsum.photos/seed/reports/1200/800',
    imageHint: 'analytics dashboard'
  },
];

export function WelcomeTour({ open, onOpenChange }: WelcomeTourProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const isLastStep = current === tourSteps.length - 1;

  const handleFinish = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to GigBillow!</DialogTitle>
          <DialogDescription>
            Here’s a quick tour of how to get the most out of your new workspace.
          </DialogDescription>
        </DialogHeader>
        
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {tourSteps.map((step, index) => (
              <CarouselItem key={index}>
                  <Card className='p-1 border-none shadow-none'>
                    <CardContent className="flex flex-wrap items-center justify-center p-4 gap-6">
                        <div className="w-full lg:w-1/2 flex-shrink-0">
                           <Image
                                src={step.imageSrc}
                                alt={step.title}
                                width={600}
                                height={400}
                                className="rounded-lg w-full aspect-video object-cover"
                                data-ai-hint={step.imageHint}
                            />
                        </div>
                        <div className="space-y-3 text-center lg:text-left flex-1 min-w-[280px]">
                           <h3 className="text-xl font-semibold">{step.title}</h3>
                           <p className="text-muted-foreground text-sm sm:text-base">{step.description}</p>
                        </div>
                    </CardContent>
                  </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full px-2 sm:px-0">
          <Button variant="ghost" onClick={handleFinish}>
            Skip Tour
          </Button>

          <div className="flex justify-center sm:justify-end items-center gap-2">
            <Button
              variant="outline"
              onClick={() => api?.scrollPrev()}
              disabled={current === 0}
            >
              Back
            </Button>

            {isLastStep ? (
              <Button onClick={handleFinish}>
                <Check className="mr-2 h-4 w-4" />
                Finish
              </Button>
            ) : (
              <Button onClick={() => api?.scrollNext()}>
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
