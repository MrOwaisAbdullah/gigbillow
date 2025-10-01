'use client'

import { getTodaysTimeEntries } from "@/lib/api/time-entries";
import { getProjects } from "@/lib/api/projects";
import type { TimeEntry, Project } from "@/lib/types";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Clock } from "lucide-react";

export function TodaysLog() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [projects, setProjects] = useState<{ [key: string]: Project }>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchTodaysLog() {
            try {
                const [timeEntriesData, projectsData] = await Promise.all([getTodaysTimeEntries(), getProjects()]);
                setEntries(timeEntriesData);

                const projectsById = projectsData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Project });
                setProjects(projectsById);
            } catch (error) {
                toast({ variant: 'destructive', title: "Failed to load today's log" });
            } finally {
                setLoading(false);
            }
        }
        fetchTodaysLog();
    }, [toast]);

    if (loading) {
        return (
             <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 text-left">
                        <div>
                            <Skeleton className="h-5 w-28 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-6 w-16 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    if (entries.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 px-4 rounded-lg border border-dashed">
                <Clock className="mx-auto h-10 w-10 mb-4" />
                <h3 className="text-lg font-semibold">No time logged today</h3>
                <p>Start the timer on a project to begin tracking your work.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 text-left">
            {entries.map(entry => {
                const project = projects[entry.projectId];
                return (
                    <div key={entry.id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold">{project?.name || 'Unknown Project'}</p>
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="font-mono font-semibold text-lg">{entry.hours.toFixed(2)}h</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(entry.startTime), 'p')} - {entry.endTime ? format(new Date(entry.endTime), 'p') : 'Now'}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
