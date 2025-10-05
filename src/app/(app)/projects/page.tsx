import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/projects/projects-table"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      <ProjectsTable />
    </div>
  )
}

    