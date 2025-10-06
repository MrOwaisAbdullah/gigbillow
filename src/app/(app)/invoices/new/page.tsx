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
import { ArrowLeft, CalendarIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { getClients } from '@/lib/api/clients';
import { getProjects } from '@/lib/api/projects';
import { getTimeEntriesByProject } from '@/lib/api/time-entries';
import { getUninvoicedExpensesByProject, markExpensesAsInvoiced } from '@/lib/api/expenses';
import { createInvoice, updateInvoice } from '@/lib/api/invoices';
import { enhanceInvoice } from '@/ai/flows/enhance-invoice';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Client, Project, Expense } from '@/lib/types';
import { SelectWithCreate } from '@/components/select-with-create';
import { ClientForm } from '@/components/clients/client-form';
import { ProjectForm } from '@/components/projects/project-form';
import { useAuth } from '@/components/auth/auth-provider';
import { canAfford, chargeFor } from '@/lib/api/tokens';
import { useToken } from '@/components/token/token-provider';
import { generateInvoicePdf } from '@/lib/pdf-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';


const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
});

const formSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, 'Invoice number is required.'),
  clientId: z.string().min(1, "Client is required."),
  projectId: z.string().min(1, "Project is required."),
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
  subTotal: z.coerce.number().min(0).default(0),
  selectedExpenseIds: z.array(z.string()).optional(),
});

export type InvoiceFormValues = z.infer<typeof formSchema>;

