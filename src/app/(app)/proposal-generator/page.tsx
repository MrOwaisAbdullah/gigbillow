
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarIcon,
  Copy,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { canAfford, chargeFor } from '@/lib/api/tokens';
import { useToken } from '@/components/token/token-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { generateProposalPdf } from '@/lib/pdf-utils';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  jobPostText: z
    .string()
    .min(10, 'Job post text must be at least 10 characters.')
    .max(2000, 'Job post text must not exceed 2000 characters.'),
  clientName: z.string().optional(),
  budget: z.coerce.number().optional(),
  deadline: z.date().optional(),
  deliverables: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof formSchema>;
const LOCAL_STORAGE_KEY = 'proposalFormData';

export default function ProposalGeneratorPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const { openDialog } = useToken();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobPostText: '',
      clientName: '',
      deliverables: '',
    },
  });

  // Load from local storage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.deadline) {
          parsedData.deadline = new Date(parsedData.deadline);
        }
        form.reset(parsedData);
      } catch (e) {
        console.error('Failed to parse proposal form data from storage');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [form]);
  
  // Save to local storage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);


  async function onSubmit(values: ProposalFormValues) {
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/proposal-generator');
      router.push('/login');
      return;
    }

    setIsGenerating(true);
    setGeneratedProposal('');

    const hasEnoughTokens = await canAfford('proposal');
    if (!hasEnoughTokens) {
      openDialog();
      setIsGenerating(false);
      return;
    }

    try {
      const result = await generateProposal({
        ...values,
        deadline: values.deadline ? format(values.deadline, 'PPP') : undefined,
      });

      setGeneratedProposal(result.proposal);
      
      await chargeFor('proposal');
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      toast({
        title: 'Proposal Generated',
        description: 'Your new proposal is ready below.',
      });
    } catch (error) {
      console.error('Proposal generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          'There was an error generating the proposal. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedProposal);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleDownload = () => {
    generateProposalPdf({
      proposalText: generatedProposal,
      clientName: form.getValues('clientName'),
    });
    toast({ title: 'Download started!' });
  };
  
  const generateButtonText = user ? 'Generate Proposal (-1 Token)' : 'Log In & Generate';

  return (
    <div className="flex flex-col gap-8 pb-8">
      <h1 className="text-3xl font-bold tracking-tight">Proposal Generator</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Provide the details for the job you're applying for.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="jobPostText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Post Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the job description here..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The AI will use this to understand the project
                        requirements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliverables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Deliverables (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 5-page responsive website, new brand logo, 3 blog posts..."
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        List the main things you will deliver.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 1500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isGenerating || authLoading}
                  className="w-full"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {generateButtonText}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
        <div className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>Generated Proposal</CardTitle>
              <CardDescription>
                Review, edit, and copy your generated proposal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="space-y-4 pt-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/6" />
                </div>
              ) : generatedProposal ? (
                <Textarea
                  value={generatedProposal}
                  onChange={(e) => setGeneratedProposal(e.target.value)}
                  className="min-h-[300px] text-base"
                />
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed text-center text-muted-foreground p-4">
                  <p className="max-w-xs">
                    Your AI-generated proposal will appear here once you
                    provide job details and click generate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {generatedProposal && (
            <div className="flex justify-end gap-2 flex-wrap">
              <Button variant="outline" onClick={handleCopyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
