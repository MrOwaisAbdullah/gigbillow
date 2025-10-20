
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
import { MoreHorizontal, Loader2 } from "lucide-react"
import { getProjects, deleteProject } from "@/lib/api/projects"
import { getClients } from "@/lib/api/clients"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useCallback, useMemo } from "react"
import type { Project, Client } from "@/lib/types"
import { Skeleton } from "../ui/skeleton"
import type { DocumentSnapshot } from "firebase/firestore"
import { PaginationControls } from "../pagination-controls"
import { ProjectDialog } from "./project-dialog"
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

const statusVariantMap: { [key in 'active' | 'completed' | 'on_hold']: 'default' | 'secondary' | 'outline' } = {
  active: 'default',
  completed: 'secondary',
  on_hold: 'secondary',
}

type ProjectsTableProps = {
    searchTerm: string;
}

export function ProjectsTable({ searchTerm }: ProjectsTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [clients, setClients] = useState<{[key: string]: Client}>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<(DocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const fetchProjectsAndClients = useCallback(async (page: 'first' | 'next' | 'prev') => {
    setLoading(true);
    const isSearching = searchTerm.trim() !== '';
    const pageSize = isSearching ? 100 : 10;
    
    let cursor: DocumentSnapshot | null = null;
    let pageToGo = 1;

    if (page === 'next') {
        cursor = pageCursors[currentPage] || null;
        pageToGo = currentPage + 1;
    } else if (page === 'prev') {
        cursor = pageCursors[currentPage - 2] || null;
        pageToGo = currentPage - 1;
    }
    
    const [{ projects: projectsData, nextCursor, hasNextPage: newHasNextPage }, { clients: clientsData }] = await Promise.all([
      getProjects('next', cursor, pageSize),
      getClients('first', null, 9999)
    ]);
    
    setProjects(projectsData);
    setAllClients(clientsData);

    const clientsMap = clientsData.reduce((acc, client) => {
        acc[client.id] = client;
        return acc;
    }, {} as {[key: string]: Client});

    setClients(clientsMap);
    setHasNextPage(newHasNextPage);

    if (!isSearching) {
       if (page === 'next') {
            setPageCursors(prev => {
                const newCursors = [...prev];
                newCursors[pageToGo] = nextCursor;
                return newCursors;
            });
            setCurrentPage(pageToGo);
        } else if (page === 'prev') {
            setCurrentPage(pageToGo);
        } else { // first
            setPageCursors([null, nextCursor]);
            setCurrentPage(1);
        }
    } else {
        setHasNextPage(false);
        setCurrentPage(1);
        setPageCursors([null]);
    }
    setLoading(false);
  }, [pageCursors, currentPage, searchTerm]);

  useEffect(() => {
    fetchProjectsAndClients('first');
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

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
    fetchProjectsAndClients('first');
  };
  
  const handleDeleteConfirm = (project: Project) => {
    setSelectedProject(project);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    setIsDeleting(true);
    try {
      await deleteProject(selectedProject.id);
      toast({ title: 'Project Deleted' });
      fetchProjectsAndClients('first');
    } catch (error) {
      // API handles toast
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setSelectedProject(null);
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
                            <DropdownMenuItem onSelect={() => handleEdit(project)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDeleteConfirm(project)} className="text-destructive">Delete</DropdownMenuItem>
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
            onNext={() => fetchProjectsAndClients('next')}
            onPrev={() => fetchProjectsAndClients('prev')}
            hasNextPage={hasNextPage}
            hasPrevPage={currentPage > 1}
            currentPage={currentPage}
        />
    )}
    <ProjectDialog
        project={selectedProject}
        clients={allClients}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
        onClose={() => setSelectedProject(null)}
        onClientCreated={handleSuccess}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete the project and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedProject(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
