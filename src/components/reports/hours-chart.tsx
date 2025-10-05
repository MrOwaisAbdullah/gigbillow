'use client'

import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { getProjects } from "@/lib/api/projects"
import { getTimeEntries } from "@/lib/api/time-entries"
import { useState, useEffect } from "react"
import type { Project, TimeEntry } from "@/lib/types"
import { Skeleton } from "../ui/skeleton"
import { startOfMonth } from "date-fns"


const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export function HoursChart() {
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      const [projectsResult, timeEntriesResult] = await Promise.all([getProjects('first', null, 9999), getTimeEntries(null, 9999)]);
      const projects = projectsResult.projects;
      const timeEntries = timeEntriesResult.entries;
      const startOfCurrentMonth = startOfMonth(new Date());

      const monthlyEntries = timeEntries.filter(e => new Date(e.startTime) >= startOfCurrentMonth);

      const hoursByProject = monthlyEntries.reduce((acc, entry) => {
        const project = projects.find(p => p.id === entry.projectId);
        if (project) {
          acc[project.name] = (acc[project.name] || 0) + entry.hours;
        }
        return acc;
      }, {} as { [key: string]: number });

      const data = Object.entries(hoursByProject).map(([name, value]) => ({ name, value }));
      setChartData(data);
      setLoading(false);
    }
    fetchChartData();
  }, []);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hours by Project</CardTitle>
                <CardDescription>Distribution of hours tracked this month.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[350px]">
                <Skeleton className="w-[250px] h-[250px] rounded-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours by Project</CardTitle>
        <CardDescription>Distribution of hours tracked this month.</CardDescription>
      </CardHeader>
      <CardContent>
       {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
       ) : (
          <div className="flex justify-center items-center h-[350px] text-muted-foreground">
              <p>No hours tracked this month.</p>
          </div>
       )}
      </CardContent>
    </Card>
  )
}
