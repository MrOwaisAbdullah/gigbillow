'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { PlusCircle } from "lucide-react"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { getProjects } from "@/lib/api/projects"
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpensesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { projects: projectsData } = await getProjects('first', null, 9999);
      setProjects(projectsData);
      setLoading(false);
    }
    fetchProjects();
  }, []);

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
        <ExpenseDialog projects={projects} trigger={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        } />
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Track expenses for free. Including them on an invoice costs 1 token.
      </p>
      <ExpensesTable allProjects={projects}/>
    </div>
  )
}
