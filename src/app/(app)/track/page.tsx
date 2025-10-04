import { TimeTracker } from "@/components/track/time-tracker";
import { TodaysLog } from "@/components/track/todays-log";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrackPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Time Tracker</h1>
        <div className="w-full max-w-2xl">
            <TimeTracker />
        </div>
        <div className="w-full max-w-4xl mt-8">
            <h2 className="text-2xl font-semibold mb-4">Today's Entries</h2>
            <Suspense fallback={<TodaysLogSkeleton />}>
               <TodaysLog />
            </Suspense>
        </div>
    </div>
  )
}

function TodaysLogSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 text-left">
                    <div>
                        <Skeleton className="h-5 w-28 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="text-right">
                        <Skeleton className="h-6 w-16 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            ))}
        </div>
    )
}
