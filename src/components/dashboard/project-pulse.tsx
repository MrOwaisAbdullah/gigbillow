'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProjects } from "@/lib/api/projects";
import { getTimeEntries } from "@/lib/api/time-entries";
import { useEffect, useState } from "react";
import type { Project, TimeEntry } from "@/lib/types";
import { isThisWeek } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

export function ProjectPulse() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjectData() {
            const [projectsResult, timeEntriesResult] = await Promise.all([getProjects('first', null, 9999), getTimeEntries(null, 9999)]);
            const projectsData = projectsResult.projects;
            setProjects(projectsData.filter(p => p.status === 'active').slice(0, 3));
            setTimeEntries(timeEntriesResult.entries);
            setLoading(false);
        }
        fetchProjectData();
    }, []);

    const weeklyGoal = 40;

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project Pulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/5" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {projects.map(project => {
                    const projectEntriesThisWeek = timeEntries.filter(
                        e => e.projectId === project.id && isThisWeek(new Date(e.startTime), { weekStartsOn: 1 })
                    );

                    const hoursThisWeek = projectEntriesThisWeek.reduce((acc, entry) => acc + entry.hours, 0);
                    const earnedThisWeek = hoursThisWeek * project.rate;
                    const progress = (hoursThisWeek / weeklyGoal) * 100;

                    return (
                        <div key={project.id}>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm mb-2">
                                <span className="font-semibold truncate ">{project.name}</span>
                                <div className="flex gap-4 text-muted-foreground">
                                    <span>{hoursThisWeek.toFixed(1)}h this week</span>
                                    <span className="font-semibold text-foreground">${earnedThisWeek.toFixed(2)}</span>
                                </div>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    );
                })}
                 {projects.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No active projects to display.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
