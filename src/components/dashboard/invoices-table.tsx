
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
import { getInvoices } from "@/lib/api/invoices"
import { getClientById } from "@/lib/api/clients"
import { getProjectById } from "@/lib/api/projects"
import { useEffect, useState } from "react"
import type { Invoice, Client, Project } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "../ui/skeleton"

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [data, setData] = useState<{ [key: string]: Client | Project }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const invoicesResult = await getInvoices('first', null, 5);
      const outstandingInvoices = invoicesResult.invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue');
      setInvoices(outstandingInvoices);

      if (outstandingInvoices.length > 0) {
        const clientIds = [...new Set(outstandingInvoices.map(inv => inv.clientId))];
        const projectIds = [...new Set(outstandingInvoices.map(inv => inv.projectId))];
        
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

  if (loading) {
     return (
        <div className="rounded-lg border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
     )
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
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
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), 'PPP')}</TableCell>
                  <TableCell>
                     <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'} className="capitalize">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No outstanding invoices.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
