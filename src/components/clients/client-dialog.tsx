
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
import { ClientForm } from './client-form';
import type { Client } from '@/lib/types';
import { deleteClient } from '@/lib/api/clients';
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

type ClientDialogProps = {
  client?: Client | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
};

export function ClientDialog({ client, trigger, onSuccess, open, onOpenChange, onClose }: ClientDialogProps) {
  
  const handleSuccess = (client: Client) => {
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
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {client ? 'Update the details of your client.' : 'Add a new client to your records.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ClientForm client={client} onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
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
