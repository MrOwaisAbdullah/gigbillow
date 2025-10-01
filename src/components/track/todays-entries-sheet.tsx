'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { timeEntries, getProjectById } from "@/lib/data"
import { format } from "date-fns"

type TodaysEntriesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodaysEntriesSheet({ open, onOpenChange }: TodaysEntriesSheetProps) {
  const todaysEntries = timeEntries.filter(
    (entry) => new Date(entry.startTime).toDateString() === new Date().toDateString()
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Today's Time Log</SheetTitle>
          <SheetDescription>
            A log of all time entries recorded today.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8">
            {todaysEntries.length > 0 ? (
                 <ul className="space-y-4">
                 {todaysEntries.map(entry => {
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
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>No time entries logged today.</p>
                </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
