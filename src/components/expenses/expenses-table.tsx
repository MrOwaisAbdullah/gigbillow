
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { getExpenses } from "@/lib/api/expenses"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useCallback, useMemo } from "react"
import type { Expense, Project } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "../ui/skeleton"
import type { DocumentSnapshot } from "firebase/firestore"
import { PaginationControls } from "../pagination-controls"
import { ExpenseDialog } from "./expense-dialog"
import { Badge } from "../ui/badge";

type ExpensesTableProps = {
  allProjects: Project[];
  searchTerm: string;
}

export function ExpensesTable({ allProjects, searchTerm }: ExpensesTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchExpenses = useCallback(async (page: 'first' | 'next' | 'prev') => {
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
    
    const { expenses: expensesData, nextCursor, hasNextPage: newHasNextPage } = await getExpenses('next', cursor, pageSize);
    setExpenses(expensesData);
    setHasNextPage(newHasNextPage);
    
    if(!isSearching) {
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
    }
    setLoading(false);
  }, [searchTerm, currentPage, pageCursors]);

  useEffect(() => {
    fetchExpenses('first');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);


  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return expenses;
    const lowercasedFilter = searchTerm.toLowerCase();
    return expenses.filter(expense => {
      const project = allProjects.find(p => p.id === expense.projectId);
      return (
        expense.description.toLowerCase().includes(lowercasedFilter) ||
        expense.category.toLowerCase().includes(lowercasedFilter) ||
        String(expense.amount).includes(lowercasedFilter) ||
        (project && project.name.toLowerCase().includes(lowercasedFilter))
      );
    });
  }, [searchTerm, expenses, allProjects]);

  const handleSuccess = () => {
    fetchExpenses('first');
    setIsDialogOpen(false);
    setSelectedExpense(null);
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };
  
  if (loading && expenses.length === 0) {
    return (
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8" /></div></TableCell>
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
              <TableHead>Description</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8" /></div></TableCell>
                </TableRow>
              ))
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => {
                const project = allProjects.find(p => p.id === expense.projectId);
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate" title={expense.description}>
                        {expense.description}
                      </div>
                    </TableCell>
                    <TableCell>{project?.name || <span className="text-muted-foreground">N/A</span>}</TableCell>
                    <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                    <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                    <TableCell>${(expense.amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       {expense.invoiceId ? (
                         <Badge>Invoiced</Badge>
                       ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(expense)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(expense)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                       )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No expenses found. Get started by adding one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       {!searchTerm && (
         <PaginationControls
            onNext={() => fetchExpenses('next')}
            onPrev={() => fetchExpenses('prev')}
            hasNextPage={hasNextPage}
            hasPrevPage={currentPage > 1}
            currentPage={currentPage}
          />
       )}
      <ExpenseDialog
        projects={allProjects}
        expense={selectedExpense || undefined}
        onSuccess={handleSuccess}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={() => setSelectedExpense(null)}
      />
    </>
  )
}
