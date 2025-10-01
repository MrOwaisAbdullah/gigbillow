'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { getTimeEntries } from "@/lib/api/time-entries"
import { getProjects } from "@/lib/api/projects"
import type { TimeEntry, Project } from "@/lib/types"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "../ui/skeleton"

type TodaysEntriesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodaysEntriesSheet({ open, onOpenChange }: TodaysEntriesSheetProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<{ [key: string]: Project }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      async function fetchTodaysLog() {
        setLoading(true);
        try {
          const [timeEntriesData, projectsData] = await Promise.all([getTimeEntries(), getProjects()]);
          
          const todaysEntries = timeEntriesData.filter(
            (entry) => new Date(entry.startTime).toDateString() === new Date().toDateString()
          );
          setEntries(todaysEntries);

          const projectsById = projectsData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Project });
          setProjects(projectsById);

        } catch (error) {
          toast({ variant: 'destructive', title: "Failed to load today's log" });
        } finally {
          setLoading(false);
        }
      }
      fetchTodaysLog();
    }
  }, [open, toast]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Today's Time Log</SheetTitle>
          <SheetDescription>
            A log of all time entries recorded today.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8">
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                                <Skeleton className="h-5 w-24 mb-2" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="text-right">
                                <Skeleton className="h-5 w-12 mb-2" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : entries.length > 0 ? (
                 <ul className="space-y-4">
                 {entries.map(entry => {
                   const project = projects[entry.projectId]
                   return (
                     <li key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                       <div>
                         <p className="font-semibold">{project?.name || 'Unknown Project'}</p>
                         <p className="text-sm text-muted-foreground">{entry.description}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-mono font-semibold">{entry.hours.toFixed(2)}h</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.startTime), 'p')} - {entry.endTime ? format(new Date(entry.endTime), 'p') : 'Now'}
                          </p>
                       </div>
                     </li>
                   )
                 })}
               </ul>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>No time entries logged today.</p>
                </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
