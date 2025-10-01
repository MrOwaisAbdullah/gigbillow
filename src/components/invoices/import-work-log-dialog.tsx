'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { importWorkLogs, type ImportWorkLogsOutput } from '@/ai/flows/import-work-logs'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  platformName: z.enum(['Fiverr', 'Upwork', 'Other']),
  workLogData: z.string().min(10, 'Work log data must be at least 10 characters.'),
})

type ImportWorkLogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportWorkLogDialog({ open, onOpenChange }: ImportWorkLogDialogProps) {
  const { toast } = useToast()
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platformName: 'Fiverr',
      workLogData: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const result = await importWorkLogs(values)
      toast({
        title: 'Work Log Imported',
        description: 'Data successfully extracted. You can now create an invoice.',
      })
      
      const queryParams = new URLSearchParams({
        projectName: result.projectName,
        hoursWorked: String(result.hoursWorked),
        rate: String(result.rate),
        description: result.description,
      }).toString();

      router.push(`/invoices/new?${queryParams}`);
      onOpenChange(false) // Close dialog on success
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Could not extract data from the work log. Please check the format.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Work Log</DialogTitle>
          <DialogDescription>
            Paste your work log from Fiverr, Upwork, or another platform to automatically extract invoice details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platformName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Fiverr">Fiverr</SelectItem>
                      <SelectItem value="Upwork">Upwork</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workLogData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Log Data</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your raw work log data here..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import & Create Invoice
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

    