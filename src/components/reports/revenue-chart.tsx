'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { getInvoices } from "@/lib/api/invoices"
import { useState, useEffect } from "react"
import { subMonths, format } from "date-fns"
import { Skeleton } from "../ui/skeleton"

export function RevenueChart() {
  const [chartData, setChartData] = useState<{name: string, total: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
        const invoicesResult = await getInvoices('first', null, 9999);
        const invoices = invoicesResult.invoices;
        const paidInvoices = invoices.filter(inv => inv.status === 'paid');
        const now = new Date();
        
        const monthlyRevenue = Array.from({ length: 12 }).map((_, i) => {
          const monthDate = subMonths(now, 11 - i);
          return {
            name: format(monthDate, 'MMM'),
            total: 0,
            key: format(monthDate, 'yyyy-MM'),
          };
        });

        const revenueMap = monthlyRevenue.reduce((acc, month) => {
            acc[month.key] = month;
            return acc;
        }, {} as {[key: string]: typeof monthlyRevenue[0]});


        paidInvoices.forEach(invoice => {
          const invoiceDate = new Date(invoice.issuedDate);
          if (invoiceDate > subMonths(now, 12)) {
            const invoiceKey = format(invoiceDate, 'yyyy-MM');
            if (revenueMap[invoiceKey]) {
                revenueMap[invoiceKey].total += invoice.amount;
            }
          }
        });
        
        setChartData(Object.values(revenueMap));
        setLoading(false);
    }
    fetchChartData();
  }, []);
  
  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Your total revenue over the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] flex items-end gap-4 px-4 pb-2">
                    {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="w-full" style={{height: `${Math.random() * 80 + 10}%`}} />
                    ))}
                </div>
                 <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Your total revenue over the last 12 months.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
             <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
