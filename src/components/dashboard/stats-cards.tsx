import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Clock, CheckCircle } from "lucide-react"

export function StatsCards() {
  const stats = [
    { title: "Outstanding Revenue", value: "$4,575.00", icon: DollarSign, color: "text-red-500" },
    { title: "Income (Last 30 days)", value: "$1,200.00", icon: CheckCircle, color: "text-green-500" },
    { title: "Hours Tracked (This week)", value: "9.5h", icon: Clock, color: "text-blue-500" },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
