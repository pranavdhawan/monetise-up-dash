import { useState, useEffect, useCallback, memo } from "react"
import { BarChart3, ComputerIcon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import logo from "@/assets/logoo.png"

export function DashboardSidebar({ sheets, selectedSheet, onSheetSelect, className, renderMobileButton }) {
  const [isOpen, setIsOpen] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)

  const handleOpenSheet = useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Prevent double-tap (debounce within 300ms)
    const now = Date.now()
    if (now - lastClickTime < 300) return
    setLastClickTime(now)
    
    if (!isOpen) {
      setIsOpen(true)
    }
  }, [isOpen, lastClickTime])

  const MobileMenuButton = memo(() => {
    const handleClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleOpenSheet(e)
    }
    
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        className="h-10 w-10 shrink-0 lg:hidden touch-manipulation pointer-events-auto relative z-50"
        aria-label="Open menu"
        type="button"
      >
        <Menu className="h-5 w-5" />
      </Button>
    )
  })

  MobileMenuButton.displayName = "MobileMenuButton"

  // Expose the button through a callback if provided
  useEffect(() => {
    if (renderMobileButton) {
      renderMobileButton(MobileMenuButton)
    }
  }, [renderMobileButton])

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          {/* <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logo} alt="MonetiseUp Logo" className="h-full w-full object-contain" />
          </div> */}
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics & Reporting
        </p>
      </div>
      
      <div className="p-4">
        <h3 className="mb-3 px-2 text-sm font-semibold text-muted-foreground">
          Websites
        </h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1">
            {sheets.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                No websites available
              </div>
            ) : (
              sheets.map((sheet) => {
                const handleSheetClick = (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (selectedSheet !== sheet) {
                    onSheetSelect(sheet)
                  }
                  setIsOpen(false)
                }
                
                return (
                  <Button
                    key={sheet}
                    variant={selectedSheet === sheet ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start font-normal min-h-[44px] touch-manipulation",
                      selectedSheet === sheet && "bg-secondary"
                    )}
                    onClick={handleSheetClick}
                  >
                    {/* <ComputerIcon className="mr-2 h-4 w-4" /> */}
                    <span className="text-1xl font-bold">🖥️</span>
                    <span className="truncate">{sheet}</span>
                  </Button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 sm:w-72 p-0">
          <SheetTitle className="sr-only">Website Selection Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Select a website to view analytics data
          </SheetDescription>
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

