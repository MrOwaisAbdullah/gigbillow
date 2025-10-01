'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImportWorkLogDialog } from "./import-work-log-dialog"
import { PlusCircle } from "lucide-react"

export function InvoiceActions() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
          Import Work Log
        </Button>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>
      <ImportWorkLogDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
    </>
  )
}
