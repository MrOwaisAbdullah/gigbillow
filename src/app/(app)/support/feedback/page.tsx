
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, MessageSquareHeart } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { createFeedback } from '@/lib/api/feedback';

const formSchema = z.object({
  feedback: z.string().min(10, 'Feedback must be at least 10 characters.'),
});

export default function FeedbackPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to submit feedback.',
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
        await createFeedback({
            userId: user.uid,
            userEmail: user.email || 'unknown',
            feedbackText: values.feedback,
        });

        toast({
            title: 'Feedback Sent!',
            description: "Thank you for helping us improve GigBillow. We've received your feedback.",
        });
        form.reset();

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'Could not send your feedback. Please try again later.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center gap-4">
         <MessageSquareHeart className="h-8 w-8 text-primary" />
         <h1 className="text-3xl font-bold tracking-tight">Submit Feedback</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Share Your Thoughts</CardTitle>
          <CardDescription>
            We're in beta and your feedback is crucial. Let us know what you like, what you don't, or any ideas you have.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Feedback
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
