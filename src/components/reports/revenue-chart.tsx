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
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { subMonths, format, getYear, getMonth } from "date-fns"
import { Skeleton } from "../ui/skeleton"

export function RevenueChart() {
  const [chartData, setChartData] = useState<{name: string, total: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchChartData() {
      try {
        const invoices = await getInvoices();
        const paidInvoices = invoices.filter(inv => inv.status === 'paid');
        const now = new Date();
        
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
          const monthDate = subMonths(now, 11 - i);
          return {
            name: format(monthDate, 'MMM'),
            total: 0,
          };
        });

        paidInvoices.forEach(invoice => {
          const invoiceDate = new Date(invoice.issuedDate);
          const monthIndex = getMonth(invoiceDate);
          const invoiceYear = getYear(invoiceDate);
          
          // This logic can be tricky. Let's simplify by matching month and year.
          const targetMonth = monthlyRevenue.find(m => {
              const d = new Date(`${m.name} 1, ${getYear(now)}`); // May need adjustment for year changes
              // A more robust way would be to create a year-month key
              return format(invoiceDate, 'MMM') === m.name;
          });
          
          if(targetMonth) {
              targetMonth.total += invoice.amount;
          }
        });
        
        // Re-aggregate because the above logic might be flawed across year boundaries
        const finalMonthlyRevenue: {[key: string]: number} = {};
        for(let i=0; i<12; i++) {
            const d = subMonths(now, i);
            finalMonthlyRevenue[format(d, 'MMM')] = 0;
        }

        paidInvoices.forEach(invoice => {
            const invoiceDate = new Date(invoice.issuedDate);
            if(invoiceDate > subMonths(now, 12)) {
                const monthName = format(invoiceDate, 'MMM');
                finalMonthlyRevenue[monthName] = (finalMonthlyRevenue[monthName] || 0) + invoice.amount;
            }
        });
        
        const dataForChart = Object.keys(finalMonthlyRevenue).map(key => ({
            name: key,
            total: finalMonthlyRevenue[key]
        })).reverse();


        setChartData(dataForChart);

      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to load revenue chart' });
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, [toast]);
  
  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Your total revenue over the last 12 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] flex items-end gap-2 px-4">
                    {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="h-full w-full" style={{height: `${Math.random() * 80 + 10}%`}} />
                    ))}
                </div>
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
