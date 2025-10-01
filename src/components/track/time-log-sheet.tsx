'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { getTimeEntries } from "@/lib/api/time-entries"
import { getProjects } from "@/lib/api/projects"
import type { TimeEntry, Project } from "@/lib/types"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "../ui/skeleton"
import { Loader2 } from "lucide-react"
import type { DocumentSnapshot } from "firebase/firestore"

type TimeLogSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeLogSheet({ open, onOpenChange }: TimeLogSheetProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<{ [key: string]: Project }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async (loadMore = false) => {
    if (loadMore) {
        setLoadingMore(true);
    } else {
        setLoading(true);
    }

    try {
        if (!loadMore && Object.keys(projects).length === 0) {
            const projectsData = await getProjects();
            const projectsById = projectsData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Project });
            setProjects(projectsById);
        }

        const result = await getTimeEntries(loadMore ? lastVisible : null, 15);
        
        setEntries(prev => loadMore ? [...prev, ...result.entries] : result.entries);
        setLastVisible(result.next);
        setHasNextPage(!!result.next);

    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to load time log history" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    } else {
      // Reset state when sheet is closed
      setEntries([]);
      setLastVisible(null);
      setHasNextPage(true);
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const renderEntry = (entry: TimeEntry) => {
      const project = projects[entry.projectId];
      return (
        <li key={entry.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-semibold">{project?.name || 'Unknown Project'}</p>
            <p className="text-sm text-muted-foreground">{entry.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(entry.startTime), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
             <p className="font-mono font-semibold">{entry.hours.toFixed(2)}h</p>
             <p className="text-sm text-muted-foreground">
                {format(new Date(entry.startTime), 'p')} - {entry.endTime ? format(new Date(entry.endTime), 'p') : 'Now'}
             </p>
          </div>
        </li>
      )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Time Log History</SheetTitle>
          <SheetDescription>
            A complete log of all your recorded time entries.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6 mt-4">
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                                <Skeleton className="h-5 w-24 mb-2" />
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-20 mt-2" />
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
                    {entries.map(renderEntry)}
                 </ul>
            ) : (
                <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                    <p>No time entries have been recorded yet.</p>
                </div>
            )}
        </div>
        <SheetFooter className="pt-4">
            {hasNextPage && !loading && (
                <Button onClick={() => fetchLogs(true)} disabled={loadingMore} className="w-full">
                    {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Load More
                </Button>
            )}
            {!hasNextPage && !loading && entries.length > 0 && (
                <p className="text-center text-sm text-muted-foreground w-full">You've reached the end.</p>
            )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
