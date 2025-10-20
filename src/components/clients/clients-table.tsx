
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { getClients } from "@/lib/api/clients"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useCallback, useMemo } from "react"
import type { Client } from "@/lib/types"
import { Skeleton } from "../ui/skeleton"
import type { DocumentSnapshot } from "firebase/firestore"
import { PaginationControls } from "../pagination-controls"
import { ClientDialog } from "./client-dialog"

type ClientsTableProps = {
    searchTerm: string;
}

export function ClientsTable({ searchTerm }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchClients = useCallback(async (page: 'first' | 'next' | 'prev') => {
    setLoading(true);
    
    const isSearching = searchTerm.trim() !== '';
    const pageSize = isSearching ? 100 : 10;
    
    let cursor: DocumentSnapshot | null = null;
    let pageToGo = 1;

    if (page === 'next') {
        cursor = pageCursors[currentPage] || null;
        pageToGo = currentPage + 1;
    } else if (page === 'prev') {
        cursor = pageCursors[currentPage - 2] || null;
        pageToGo = currentPage - 1;
    }

    const { clients: clientsData, nextCursor, hasNextPage: newHasNextPage } = await getClients('next', cursor, pageSize);
    setClients(clientsData);
    setHasNextPage(newHasNextPage);

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
        setCurrentPage(1);
        setPageCursors([null]);
    }

    setLoading(false);
  }, [currentPage, pageCursors, searchTerm]);

  useEffect(() => {
    fetchClients('first');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const lowercasedFilter = searchTerm.toLowerCase();
    return clients.filter(client => {
      return (
        client.name.toLowerCase().includes(lowercasedFilter) ||
        client.email.toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [searchTerm, clients]);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedClient(null);
    fetchClients('first');
  };

  if (loading && clients.length === 0) {
    return (
        <div className="rounded-lg border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell>
                                <div className="flex justify-end">
                                  <Skeleton className="h-8 w-8" />
                                </div>
                            </TableCell>
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
            <TableHead>Client</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
             [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                  <TableCell>
                      <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-5 w-32" />
                      </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell>
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8" />
                      </div>
                  </TableCell>
              </TableRow>
          ))
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={client.avatarUrl} alt={client.name} data-ai-hint="person face" />
                      <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{client.name}</div>
                  </div>
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => handleEdit(client)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleEdit(client)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
             <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                    No clients found.
                </TableCell>
             </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
     {!searchTerm && (
        <PaginationControls
            onNext={() => fetchClients('next')}
            onPrev={() => fetchClients('prev')}
            hasNextPage={hasNextPage}
            hasPrevPage={currentPage > 1}
            currentPage={currentPage}
        />
     )}
     <ClientDialog
      client={selectedClient}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSuccess={handleSuccess}
      onClose={() => setSelectedClient(null)}
    />
    </>
  )
}
