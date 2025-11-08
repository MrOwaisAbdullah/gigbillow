
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
import { Loader2, MoreHorizontal } from "lucide-react"
import { getExpenses, deleteExpense } from "@/lib/api/expenses"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useCallback, useMemo } from "react"
import type { Expense, Project } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "../ui/skeleton"
import type { DocumentSnapshot } from "firebase/firestore"
import { PaginationControls } from "../pagination-controls"
import { ExpenseDialog } from "./expense-dialog"
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

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
  
  const handleDeleteConfirm = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    setIsDeleting(true);
    try {
      await deleteExpense(selectedExpense.id);
      toast({ title: 'Expense Deleted' });
      fetchExpenses('first');
    } catch (error) {
      // API handles toast
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setSelectedExpense(null);
    }
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
                                <DropdownMenuItem onSelect={() => handleEdit(expense)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteConfirm(expense)} className="text-destructive">Delete</DropdownMenuItem>
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
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete the expense. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedExpense(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
