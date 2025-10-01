import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AppSidebarNav } from "./app-sidebar-nav"

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-sidebar sm:flex">
      <TooltipProvider>
        <AppSidebarNav isCollapsed={true} />
      </TooltipProvider>
    </aside>
  )
}
