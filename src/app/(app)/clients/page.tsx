import { Button } from "@/components/ui/button"
import { ClientsTable } from "@/components/clients/clients-table"
import { PlusCircle } from "lucide-react"

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>
      <ClientsTable />
    </div>
  )
}
