
import { RevenueChart } from "@/components/reports/revenue-chart"
import { HoursChart } from "@/components/reports/hours-chart"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <RevenueChart />
        <HoursChart />
      </div>
    </div>
  )
}
