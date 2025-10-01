'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects, timeEntries } from "@/lib/data";
import { getWeek, isThisWeek } from 'date-fns';

export function ProjectPulse() {
    const activeProjects = projects.filter(p => p.status === 'active').slice(0, 3);
    const weeklyGoal = 40; // Assuming a 40-hour weekly goal per project for progress

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {activeProjects.map(project => {
                    const projectEntriesThisWeek = timeEntries.filter(
                        e => e.projectId === project.id && isThisWeek(e.startTime, { weekStartsOn: 1 })
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
                 {activeProjects.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No active projects to display.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
