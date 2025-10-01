'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProjects } from "@/lib/api/projects";
import { getTimeEntries } from "@/lib/api/time-entries";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import type { Project, TimeEntry } from "@/lib/types";
import { isThisWeek } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

export function ProjectPulse() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchProjectData() {
            try {
                const [projectsData, timeEntriesData] = await Promise.all([getProjects(), getTimeEntries()]);
                setProjects(projectsData.filter(p => p.status === 'active').slice(0, 3));
                setTimeEntries(timeEntriesData);
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: "Failed to fetch project pulse",
                    description: 'Please try again later.',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchProjectData();
    }, [toast]);

    const weeklyGoal = 40;

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project Pulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i}>
                            <div className="grid grid-cols-3 items-center gap-4 text-sm mb-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
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
                            <div className="grid grid-cols-3 items-center gap-4 text-sm mb-2">
                                <span className="font-semibold truncate col-span-3 sm:col-span-1">{project.name}</span>
                                <span className="text-muted-foreground text-right sm:text-left">{hoursThisWeek.toFixed(1)}h this week</span>
                                <span className="font-semibold text-right sm:text-left">${earnedThisWeek.toFixed(2)}</span>
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
