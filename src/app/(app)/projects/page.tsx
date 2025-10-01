import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/projects/projects-table"
import { PlusCircle } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      <ProjectsTable />
    </div>
  )
}
