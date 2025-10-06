
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
import { getExpenses, deleteExpense } from "@/lib/api/expenses"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useCallback } from "react"
import type { Expense, Project } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "../ui/skeleton"
import type { DocumentSnapshot } from "firebase/firestore"
import { PaginationControls } from "../pagination-controls"
import { ExpenseDialog } from "./expense-dialog"
import { Badge } from "../ui/badge";

type ExpensesTableProps = {
  allProjects: Project[];
}

export function ExpensesTable({ allProjects }: ExpensesTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();

  const fetchExpensesCallback = useCallback(async (page: 'first' | 'next' | 'prev') => {
    setLoading(true);
    let cursor: DocumentSnapshot | null = null;
    
    if (page === 'next') {
        cursor = cursors[currentPage] || null;
    } else if (page === 'prev') {
        cursor = cursors[currentPage - 2] || null;
    }

    const { expenses: expensesData, next } = await getExpenses(page, cursor, 10);
    setExpenses(expensesData);

    if (page === 'next') {
        if (!cursors.includes(next)) {
            setCursors(prev => [...prev, next]);
        }
        setCurrentPage(prevPage => prevPage + 1);
    } else if (page === 'prev') {
        setCurrentPage(prevPage => Math.max(1, prevPage - 1));
    } else { // first
        setCursors([null, next]);
        setCurrentPage(1);
    }
    setHasNextPage(!!next);
    setLoading(false);
  }, [currentPage, cursors]);

  useEffect(() => {
    fetchExpensesCallback('first');
  }, [fetchExpensesCallback]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast({
        title: 'Expense Deleted',
        description: `The expense has been deleted.`,
      });
      fetchExpensesCallback('first');
    } catch (error) {
      // API handles error toast
    }
  };

  const handleUpdate = () => {
    fetchExpensesCallback('first');
  }
  
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
            ) : expenses.length > 0 ? (
              expenses.map((expense) => {
                const project = allProjects.find(p => p.id === expense.projectId);
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{project?.name || <span className="text-muted-foreground">N/A</span>}</TableCell>
                    <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                    <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                    <TableCell>${(expense.amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       {expense.invoiceId ? (
                         <Badge>Invoiced</Badge>
                       ) : (
                        <ExpenseDialog
                          projects={allProjects}
                          expense={expense}
                          onSuccess={handleUpdate}
                          trigger={
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          }
                        />
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
      <PaginationControls
        onNext={() => fetchExpensesCallback('next')}
        onPrev={() => fetchExpensesCallback('prev')}
        hasNextPage={hasNextPage}
        hasPrevPage={currentPage > 1}
        currentPage={currentPage}
      />
    </>
  )
}
