'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodaysTimeEntries } from "@/lib/api/time-entries";
import { getProjects } from "@/lib/api/projects";
import { useEffect, useState } from "react";
import type { TimeEntry, Project } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export function TodaysPulse() {
    const [billableHoursToday, setBillableHoursToday] = useState(0);
    const [earnedToday, setEarnedToday] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTodaysPulse() {
            const [timeEntriesResult, projectsResult] = await Promise.all([getTodaysTimeEntries(), getProjects('first', null, 9999)]);
            const timeEntries = timeEntriesResult.entries;
            const projects = projectsResult.projects;
            const projectsById = projects.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Project });
            
            const totalHours = timeEntries.reduce((acc, entry) => acc + entry.hours, 0);
            setBillableHoursToday(totalHours);

            const totalEarned = timeEntries.reduce((acc, entry) => {
                const project = projectsById[entry.projectId];
                if (project && project.rate) {
                    return acc + entry.hours * project.rate;
                }
                return acc;
            }, 0);
            setEarnedToday(totalEarned);
            setLoading(false);
        }
        fetchTodaysPulse();
    }, []);

    if(loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Today's Pulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Billable Hours Today</span>
                        <Skeleton className="h-7 w-20" />
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Earned Today</span>
                        <Skeleton className="h-7 w-24" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today's Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Billable Hours Today</span>
                    <span className="text-2xl font-bold">{billableHoursToday.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Earned Today</span>
                    <span className="text-2xl font-bold">${earnedToday.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
