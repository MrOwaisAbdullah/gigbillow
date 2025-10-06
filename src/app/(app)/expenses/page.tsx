
import { Button } from "@/components/ui/button"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { PlusCircle } from "lucide-react"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { getProjects } from "@/lib/api/projects"

export default async function ExpensesPage() {
  const { projects } = await getProjects('first', null, 9999);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <ExpenseDialog projects={projects} trigger={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        } />
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Track expenses for free. Including them on an invoice costs 1 token.
      </p>
      <ExpensesTable allProjects={projects}/>
    </div>
  )
}
