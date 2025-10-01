import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { invoices, getClientById, getProjectById } from "@/lib/data"
import { format } from "date-fns"

export function InvoicesTable() {
  const outstandingInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue');

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outstandingInvoices.map((invoice) => {
            const client = getClientById(invoice.clientId);
            const project = getProjectById(invoice.projectId);
            return (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{client?.name}</TableCell>
                <TableCell>{project?.name}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>{format(invoice.dueDate, 'PPP')}</TableCell>
                <TableCell>
                   <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'} className="capitalize">
                    {invoice.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
