'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, CreditCard, Share2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoiceById } from '@/lib/api/invoices';
import { getClientById } from '@/lib/api/clients';
import { getProjectById } from '@/lib/api/projects';
import { generateInvoicePdf } from '@/lib/pdf-utils';
import type { Invoice, Client, Project } from '@/lib/types';
import { useAuth } from '@/components/auth/auth-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toTitleCase } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusVariantMap: { [key in 'paid' | 'unpaid' | 'overdue']: 'default' | 'secondary' | 'destructive' } = {
  paid: 'default',
  unpaid: 'secondary',
  overdue: 'destructive',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!id) return;
    
    async function fetchInvoiceDetails() {
      try {
        const invoiceData = await getInvoiceById(id);
        if (!invoiceData) {
          router.push('/invoices');
          return;
        }
        setInvoice(invoiceData);

        const [clientData, projectData] = await Promise.all([
          getClientById(invoiceData.clientId),
          getProjectById(invoiceData.projectId),
        ]);

        setClient(clientData);
        setProject(projectData);
      } catch (error) {
        console.error("Failed to fetch invoice details", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoiceDetails();
  }, [id, router]);
  
  const handleDownloadPdf = () => {
    if (invoice && client && user) {
        generateInvoicePdf({
            invoice,
            client,
            user: { displayName: user.displayName, email: user.email },
        });
    }
  }

  const handleShare = () => {
    if (!user) return;
    const publicUrl = `${window.location.origin}/share/invoice/${id}?userId=${user.uid}`;
    navigator.clipboard.writeText(publicUrl);
    toast({
        title: 'Link Copied',
        description: 'Public link for this invoice has been copied to your clipboard.',
        action: (
            <Button variant="secondary" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">Open</a>
            </Button>
        )
    });
  };

  if (loading) {
    return <InvoiceDetailSkeleton />;
  }

  if (!invoice || !client || !project) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        <p className="text-lg text-muted-foreground">Invoice not found.</p>
        <Button variant="outline" asChild className="mt-4">
            <Link href="/invoices">Go Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  const subTotal = invoice.subTotal;
  const discount = invoice.discount || 0;
  const discountedSubTotal = subTotal - discount;
  const taxRate = invoice.taxRate || 0;
  const taxAmount = (discountedSubTotal * taxRate) / 100;
  const totalAmount = invoice.amount;
  const expensesTotal = invoice.expensesTotal || 0;
  const servicesTotal = subTotal - expensesTotal;


  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoiceNumber}</h1>
        <Badge variant={statusVariantMap[invoice.status]} className="capitalize ml-auto h-7">{invoice.status}</Badge>
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
                  {invoice.lineItems.map((item, index) => (
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
                     {discount > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>Discount</span>
                            <span>-${discount.toFixed(2)}</span>
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
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-6 gap-4">
          <div className='flex gap-2 w-full sm:w-auto'>
            {invoice.paymentUrl && (
                <Button asChild className="w-full sm:w-auto">
                    <a href={invoice.paymentUrl} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="mr-2" /> Pay Now
                    </a>
                </Button>
            )}
            <Button variant="secondary" onClick={handleShare} className="w-full sm:w-auto">
                <Share2 className="mr-2" /> Share
            </Button>
          </div>
          <Button variant="outline" onClick={handleDownloadPdf} className="w-full sm:w-auto">
            <Download className="mr-2" /> Download PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function InvoiceDetailSkeleton() {
    return (
        <div className="flex flex-col gap-8 pb-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-7 w-20 ml-auto rounded-full" />
            </div>

            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-5 w-24 mt-2" />
                        </div>
                        <div className="text-right">
                           <Skeleton className="h-6 w-28" />
                           <Skeleton className="h-5 w-40 mt-2" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <Separator />
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <Skeleton className="h-5 w-20 mb-2" />
                            <Skeleton className="h-6 w-32 mb-1" />
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="text-right space-y-4">
                            <div>
                                <Skeleton className="h-5 w-24 ml-auto mb-1" />
                                <Skeleton className="h-5 w-28 ml-auto" />
                            </div>
                            <div>
                                <Skeleton className="h-5 w-20 ml-auto mb-1" />
                                <Skeleton className="h-5 w-28 ml-auto" />
                            </div>
                        </div>
                    </div>
                    
                    <Skeleton className="h-20 w-full rounded-md" />

                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-4">
                            <Skeleton className="h-px w-full" />
                            <div className="flex justify-between"><Skeleton className="h-5 w-20" /> <Skeleton className="h-5 w-16" /></div>
                            <div className="flex justify-between"><Skeleton className="h-5 w-24" /> <Skeleton className="h-5 w-14" /></div>
                            <Skeleton className="h-px w-full" />
                             <div className="flex justify-between"><Skeleton className="h-7 w-28" /> <Skeleton className="h-7 w-20" /></div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end items-center border-t pt-6">
                    <Skeleton className="h-10 w-36" />
                </CardFooter>
            </Card>
        </div>
    )
}

    
