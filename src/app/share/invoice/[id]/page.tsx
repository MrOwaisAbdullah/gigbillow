
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
import { toTitleCase } from '@/lib/utils';
import { CreditCard, Package2, Loader2 } from 'lucide-react';
import type { Invoice, Client, Project } from '@/lib/types';
import { getPublicInvoiceData } from '@/lib/api/invoices';

const statusVariantMap: { [key in 'paid' | 'unpaid' | 'overdue']: 'default' | 'secondary' | 'destructive' } = {
  paid: 'default',
  unpaid: 'secondary',
  overdue: 'destructive',
};

type PublicInvoiceData = {
  invoice: Invoice;
  user: { displayName: string; email: string };
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
  
  const subTotal = Number(invoice.subTotal) || 0;
  const taxRate = Number(invoice.taxRate) || 0;
  const amount = Number(invoice.amount) || 0;
  const taxAmount = (subTotal * taxRate) / 100;

  return (
    <div className="flex flex-col gap-8 pb-8 items-center">
        <div className="flex w-full max-w-4xl items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Package2 className="h-6 w-6" />
                <span>GigBillow</span>
            </div>
            <Badge variant={statusVariantMap[invoice.status]} className="capitalize h-7">{invoice.status}</Badge>
        </div>


      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
                    <p className="text-muted-foreground"># {invoice.invoiceNumber}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
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
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subTotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span>${amount.toFixed(2)}</span>
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
                        <CreditCard className="mr-2" /> Pay Now (${amount.toFixed(2)})
                    </a>
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
