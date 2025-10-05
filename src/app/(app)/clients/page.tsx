import { Button } from "@/components/ui/button"
import { ClientsTable } from "@/components/clients/clients-table"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Button asChild>
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>
      <ClientsTable />
    </div>
  )
}

    