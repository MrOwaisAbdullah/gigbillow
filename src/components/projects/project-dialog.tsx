
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ProjectForm } from './project-form';
import type { Project, Client } from '@/lib/types';


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
  
  const handleSuccess = (project: Project) => {
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
      </DialogContent>
  );

  return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        {dialogContent}
      </Dialog>
  );
}
