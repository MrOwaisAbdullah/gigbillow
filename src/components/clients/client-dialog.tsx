
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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (client: Client) => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    setIsDeleting(true);
    try {
      await deleteClient(client.id);
      toast({ title: 'Client Deleted' });
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
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {client ? 'Update the details of your client.' : 'Add a new client to your records.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ClientForm client={client} onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
        </div>
        {client && (
          <DialogFooter className="justify-start border-t pt-4">
            <Button variant="destructive" onClick={() => setIsAlertOpen(true)}>
              Delete Client
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
                      This will permanently delete the client and all associated projects and invoices. This action cannot be undone.
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
