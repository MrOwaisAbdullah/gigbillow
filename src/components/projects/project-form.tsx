'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createProject, updateProject } from '@/lib/api/projects';
import type { Client, Project } from '@/lib/types';
import { useState, useEffect } from 'react';
import { SelectWithCreate } from '../select-with-create';
import { ClientForm } from '../clients/client-form';
import { canAfford } from '@/lib/api/tokens';
import { useToken } from '../token/token-provider';

const formSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters.'),
  clientId: z.string().min(1, 'Please select a client.'),
  rate: z.coerce.number().min(0, 'Rate must be a positive number.'),
  status: z.enum(['active', 'completed', 'on_hold']),
});

type ProjectFormProps = {
  clients: Client[];
  initialClientId?: string;
  onSuccess: (newProject: Project) => void;
  onCancel?: () => void;
  onClientCreated: () => void;
  project?: Project | null;
}

export function ProjectForm({ clients, initialClientId, onSuccess, onCancel, onClientCreated, project }: ProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openDialog } = useToken();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      clientId: initialClientId || '',
      rate: 0,
      status: 'active',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        clientId: project.clientId,
        rate: project.rate,
        status: project.status,
      });
    } else if (initialClientId) {
      form.setValue('clientId', initialClientId);
    }
  }, [project, initialClientId, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    if (!project) { // Only check for tokens on creation
        const hasEnoughTokens = await canAfford('project');
        if (!hasEnoughTokens && !initialClientId) { // Don't check if it's from invoice page
            openDialog();
            setIsSubmitting(false);
            return;
        }
    }

    try {
      if (project) {
        const updatedProject = { ...project, ...values };
        await updateProject(project.id, values);
        toast({ title: 'Project Updated' });
        onSuccess(updatedProject);
      } else {
        const newProject = await createProject(values);
        // The parent component will handle the success message and token charge for new projects
        onSuccess(newProject);
      }
    } catch (error) {
      // API handles error toast
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Website Redesign" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                 <SelectWithCreate
                    value={field.value}
                    onValueChange={field.onChange}
                    items={clients.map(c => ({ value: c.id, label: c.name }))}
                    placeholder="Select a client"
                    dialogTitle="Create New Client"
                    dialogDescription="Add a new client to your records."
                    onCreated={onClientCreated}
                    disabled={!!initialClientId || !!project}
                  >
                      <ClientForm onSuccess={() => {}} onCancel={() => {}} />
                  </SelectWithCreate>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 75" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? 'Save Changes' : 'Create Project (-1 Token)'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
