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
import { useState, useEffect } from 'react';
import { ProjectForm } from '@/components/projects/project-form';

export default function NewProjectPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function fetchClients() {
      const clientsData = await getClients();
      setClients(clientsData);
    }
    fetchClients();
  }, []);

  const handleSuccess = (newProject: { id: string; name: string }) => {
    toast({
      title: 'Project Created',
      description: `Project "${newProject.name}" has been successfully created.`,
    });
    router.push('/projects');
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
          <ProjectForm clients={clients} onSuccess={handleSuccess} onCancel={() => router.push('/projects')} />
        </CardContent>
      </Card>
    </div>
  );
}
