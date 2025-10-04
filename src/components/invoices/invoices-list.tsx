'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { getInvoices, deleteInvoice, updateInvoice } from "@/lib/api/invoices"
import { getClientById } from "@/lib/api/clients"
import { getProjectById } from "@/lib/api/projects"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import type { Invoice, Client, Project } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "../ui/skeleton"
import Link from "next/link";

const statusVariantMap: { [key in 'paid' | 'unpaid' | 'overdue']: 'default' | 'secondary' | 'destructive' } = {
  paid: 'default',
  unpaid: 'secondary',
  overdue: 'destructive',
}

export function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [data, setData] = useState<{ [key: string]: Client | Project }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
        const invoicesData = await getInvoices();
        setInvoices(invoicesData);
        if (invoicesData.length > 0) {
            const clientIds = [...new Set(invoicesData.map(inv => inv.clientId))];
            const projectIds = [...new Set(invoicesData.map(inv => inv.projectId))];
            
            const fetchedData: { [key: string]: Client | Project } = {};

            const clientPromises = clientIds.map(id => getClientById(id));
            const projectPromises = projectIds.map(id => getProjectById(id));

            const [clients, projects] = await Promise.all([
                Promise.all(clientPromises),
                Promise.all(projectPromises),
            ]);
            
            clients.forEach(client => { if(client) fetchedData[client.id] = client; });
            projects.forEach(project => { if(project) fetchedData[project.id] = project; });

            setData(fetchedData);
        }
        setLoading(false);
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const invoiceToDelete = invoices.find(inv => inv.id === id);
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
      toast({
        title: 'Invoice Deleted',
        description: `Invoice "${invoiceToDelete.invoiceNumber}" has been deleted.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Failed to delete invoice',
        description: 'Please try again later.',
      });
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updateInvoice(id, { status: 'paid' });
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv));
      toast({
        title: 'Invoice Updated',
        description: `Invoice marked as paid.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Failed to update invoice',
        description: 'Please try again later.',
      });
    }
  };

  if (loading) {
     return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
     )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => {
              const client = data[invoice.clientId] as Client;
              const project = data[invoice.projectId] as Project;
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{client?.name}</TableCell>
                  <TableCell>{project?.name}</TableCell>
                  <TableCell>${(invoice.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(invoice.issuedDate), 'PPP')}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[invoice.status]} className="capitalize">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                         {invoice.status !== 'paid' && <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>Mark as Paid</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => handleDelete(invoice.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                    No invoices found.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
