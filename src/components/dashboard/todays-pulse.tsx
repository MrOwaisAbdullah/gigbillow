'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTimeEntries } from "@/lib/api/time-entries";
import { getProjects } from "@/lib/api/projects";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import type { TimeEntry, Project } from "@/lib/types";
import { isToday } from "date-fns";
import { Skeleton } from "../ui/skeleton";

export function TodaysPulse() {
    const [billableHoursToday, setBillableHoursToday] = useState(0);
    const [earnedToday, setEarnedToday] = useState(0);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchTodaysPulse() {
            try {
                const [timeEntries, projects] = await Promise.all([getTimeEntries(), getProjects()]);
                const projectsById = projects.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Project });

                const todaysEntries = timeEntries.filter(entry => isToday(new Date(entry.startTime)));
                
                const totalHours = todaysEntries.reduce((acc, entry) => acc + entry.hours, 0);
                setBillableHoursToday(totalHours);

                const totalEarned = todaysEntries.reduce((acc, entry) => {
                    const project = projectsById[entry.projectId];
                    if (project) {
                        return acc + entry.hours * project.rate;
                    }
                    return acc;
                }, 0);
                setEarnedToday(totalEarned);

            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: "Failed to fetch today's pulse",
                    description: 'Please try again later.',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchTodaysPulse();
    }, [toast]);

    if(loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Today's Pulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-baseline">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-7 w-16" />
                    </div>
                    <div className="flex justify-between items-baseline">
                        <Skeleton className="h-4 w-28" />
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
