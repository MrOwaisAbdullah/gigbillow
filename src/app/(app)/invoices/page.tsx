import { InvoicesList } from "@/components/invoices/invoices-list"
import { InvoiceActions } from "@/components/invoices/invoice-actions"

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <InvoiceActions />
      </div>
      <InvoicesList />
    </div>
  )
}

    