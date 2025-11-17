import { useState, useEffect, useCallback, useTransition } from "react"
import { useUser } from "@clerk/clerk-react"
import axios from "axios"
import { BarChart3, Table2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DateFilter } from "@/components/dashboard/DateFilter"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { DataTable } from "@/components/dashboard/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const [sheetNames, setSheetNames] = useState([])
  const [sheetID, setSheetID] = useState(null)
  const [selectedSheet, setSelectedSheet] = useState(null)
  const [view, setView] = useState("chart")
  const [dateRange, setDateRange] = useState(null) // Will be set by DateFilter default (yesterday)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [MobileMenuButton, setMobileMenuButton] = useState(null)
  const [isPending, startTransition] = useTransition()

  const { isSignedIn, user, isLoaded } = useUser()
  const key = import.meta.env.VITE_CLIENT_KEY

  // Load sheetID from Clerk metadata
  useEffect(() => {
    if (isLoaded && user) {
      try {
        const sheetIdFromMetadata = user.publicMetadata?.sheetId
        
        if (sheetIdFromMetadata) {
          setSheetID(sheetIdFromMetadata)
        } else {
          setError("No sheetId found for user. Please contact admin.")
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching sheetID:", error.message)
        setError(error.message)
        setLoading(false)
      }
    }
  }, [isLoaded, user])

  // Fetch sheet names from Google Sheets
  useEffect(() => {
    const fetchSheetData = async () => {
      if (!sheetID) return
      
      setLoading(true)

      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?key=${key}`
        )
        const names = response.data.sheets.map((sheet) => sheet.properties.title)
        setSheetNames(names)
        setSelectedSheet(names[0])
        setLoading(false)
        setError(null)
      } catch (error) {
        console.error("Error fetching sheet data:", error)
        setError("Failed to load sheet data. Please check your configuration.")
        setLoading(false)
      }
    }

    fetchSheetData()
  }, [sheetID, key])

  const handleDateRangeChange = useCallback((range) => {
    // Use React.startTransition for non-urgent updates
    startTransition(() => {
      setDateRange(range)
    })
  }, [])

  const handleSheetSelect = useCallback((sheet) => {
    setSelectedSheet(sheet)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="hidden md:block w-64 border-r bg-card">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header */}
      <DashboardHeader />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <DashboardSidebar
          sheets={sheetNames}
          selectedSheet={selectedSheet}
          onSheetSelect={handleSheetSelect}
          renderMobileButton={(button) => setMobileMenuButton(() => button)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Sub-Header */}
          <div className="border-b bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 gap-4">
              <div className="min-w-0 flex items-center gap-2">
                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                  {MobileMenuButton && <MobileMenuButton />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Analytics Dashboard</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                    {selectedSheet || "Select a sheet to view data"}
                  </p>
                </div>
              </div>
              
              {/* View Toggle - Desktop */}
              <div className="hidden sm:flex items-center gap-2 rounded-lg border p-1 shrink-0">
                <Button
                  variant={view === "chart" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView("chart")}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Chart
                </Button>
                <Button
                  variant={view === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView("table")}
                  className="gap-2"
                >
                  <Table2 className="h-4 w-4" />
                  Table
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Date Filter - Top Position */}
          <div className="lg:hidden border-b bg-card p-3 sm:p-4 shrink-0 relative z-10">
            <details className="group">
              <summary className="cursor-pointer text-sm sm:text-base font-semibold flex items-center justify-between list-none touch-manipulation pointer-events-auto">
                <span>Date Range</span>
                <span className="transform transition-transform group-open:rotate-180 text-xs">▼</span>
              </summary>
              <div className="pt-2 pointer-events-auto">
                <DateFilter onDateRangeChange={handleDateRangeChange} />
              </div>
            </details>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Main View */}
            <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
              {!selectedSheet ? (
                <Card>
                  <CardContent className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Sheet Selected</h3>
                      <p className="text-muted-foreground">
                        Select a sheet from the sidebar to view analytics
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Mobile View Toggle */}
                  <div className="sm:hidden flex gap-2">
                    <Button
                      variant={view === "chart" ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setView("chart")
                      }}
                      className="flex-1 gap-2 text-xs min-h-[44px] touch-manipulation"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Chart
                    </Button>
                    <Button
                      variant={view === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setView("table")
                      }}
                      className="flex-1 gap-2 text-xs min-h-[44px] touch-manipulation"
                    >
                      <Table2 className="h-4 w-4" />
                      Table
                    </Button>
                  </div>

                  {/* Chart View */}
                  {view === "chart" && (
                    <RevenueChart
                      sheetID={sheetID}
                      websiteName={selectedSheet}
                      dateRange={dateRange}
                    />
                  )}

                  {/* Table View */}
                  {view === "table" && (
                    <DataTable
                      sheetID={sheetID}
                      websiteName={selectedSheet}
                      dateRange={dateRange}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar - Date Filter (Desktop) */}
            <aside className="hidden lg:block w-80 border-l bg-card overflow-auto shrink-0">
              <div className="p-4 xl:p-6">
                <h2 className="text-lg font-semibold mb-4">Date Range</h2>
                <DateFilter onDateRangeChange={handleDateRangeChange} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
