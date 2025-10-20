
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExpenseForm } from './expense-form';
import type { Expense, Project } from '@/lib/types';

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

  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
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
      </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {dialogContent}
    </Dialog>
  );
}
