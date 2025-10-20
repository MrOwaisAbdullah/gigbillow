
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProjectForm } from './project-form';
import type { Project, Client } from '@/lib/types';
import { deleteProject } from '@/lib/api/projects';
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

type ProjectDialogProps = {
  clients: Client[];
  project?: Project | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  onClientCreated: () => void;
};

export function ProjectDialog({ clients, project, trigger, onSuccess, open, onOpenChange, onClose, onClientCreated }: ProjectDialogProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (project: Project) => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      toast({ title: 'Project Deleted' });
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update the details of your project.' : 'Add a new project to your records.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ProjectForm project={project} clients={clients} onSuccess={handleSuccess} onClientCreated={onClientCreated} onCancel={() => onOpenChange(false)} />
        </div>
        {project && (
          <DialogFooter className="justify-start border-t pt-4">
            <Button variant="destructive" onClick={() => setIsAlertOpen(true)}>
              Delete Project
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
                      This will permanently delete the project and all its associated time entries and invoices. This action cannot be undone.
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
