'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { clients, projects } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().positive().optional(),
  unitPrice: z.coerce.number().positive().optional(),
});

const formSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, 'Invoice number is required.'),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  billTo: z.string().min(1, 'Billing address is required.'),
  issuedDate: z.date({
    required_error: 'An issue date is required.',
  }),
  dueDate: z.date({
    required_error: 'A due date is required.',
  }),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  paymentUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

export default function NewInvoicePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isInvoiceCreated, setIsInvoiceCreated] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      clientId: '',
      projectId: '',
      billTo: '',
      issuedDate: new Date(),
      dueDate: addDays(new Date(), 30),
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      paymentUrl: '',
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });
  
  const lineItems = form.watch('lineItems');
  const taxRate = form.watch('taxRate');
  
  const subTotal = lineItems.reduce((acc, item) => {
    return acc + ((item.quantity || 0) * (item.unitPrice || 0));
  }, 0);

  const taxAmount = (subTotal * taxRate) / 100;
  const totalAmount = subTotal + taxAmount;
  
  useEffect(() => {
    const projectName = searchParams.get('projectName');
    const hoursWorked = searchParams.get('hoursWorked');
    const rate = searchParams.get('rate');
    const description = searchParams.get('description');

    if (projectName && hoursWorked && rate && description) {
      const matchedProject = projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
      if (matchedProject) {
        form.setValue('projectId', matchedProject.id);
        const client = clients.find(c => c.id === matchedProject.clientId);
        if (client) {
            form.setValue('clientId', client.id);
            form.setValue('billTo', `${client.name}\n${client.email}`);
        }
      }
      const quantity = parseFloat(hoursWorked);
      const unitPrice = parseFloat(rate);
      form.setValue('lineItems', [{
        description: description,
        quantity: quantity,
        unitPrice: unitPrice,
      }]);
    }
  }, [searchParams, form]);


  function onSubmit(values: InvoiceFormValues) {
    console.log(values);
    toast({
      title: 'Invoice Created',
      description: `Invoice ${values.invoiceNumber} for $${totalAmount.toFixed(2)} has been created.`,
    });
    setIsInvoiceCreated(true);
    // Here you would typically handle form submission, e.g., API call
  }

  const handleSaveAsPdf = () => {
    toast({
      title: 'Generating PDF...',
      description: 'Your invoice will be saved as a PDF.',
    });
    window.print();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Fill out the form to create a new invoice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issuedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
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
                 <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
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
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                           field.onChange(value);
                           const client = clients.find(c => c.id === value);
                           if (client) {
                             form.setValue('billTo', `${client.name}\n${client.email}`);
                           }
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client to auto-fill" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormDescription>Selecting a client will auto-fill the billing details.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="billTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill To</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Client's Name and Address"
                          className="min-h-[100px]"
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
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.filter(p => !form.watch('clientId') || p.clientId === form.watch('clientId')).map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-7"><FormLabel>Description</FormLabel></div>
                  <div className="md:col-span-2"><FormLabel>Hours/Qty</FormLabel></div>
                  <div className="md:col-span-2"><FormLabel>Rate/Price</FormLabel></div>
                  <div className="md:col-span-1"></div>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-7">
                           <FormLabel className="md:hidden">Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Item description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`lineItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-6 md:col-span-2">
                           <FormLabel className="md:hidden">Hours/Qty</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`lineItems.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="col-span-6 md:col-span-2">
                           <FormLabel className="md:hidden">Rate/Price</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="100.00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Line Item
                </Button>
              </div>
            </CardContent>
             <CardFooter className="flex flex-col items-end gap-4 bg-muted/50 p-6">
                <div className="grid gap-2 w-full max-w-sm">
                    <div className="flex justify-between">
                        <span>Sub-total</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subTotal)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>Tax</span>
                        <div className="flex items-center gap-2">
                             <FormField
                              control={form.control}
                              name="taxRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                     <Input type="number" {...field} className="w-20 h-8 text-right" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <span>%</span>
                        </div>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}</span>
                    </div>
                </div>
            </CardFooter>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Payment & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <FormField
                control={form.control}
                name="paymentUrl"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>Payment URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://paypal.me/your-username"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>e.g. PayPal.me, Stripe payment link, etc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes for the client..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>


          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/invoices">Cancel</Link>
            </Button>
            {isInvoiceCreated ? (
             <Button type="button" variant="secondary" onClick={handleSaveAsPdf}>
              Save as PDF
            </Button>
            ) : (
               <Button type="submit">Create Invoice</Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
