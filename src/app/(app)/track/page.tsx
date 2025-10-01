import { TimeTracker } from "@/components/track/time-tracker"

export default function TrackPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Time Tracker</h1>
        <div className="w-full max-w-2xl">
            <TimeTracker />
        </div>
    </div>
  )
}
