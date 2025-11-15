import { useState } from "react"
import { BarChart3, FileSpreadsheet, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function DashboardSidebar({ sheets, selectedSheet, onSheetSelect, className }) {
  const [isOpen, setIsOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics & Reporting
        </p>
      </div>
      
      <div className="p-4">
        <h3 className="mb-3 px-2 text-sm font-semibold text-muted-foreground">
          SHEETS
        </h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1">
            {sheets.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                No sheets available
              </div>
            ) : (
              sheets.map((sheet) => (
                <Button
                  key={sheet}
                  variant={selectedSheet === sheet ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-normal",
                    selectedSheet === sheet && "bg-secondary"
                  )}
                  onClick={() => {
                    onSheetSelect(sheet)
                    setIsOpen(false)
                  }}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span className="truncate">{sheet}</span>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:block w-64 border-r bg-card", className)}>
        <SidebarContent />
      </aside>
    </>
  )
}

