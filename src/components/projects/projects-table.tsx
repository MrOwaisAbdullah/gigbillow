
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
import { useEffect, useState, useCallback, useMemo } from "react"
import type { Project, Client } from "@/lib/types"
import { Skeleton } from "../ui/skeleton"
import type { DocumentSnapshot } from "firebase/firestore"
import { PaginationControls } from "../pagination-controls"

const statusVariantMap: { [key in 'active' | 'completed' | 'on_hold']: 'default' | 'secondary' | 'outline' } = {
  active: 'default',
  completed: 'secondary',
  on_hold: 'outline',
}

type ProjectsTableProps = {
    searchTerm: string;
}

export function ProjectsTable({ searchTerm }: ProjectsTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<{[key: string]: Client}>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();

  const fetchProjects = useCallback(async (page: 'first' | 'next' | 'prev') => {
    setLoading(true);
    const isSearching = searchTerm.trim() !== '';
    const pageSize = isSearching ? 100 : 10;
    
    let cursor: DocumentSnapshot | null = null;
    if (page === 'next') {
        cursor = cursors[currentPage] || null;
    } else if (page === 'prev') {
        cursor = cursors[currentPage - 2] || null;
    }

    const { projects: projectsData, next } = await getProjects(page, cursor, pageSize);
    setProjects(projectsData);

    if(projectsData.length > 0) {
        const clientIds = [...new Set(projectsData.map(p => p.clientId))].filter(id => !clients[id]);
        if (clientIds.length > 0) {
            const clientsData: {[key: string]: Client} = {};
            const clientPromises = clientIds.map(id => getClientById(id));
            const clientResults = await Promise.all(clientPromises);
            clientResults.forEach(client => {
                if(client) clientsData[client.id] = client;
            });
            setClients(prev => ({...prev, ...clientsData}));
        }
    }

    if (!isSearching) {
        if (page === 'next') {
            if (!cursors.includes(next)) {
                setCursors(c => [...c, next]);
            }
            setCurrentPage(p => p + 1);
        } else if (page === 'prev') {
            setCurrentPage(p => Math.max(1, p - 1));
        } else { // first
            setCursors([null, next]);
            setCurrentPage(1);
        }
        setHasNextPage(!!next);
    } else {
        setHasNextPage(false);
        setCurrentPage(1);
    }
    setLoading(false);
  }, [currentPage, cursors, clients, searchTerm]);

  useEffect(() => {
    fetchProjects('first');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    const lowercasedFilter = searchTerm.toLowerCase();
    return projects.filter(project => {
      const client = clients[project.clientId];
      return (
        project.name.toLowerCase().includes(lowercasedFilter) ||
        (client && client.name.toLowerCase().includes(lowercasedFilter))
      );
    });
  }, [searchTerm, projects, clients]);

  const handleDelete = async (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (!projectToDelete) return;

    try {
      await deleteProject(id);
      toast({
        title: 'Project Deleted',
        description: `Project "${projectToDelete.name}" has been deleted.`,
      });
      fetchProjects('first');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete project',
        description: 'Please try again later.',
      });
    }
  };
  
  if (loading && projects.length === 0) {
    return (
        <div className="rounded-lg border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/5">Project Name</TableHead>
                        <TableHead className="w-2/5">Client</TableHead>
                        <TableHead className="w-1/5">Status</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
    <>
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {loading ? (
                 [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell>
                            <div className="flex justify-end">
                              <Skeleton className="h-8 w-8" />
                            </div>
                        </TableCell>
                    </TableRow>
                ))
            ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
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
    {!searchTerm && (
        <PaginationControls
            onNext={() => fetchProjects('next')}
            onPrev={() => fetchProjects('prev')}
            hasNextPage={hasNextPage}
            hasPrevPage={currentPage > 1}
            currentPage={currentPage}
        />
    )}
    </>
  )
}
