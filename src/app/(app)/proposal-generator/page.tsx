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
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { generateProposal } from '@/ai/flows/generate-proposal';

const formSchema = z.object({
  mode: z.enum(['Marketplace', 'Private Client'], {
    required_error: 'You need to select a proposal mode.',
  }),
  jobPostText: z
    .string()
    .min(10, 'Job post text must be at least 10 characters.')
    .max(2000, 'Job post text must not exceed 2000 characters.'),
  clientName: z.string().optional(),
  budget: z.coerce.number().optional(),
  deadline: z.date().optional(),
  deliverables: z.string().min(5, 'Deliverables must be at least 5 characters.'),
});

type ProposalFormValues = z.infer<typeof formSchema>;

export default function ProposalGeneratorPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'Marketplace',
      jobPostText: '',
      clientName: '',
      deliverables: '',
    },
  });
  
  const mode = form.watch('mode');

  async function onSubmit(values: ProposalFormValues) {
    setIsGenerating(true);
    setGeneratedProposal('');
    try {
      const result = await generateProposal({
        ...values,
        deadline: values.deadline ? format(values.deadline, 'PPP') : undefined,
      });
      setGeneratedProposal(result.proposal);
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
                  name="mode"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Proposal Mode</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Marketplace" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Marketplace (Upwork / Fiverr)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Private Client" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Private Client (Email / PDF)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        The AI will use this to understand the project requirements.
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
                      <FormLabel>Key Deliverables</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 5-page responsive website, new brand logo, 3 blog posts..."
                          {...field}
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

                 <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Proposal
                  </Button>
              </Content>
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
                <div className="flex h-[200px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : generatedProposal ? (
                <Textarea
                  value={generatedProposal}
                  onChange={e => setGeneratedProposal(e.target.value)}
                  className="min-h-[300px] text-base"
                />
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed text-center text-muted-foreground">
                  <p>Your AI-generated proposal will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
          {generatedProposal && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCopyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
               {mode === 'Private Client' && (
                  <Button disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
