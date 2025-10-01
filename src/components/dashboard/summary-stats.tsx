'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { invoices, timeEntries } from '@/lib/data';
import { differenceInDays, isThisWeek, subDays } from 'date-fns';
import { TrendingUp, FileText, Clock, AlertCircle } from 'lucide-react';

export function SummaryStats() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const outstandingRevenue = invoices
    .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const incomeLast30d = invoices
    .filter(
      (inv) =>
        inv.status === 'paid' &&
        inv.issuedDate >= thirtyDaysAgo 
    )
    .reduce((acc, inv) => acc + inv.amount, 0);

  const hoursThisWeek = timeEntries
    .filter((entry) => isThisWeek(entry.startTime, { weekStartsOn: 1 }))
    .reduce((acc, entry) => acc + entry.hours, 0);
    
  const stats = [
    {
      title: 'Outstanding Revenue',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(outstandingRevenue),
      icon: AlertCircle,
      description: 'Total from unpaid invoices',
    },
    {
      title: 'Income (Last 30 d)',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(incomeLast30d),
      icon: TrendingUp,
      description: 'Based on paid invoices',
    },
    {
      title: 'Hours This Week',
      value: `${hoursThisWeek.toFixed(1)}h`,
      icon: Clock,
      description: 'Total billable hours tracked',
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
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
