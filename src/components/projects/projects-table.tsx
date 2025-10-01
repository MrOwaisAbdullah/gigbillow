'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { getProjects, deleteProject } from "@/lib/api/projects"
import { getClientById } from "@/lib/api/clients"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import type { Project, Client } from "@/lib/types"
import { Skeleton } from "../ui/skeleton"

const statusVariantMap: { [key in 'active' | 'completed' | 'on_hold']: 'default' | 'secondary' | 'outline' } = {
  active: 'default',
  completed: 'secondary',
  on_hold: 'outline',
}

export function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<{[key: string]: Client}>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);

        const clientIds = [...new Set(projectsData.map(p => p.clientId))];
        const clientsData: {[key: string]: Client} = {};
        for (const id of clientIds) {
            const client = await getClientById(id);
            if(client) clientsData[id] = client;
        }
        setClients(clientsData);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to fetch data',
          description: 'Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleDelete = async (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (!projectToDelete) return;

    try {
      await deleteProject(id);
      setProjects(projects.filter(project => project.id !== id));
      toast({
        title: 'Project Deleted',
        description: `Project "${projectToDelete.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete project',
        description: 'Please try again later.',
      });
    }
  };
  
  if (loading) {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell>
                                <div className="flex justify-end">
                                  <Skeleton className="h-8 w-8" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
  }


  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {projects.length > 0 ? (
                projects.map((project) => {
                    const client = clients[project.clientId];
                    return (
                    <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{client?.name}</TableCell>
                        <TableCell>
                        <Badge variant={statusVariantMap[project.status]} className="capitalize">
                            {project.status.replace('_', ' ')}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(project.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    )
                })
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No projects found.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
      </Table>
    </div>
  )
}
