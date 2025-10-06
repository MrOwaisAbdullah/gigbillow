'use client'

import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

type HoursChartProps = {
    data: {name: string, value: number}[];
}

export function HoursChart({ data }: HoursChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours by Project</CardTitle>
        <CardDescription>Distribution of hours tracked this month.</CardDescription>
      </CardHeader>
      <CardContent>
       {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => `${value.toFixed(2)} hours`}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
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
