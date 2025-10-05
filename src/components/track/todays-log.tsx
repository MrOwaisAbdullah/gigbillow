'use client'

import { getTodaysTimeEntries } from "@/lib/api/time-entries";
import { getProjects } from "@/lib/api/projects";
import type { TimeEntry, Project } from "@/lib/types";
import { format } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "../ui/skeleton";
import { Clock } from "lucide-react";
import { DocumentSnapshot } from "firebase/firestore";
import { PaginationControls } from "../pagination-controls";

export function TodaysLog() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [projects, setProjects] = useState<{ [key: string]: Project }>({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [cursors, setCursors] = useState<(DocumentSnapshot | null)[]>([null]);
    const [hasNextPage, setHasNextPage] = useState(false);


    const fetchTodaysLog = useCallback(async (page: 'first' | 'next' | 'prev') => {
        setLoading(true);
        let cursor: DocumentSnapshot | null = null;
        if (page === 'next') {
            cursor = cursors[currentPage] || null;
        } else if (page === 'prev') {
            cursor = cursors[currentPage - 2] || null;
        }

        const { entries: timeEntriesData, next } = await getTodaysTimeEntries(page, cursor, 5);
        setEntries(timeEntriesData);

        if (timeEntriesData.length > 0) {
            const projectIds = [...new Set(timeEntriesData.map(e => e.projectId))].filter(id => !projects[id]);
            if (projectIds.length > 0) {
                 const projectsResult = await getProjects('first', null, 9999);
                 const projectsData = projectsResult.projects;
                 const projectsById = projectsData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Project });
                 setProjects(prev => ({ ...prev, ...projectsById}));
            }
        }
        
        if (page === 'next') {
            if (!cursors.includes(next)) {
                setCursors([...cursors, next]);
            }
            setCurrentPage(prevPage => prevPage + 1);
        } else if (page === 'prev') {
            setCurrentPage(prevPage => Math.max(1, prevPage - 1));
        } else { // first
            setCursors([null, next]);
            setCurrentPage(1);
        }
        setHasNextPage(!!next);
        setLoading(false);
    }, [currentPage, cursors, projects]);

    useEffect(() => {
        fetchTodaysLog('first');
    }, []);

    if (loading && entries.length === 0) {
        return (
             <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 text-left">
                        <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-6 w-20 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    if (entries.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 px-4 rounded-lg border-2 border-dashed">
                <Clock className="mx-auto h-10 w-10 mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No time logged today</h3>
                <p>Start the timer on a project to begin tracking your work.</p>
            </div>
        )
    }

    return (
        <>
        <div className="space-y-4 text-left">
            {loading ? (
                [...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 text-left">
                        <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-6 w-20 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))
            ) : entries.map(entry => {
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
        <PaginationControls
            onNext={() => fetchTodaysLog('next')}
            onPrev={() => fetchTodaysLog('prev')}
            hasNextPage={hasNextPage}
            hasPrevPage={currentPage > 1}
            currentPage={currentPage}
            />
        </>
    )
}
