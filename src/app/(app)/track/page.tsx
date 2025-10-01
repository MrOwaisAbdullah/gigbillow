import { TimeTracker } from "@/components/track/time-tracker"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { timeEntries, getProjectById } from "@/lib/data"
import { format } from "date-fns"

export default function TrackPage() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Time Tracker</h1>
        <TimeTracker />
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Entries</CardTitle>
            <CardDescription>A log of time tracked today.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {timeEntries.map(entry => {
                const project = getProjectById(entry.projectId)
                return (
                  <li key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-semibold">{project?.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-mono font-semibold">{entry.hours.toFixed(2)}h</p>
                       <p className="text-sm text-muted-foreground">
                         {format(entry.startTime, 'p')} - {entry.endTime ? format(entry.endTime, 'p') : 'Now'}
                       </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
