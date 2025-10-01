'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeEntries, projects } from "@/lib/data";
import { isToday, getWeek } from "date-fns";

export function TodaysPulse() {
    const todaysEntries = timeEntries.filter(entry => isToday(entry.startTime));
    const billableHoursToday = todaysEntries.reduce((acc, entry) => acc + entry.hours, 0);
    
    const earnedToday = todaysEntries.reduce((acc, entry) => {
        const project = projects.find(p => p.id === entry.projectId);
        if (project) {
            return acc + entry.hours * project.rate;
        }
        return acc;
    }, 0);

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
