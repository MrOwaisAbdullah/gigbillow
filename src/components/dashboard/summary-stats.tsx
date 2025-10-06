
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Clock, Receipt } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type Stats = {
  outstandingRevenue: number;
  incomeLast30d: number;
  hoursThisWeek: number;
  expensesThisMonth: number;
};

type SummaryStatsProps = {
  stats: Stats | null;
  loading: boolean;
};

export function SummaryStats({ stats, loading }: SummaryStatsProps) {
  const statCards = [
    {
      title: 'Outstanding Revenue',
      value: stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.outstandingRevenue) : '$0.00',
      icon: AlertCircle,
      description: 'Total from unpaid invoices',
    },
    {
      title: 'Income (Last 30d)',
      value: stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.incomeLast30d) : '$0.00',
      icon: TrendingUp,
      description: 'Based on paid invoices',
    },
    {
      title: 'Hours This Week',
      value: stats ? `${stats.hoursThisWeek.toFixed(1)}h` : '0.0h',
      icon: Clock,
      description: 'Total billable hours tracked',
    },
    {
      title: 'Expenses (This Month)',
      value: stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.expensesThisMonth) : '$0.00',
      icon: Receipt,
      description: 'Total expenses logged',
    },
  ];

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-6" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
