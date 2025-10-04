'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getClients } from '@/lib/api/clients';
import type { Client } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ProjectForm } from '@/components/projects/project-form';
import { useToken } from '@/components/token/token-provider';
import { canAfford, chargeFor } from '@/lib/api/tokens';

export default function NewProjectPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const { openDialog } = useToken();

  const fetchClients = useCallback(async () => {
    const clientsData = await getClients();
    setClients(clientsData);
    return clientsData;
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSuccess = async (newProject: { id: string; name: string }) => {
    const hasEnoughTokens = await canAfford('project');
    if (!hasEnoughTokens) {
        openDialog();
        // Note: Project is created in DB, but we stop navigation.
        // A more robust solution might revert the creation or prevent it in the first place.
        return;
    }

    await chargeFor('project');
    toast({
      title: 'Project Created',
      description: `Project "${newProject.name}" has been successfully created.`,
    });
    router.push('/projects');
  };

  const handleClientCreated = async () => {
    await fetchClients();
    // No need to set the value here as ProjectForm's SelectWithCreate doesn't have access to the form from here.
    // The user will see the new client in the list. A more advanced implementation could automatically select it.
  };


  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Enter the details for the new project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm 
            clients={clients} 
            onSuccess={handleSuccess} 
            onCancel={() => router.push('/projects')}
            onClientCreated={handleClientCreated}
          />
        </CardContent>
      </Card>
    </div>
  );
}
