'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ClientForm } from '@/components/clients/client-form';
import { useToast } from '@/hooks/use-toast';

export default function NewClientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSuccess = (newClient: { id: string, name: string }) => {
     toast({
        title: 'Client Created',
        description: `Client "${newClient.name}" has been successfully created.`,
      });
    router.push('/clients');
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Client</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
          <CardDescription>
            Enter the details for the new client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm onSuccess={handleSuccess} onCancel={() => router.push('/clients')} />
        </CardContent>
      </Card>
    </div>
  );
}
