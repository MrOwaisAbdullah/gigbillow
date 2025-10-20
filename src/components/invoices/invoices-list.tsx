
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
import { useEffect, useState, useCallback, useMemo } from "react"
import type { Invoice, Client, Project } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "../ui/skeleton"
import Link from "next/link";
import type { DocumentSnapshot } from "firebase/firestore"
import { PaginationControls } from "../pagination-controls"
import { useRouter } from 'next/navigation';

const statusVariantMap: { [key in 'paid' | 'unpaid' | 'overdue']: 'default' | 'secondary' | 'destructive' } = {
  paid: 'default',
  unpaid: 'secondary',
  overdue: 'destructive',
}

type InvoicesListProps = {
    searchTerm: string;
}

export function InvoicesList({ searchTerm }: InvoicesListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [data, setData] = useState<{ [key: string]: Client | Project }>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const fetchInvoices = useCallback(async (page: 'first' | 'next' | 'prev') => {
    setLoading(true);
    let cursor: DocumentSnapshot | null = null;
    
    const isSearching = searchTerm.trim() !== '';
    const pageSize = isSearching ? 100 : 10;
    let pageToGo = 1;

    if (page === 'next') {
        cursor = pageCursors[currentPage] || null;
        pageToGo = currentPage + 1;
    } else if (page === 'prev') {
        cursor = pageCursors[currentPage - 2] || null;
        pageToGo = currentPage - 1;
    }

    const { invoices: invoicesData, nextCursor, hasNextPage: newHasNextPage } = await getInvoices('next', cursor, pageSize);
    setInvoices(invoicesData);
    setHasNextPage(newHasNextPage);

    if (invoicesData.length > 0) {
        const clientIds = [...new Set(invoicesData.map(inv => inv.clientId))].filter(id => !data[id]);
        const projectIds = [...new Set(invoicesData.map(inv => inv.projectId))].filter(id => !data[id]);
        
        const fetchedData: { [key: string]: Client | Project } = {};

        if (clientIds.length > 0) {
            const clientPromises = clientIds.map(id => getClientById(id));
            const clients = await Promise.all(clientPromises);
            clients.forEach(client => { if(client) fetchedData[client.id] = client; });
        }
        if (projectIds.length > 0) {
            const projectPromises = projectIds.map(id => getProjectById(id));
            const projects = await Promise.all(projectPromises);
            projects.forEach(project => { if(project) fetchedData[project.id] = project; });
        }

        if (Object.keys(fetchedData).length > 0) {
            setData(prev => ({...prev, ...fetchedData}));
        }
    }

    if (!isSearching) {
       if (page === 'next') {
            setPageCursors(prev => {
                const newCursors = [...prev];
                newCursors[pageToGo] = nextCursor;
                return newCursors;
            });
            setCurrentPage(pageToGo);
        } else if (page === 'prev') {
            setCurrentPage(pageToGo);
        } else { // first
            setPageCursors([null, nextCursor]);
            setCurrentPage(1);
        }
    } else {
        setHasNextPage(false);
        setCurrentPage(1);
        setPageCursors([null]);
    }
    setLoading(false);
  }, [pageCursors, currentPage, data, searchTerm]);

  useEffect(() => {
    fetchInvoices('first');
    // We only want to re-run this effect when the search term changes, not the whole fetchInvoices function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    const lowercasedFilter = searchTerm.toLowerCase();
    return invoices.filter(invoice => {
      const client = data[invoice.clientId] as Client;
      const project = data[invoice.projectId] as Project;
      return (
        invoice.invoiceNumber.toLowerCase().includes(lowercasedFilter) ||
        client?.name.toLowerCase().includes(lowercasedFilter) ||
        project?.name.toLowerCase().includes(lowercasedFilter) ||
        String(invoice.amount).includes(lowercasedFilter)
      );
    });
  }, [searchTerm, invoices, data]);

  const handleDelete = async (id: string) => {
    const invoiceToDelete = invoices.find(inv => inv.id === id);
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice(id);
      toast({
        title: 'Invoice Deleted',
        description: `Invoice "${invoiceToDelete.invoiceNumber}" has been deleted.`,
      });
      fetchInvoices('first');
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

  if (loading && invoices.length === 0) {
     return (
        <div className="rounded-lg border overflow-x-auto">
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
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
    <>
    <div className="rounded-lg border overflow-x-auto">
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
          {loading ? (
             [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
            ))
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => {
              const client = data[invoice.clientId] as Client;
              const project = data[invoice.projectId] as Project;
              return (
                <TableRow key={invoice.id} className="cursor-pointer" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    <TableCell className="font-medium">
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline text-primary" onClick={(e) => e.stopPropagation()}>
                        {invoice.invoiceNumber}
                        </Link>
                    </TableCell>
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
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/${invoice.id}`}>View Details</Link>
                        </DropdownMenuItem>
                         {invoice.status !== 'paid' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(invoice.id);}}>Mark as Paid</DropdownMenuItem>}
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(invoice.id);}}>Delete</DropdownMenuItem>
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
    {!searchTerm && (
        <PaginationControls
            onNext={() => fetchInvoices('next')}
            onPrev={() => fetchInvoices('prev')}
            hasNextPage={hasNextPage}
            hasPrevPage={currentPage > 1}
            currentPage={currentPage}
        />
    )}
    </>
  )
}
