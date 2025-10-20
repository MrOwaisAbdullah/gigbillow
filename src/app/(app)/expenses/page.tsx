
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { PlusCircle, Search } from "lucide-react"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { getProjects } from "@/lib/api/projects"
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function ExpensesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tableKey, setTableKey] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = useCallback(async () => {
      // Since getProjects is client-side, this is fine.
      const { projects: projectsData } = await getProjects('first', null, 9999);
      setProjects(projectsData);
      setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setTableKey(Date.now()); // Change the key to force re-render of the table
  }

  if (loading) {
    return (
       <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-4 w-96" />
        <div className="rounded-lg border overflow-x-auto">
            <div className="h-72" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search expenses..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Expense
            </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Track and manage your billable and non-billable expenses.
      </p>
      <ExpensesTable key={tableKey} allProjects={projects} searchTerm={searchTerm} />
       <ExpenseDialog
        projects={projects}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
