
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from './expense-form';
import type { Expense, Project } from '@/lib/types';
import { deleteExpense } from '@/lib/api/expenses';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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

type ExpenseDialogProps = {
  projects: Project[];
  expense?: Expense;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
};

export function ExpenseDialog({ projects, expense, trigger, onSuccess, open, onOpenChange, onClose }: ExpenseDialogProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      toast({ title: 'Expense Deleted' });
      setIsAlertOpen(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      // API handles toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen && onClose) {
      onClose();
    }
  }

  const dialogContent = (
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {expense ? 'Update the details of your expense.' : 'Track a new expense to keep your records up to date.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ExpenseForm projects={projects} expense={expense} onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
        </div>
        {expense && (
          <DialogFooter className="justify-start border-t pt-4">
            <Button variant="destructive" onClick={() => setIsAlertOpen(true)}>
              Delete Expense
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        {dialogContent}
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete the expense. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