export default function NewInvoicePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { openDialog } = useToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [uninvoicedExpenses, setUninvoicedExpenses] = useState<Expense[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      clientId: '',
      projectId: '',
      issuedDate: new Date(),
      dueDate: addDays(new Date(), 30),
      lineItems: [{ description: '' }],
      taxRate: 0,
      paymentUrl: '',
      notes: '',
      subTotal: 0,
      selectedExpenseIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });
  
  const taxRate = form.watch('taxRate');
  const projectId = form.watch('projectId');
  const clientId = form.watch('clientId');
  const subTotal = form.watch('subTotal');
  const selectedExpenseIds = form.watch('selectedExpenseIds') || [];
  
  const expensesTotal = useMemo(() => {
    return uninvoicedExpenses
      .filter(exp => selectedExpenseIds.includes(exp.id))
      .reduce((acc, exp) => acc + exp.amount, 0);
  }, [selectedExpenseIds, uninvoicedExpenses]);

  const grandSubTotal = subTotal + expensesTotal;
  const taxAmount = (grandSubTotal * taxRate) / 100;
  const totalAmount = grandSubTotal + taxAmount;
  
  const includesExpenses = selectedExpenseIds.length > 0;
  const submitButtonText = useMemo(() => {
    const pdfCost = 1;
    const expenseCost = includesExpenses ? 1 : 0;
    const totalCost = pdfCost + expenseCost;
    if (totalCost > 1) {
        return `Create & Download PDF (-${totalCost} Tokens)`;
    }
    return `Create & Download PDF (-${pdfCost} Token)`;
  }, [includesExpenses]);

  const fetchClients = useCallback(async () => {
    const { clients: clientsData } = await getClients('first', null, 9999);
    setClients(clientsData);
    return clientsData;
  }, []);

  const fetchProjects = useCallback(async () => {
    const { projects: projectsData } = await getProjects('first', null, 9999);
    setAllProjects(projectsData);
    return projectsData;
  }, []);


  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, [fetchClients, fetchProjects]);
  
  useEffect(() => {
    if (clientId) {
      const clientProjects = allProjects.filter(p => p.clientId === clientId);
      setProjects(clientProjects);
      form.setValue('projectId', ''); // Reset project when client changes
      setUninvoicedExpenses([]);
      form.setValue('selectedExpenseIds', []);
    } else {
      setProjects([]);
    }
  }, [clientId, allProjects, form]);

  useEffect(() => {
    const projectName = searchParams.get('projectName');
    const hoursWorked = searchParams.get('hoursWorked');
    const rate = searchParams.get('rate');
    const description = searchParams.get('description');

    if (projectName && hoursWorked && rate && description && allProjects.length > 0) {
      const matchedProject = allProjects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
      if (matchedProject) {
        form.setValue('projectId', matchedProject.id);
        const client = clients.find(c => c.id === matchedProject.clientId);
        if (client) {
            form.setValue('clientId', client.id);
        }
      }
      const quantity = parseFloat(hoursWorked);
      const unitPrice = parseFloat(rate);
      form.setValue('lineItems', [{
        description: description,
      }]);
      form.setValue('subTotal', quantity * unitPrice);
    }
  }, [searchParams, form, allProjects, clients]);
  
  useEffect(() => {
    async function fetchProjectData() {
        if (!projectId) {
            setUninvoicedExpenses([]);
            form.setValue('selectedExpenseIds', []);
            return;
        }
        
        // Auto-fill time entries
        const project = allProjects.find(p => p.id === projectId);
        if (project && project.rate) {
          const projectTimeEntries = await getTimeEntriesByProject(projectId);
          const totalHours = projectTimeEntries.reduce((acc, entry) => acc + entry.hours, 0);
          if (totalHours > 0) {
            form.setValue('lineItems', [{
              description: `Work performed on project: ${project.name}`,
            }]);
            form.setValue('subTotal', parseFloat((totalHours * project.rate).toFixed(2)));
          }
        }
        
        // Fetch uninvoiced expenses
        const expenses = await getUninvoicedExpensesByProject(projectId);
        setUninvoicedExpenses(expenses);
        form.setValue('selectedExpenseIds', []);
    }
    fetchProjectData();
  }, [projectId, form, allProjects]);

  const handleNewClient = async () => {
    const updatedClients = await fetchClients();
    const newClient = updatedClients[updatedClients.length - 1];
    if (newClient) {
      form.setValue('clientId', newClient.id);
    }
  };

  const handleNewProject = async () => {
    const hasEnoughTokens = await canAfford('project');
    if (!hasEnoughTokens) {
      openDialog();
      return;
    }

    const updatedProjects = await fetchProjects();
    const filteredProjects = updatedProjects.filter(p => p.clientId === clientId);
    setProjects(filteredProjects);
    const newProject = filteredProjects[filteredProjects.length - 1];
    if (newProject) {
      await chargeFor('project');
      form.setValue('projectId', newProject.id);
    }
  };

  async function onSubmit(values: InvoiceFormValues) {
    setIsSubmitting(true);
    
    const cost = 1 + (includesExpenses ? 1 : 0);
    const hasEnoughTokens = await canAfford('invoice_pdf', cost);
    if (!hasEnoughTokens) {
        openDialog();
        setIsSubmitting(false);
        return;
    }

    try {
        let finalLineItems = [...values.lineItems];
        if (includesExpenses) {
            finalLineItems.push({ description: 'Reimbursable Expenses' });
        }

        const invoiceToCreate = {
            ...values,
            lineItems: finalLineItems,
            amount: totalAmount,
            status: 'unpaid' as const,
            subTotal: grandSubTotal,
            expensesTotal: expensesTotal,
        };
        
        delete (invoiceToCreate as any).selectedExpenseIds;


        const newInvoice = await createInvoice(invoiceToCreate);
        
        if (includesExpenses && newInvoice.id) {
            await markExpensesAsInvoiced(selectedExpenseIds, newInvoice.id);
        }

        const client = clients.find(c => c.id === values.clientId);

        if (!client || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find client or user information.' });
            setIsSubmitting(false);
            return;
        }
        
        toast({
            title: 'Enhancing Summary...',
            description: 'The AI is writing a professional summary for your invoice.',
        });

        const enhancementResult = await enhanceInvoice({
            clientName: client.name,
            userName: user.displayName || 'Freelancer',
            lineItems: finalLineItems,
            totalAmount: Number(totalAmount),
            dueDate: format(values.dueDate, 'PPP')
        });

        const updatedInvoiceData = { ...newInvoice, enhancedSummary: enhancementResult.summary };
        await updateInvoice(newInvoice.id, { enhancedSummary: enhancementResult.summary });

        generateInvoicePdf({
          invoice: updatedInvoiceData,
          client: client,
          user: { displayName: user.displayName, email: user.email },
        });
        
        await chargeFor('invoice_pdf', cost);

        toast({
            title: 'Invoice Created & Downloaded',
            description: 'Your invoice has been created and the PDF has started downloading.',
        });
        router.push('/invoices');

    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: 'Failed to create the invoice. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
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
                      <FormLabel>Client</FormLabel>
                      <SelectWithCreate
                        value={field.value}
                        onValueChange={field.onChange}
                        items={clients.map(c => ({ value: c.id, label: c.name }))}
                        placeholder="Select a client"
                        dialogTitle="Create New Client"
                        dialogDescription="Add a new client to your records."
                        onCreated={handleNewClient}
                      >
                         <ClientForm onSuccess={() => {}} />
                      </SelectWithCreate>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <SelectWithCreate
                        value={field.value}
                        onValueChange={field.onChange}
                        items={projects.map(p => ({ value: p.id, label: p.name }))}
                        placeholder="Select a project"
                        dialogTitle="Create New Project"
                        dialogDescription="Add a new project for the selected client. This will use 1 token."
                        onCreated={handleNewProject}
                        disabled={!clientId}
                      >
                         <ProjectForm clients={clients} initialClientId={clientId} onSuccess={() => {}} onClientCreated={() => {}} />
                      </SelectWithCreate>
                      <FormDescription>Selecting a project can auto-fill invoice details.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-11"><FormLabel>Description</FormLabel></div>
                  <div className="md:col-span-1"></div>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="col-span-11">
                           <FormLabel className="md:hidden">Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Item description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-1 flex items-end">
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
                  onClick={() => append({ description: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Line Item
                </Button>
              </div>
            </CardContent>
             <CardFooter className="flex flex-col items-end gap-4 bg-muted/50 p-6">
                <div className="grid gap-2 w-full max-w-sm">
                    <FormField
                      control={form.control}
                      name="subTotal"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center">
                            <FormLabel>Services Sub-total</FormLabel>
                            <FormControl>
                               <div className="flex items-center gap-2">
                                 <span>$</span>
                                 <Input type="number" {...field} className="w-32 h-8 text-right" />
                               </div>
                            </FormControl>
                        </FormItem>
                      )}
                    />
                     <div className="flex justify-between items-center">
                        <FormLabel>Expenses</FormLabel>
                        <span className="text-sm font-medium">${expensesTotal.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                        <span>Sub-total</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(grandSubTotal)}</span>
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
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}</span>
                    </div>
                </div>
            </CardFooter>
          </Card>
          
          {uninvoicedExpenses.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Uninvoiced Expenses</CardTitle>
                    <CardDescription>Select expenses to add to this invoice. This will cost 1 token.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="selectedExpenseIds"
                        render={() => (
                            <FormItem className="space-y-3">
                                {uninvoicedExpenses.map(expense => (
                                    <FormField
                                        key={expense.id}
                                        control={form.control}
                                        name="selectedExpenseIds"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={expense.id}
                                                    className="flex flex-row items-center space-x-3 space-y-0 p-3 bg-muted/50 rounded-md"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(expense.id)}
                                                            onCheckedChange={checked => {
                                                                return checked
                                                                ? field.onChange([...(field.value || []), expense.id])
                                                                : field.onChange(field.value?.filter(value => value !== expense.id))
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal flex-grow flex justify-between">
                                                        <span>{expense.description} ({format(expense.date, "MMM d")})</span>
                                                        <span>${expense.amount.toFixed(2)}</span>
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
          )}


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
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    