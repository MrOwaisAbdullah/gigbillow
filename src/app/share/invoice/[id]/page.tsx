'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toTitleCase, cn } from '@/lib/utils';
import { CreditCard, Loader2 } from 'lucide-react';
import type { Invoice, Client, Project, UserProfile } from '@/lib/types';
import { getPublicInvoiceData } from '@/lib/api/invoices';
import { Logo } from '@/components/logo';

const statusClasses: { [key in Invoice['status']]: string } = {
  paid: 'bg-success text-success-foreground',
  unpaid: 'bg-warning text-warning-foreground',
  overdue: 'bg-destructive text-destructive-foreground',
};

type PublicInvoiceData = {
  invoice: Invoice;
  user: { displayName: string; email: string; logoUrl?: string; };
  client: Client;
  project: Project;
};

export default function PublicInvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PublicInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!userId || !id) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const result = await getPublicInvoiceData(userId, id);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch public invoice", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [userId, id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const { invoice, user, client, project } = data;
  
  const subTotal = invoice.subTotal || 0;
  
  let discountAmount = invoice.discountValue || 0;
  if (invoice.discountType === 'percentage') {
    discountAmount = (subTotal * discountAmount) / 100;
  }

  const discountedSubTotal = subTotal - discountAmount;
  const taxRate = invoice.taxRate || 0;
  const taxAmount = (discountedSubTotal * taxRate) / 100;
  const totalAmount = invoice.amount;
  const expensesTotal = invoice.expensesTotal || 0;
  const servicesTotal = subTotal - expensesTotal;


  return (
    <div className="flex flex-col gap-8 pb-8 items-center">
        <div className="flex w-full max-w-4xl items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Logo className="h-7 w-7 text-primary" />
                <span>GigBillow</span>
            </div>
            <Badge className={cn(statusClasses[invoice.status], 'capitalize h-7')}>{invoice.status}</Badge>
        </div>


      <Card className="max-w-4xl w-full">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
                    <p className="text-muted-foreground"># {invoice.invoiceNumber}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    {user.logoUrl ? (
                        <img src={user.logoUrl} alt={`${user.displayName} Logo`} className="max-h-16 ml-auto mb-2"/>
                    ) : null}
                    <p className="font-semibold">{user?.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                    <p className="font-semibold text-muted-foreground mb-2">ISSUED TO</p>
                    <p className="font-bold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
                <div className="text-left sm:text-right space-y-2">
                    <div>
                        <p className="font-semibold text-muted-foreground">Issue Date</p>
                        <p>{format(new Date(invoice.issuedDate), 'PPP')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-muted-foreground">Due Date</p>
                        <p>{format(new Date(invoice.dueDate), 'PPP')}</p>
                    </div>
                </div>
            </div>

            {invoice.enhancedSummary && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground italic bg-muted/50 p-4 rounded-md whitespace-pre-wrap">
                {invoice.enhancedSummary}
              </div>
            )}
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80%]">Description</TableHead>
                    <TableHead className="text-right">Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{toTitleCase(item.description)}</TableCell>
                      <TableCell className="text-right">{project.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-4">
                    <Separator />
                     {expensesTotal > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Services</span>
                            <span>${servicesTotal.toFixed(2)}</span>
                        </div>
                    )}
                    {expensesTotal > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expenses</span>
                            <span>${expensesTotal.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subTotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>Discount</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {invoice.notes && (
                <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{toTitleCase(invoice.notes)}</p>
                </div>
            )}

        </CardContent>
        {invoice.paymentUrl && (
            <CardFooter className="flex justify-center items-center border-t pt-6">
                <Button asChild size="lg">
                    <a href={invoice.paymentUrl} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="mr-2" /> Pay Now (${totalAmount.toFixed(2)})
                    </a>
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
